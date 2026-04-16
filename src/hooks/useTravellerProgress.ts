import { useState, useEffect, useCallback } from 'react';
import { CRETE_BADGES, TRAVELLER_LEVELS, Badge, TravellerLevel } from '@/data/badges';
import { getBookingHistory } from '@/lib/booking';
import { trackEvent } from '@/lib/tracking';

const PROGRESS_KEY = 'liv_traveller_progress';

export interface TravellerProgress {
  bookingsCount: number;
  destinationTags: Record<string, number>;
  uniqueDestinations: Record<string, Set<string>>;
  actions: {
    addedToCalendar: boolean;
    usedWhatsApp: boolean;
    leftReview: boolean;
    bookedReturnTrip: boolean;
  };
  unlockedBadges: string[];
  previousLevel: number;
}

const getInitialProgress = (): TravellerProgress => {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert uniqueDestinations back to Sets
      if (parsed.uniqueDestinations) {
        Object.keys(parsed.uniqueDestinations).forEach(key => {
          parsed.uniqueDestinations[key] = new Set(parsed.uniqueDestinations[key]);
        });
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading traveller progress:', e);
  }
  
  return {
    bookingsCount: 0,
    destinationTags: {},
    uniqueDestinations: {},
    actions: {
      addedToCalendar: false,
      usedWhatsApp: false,
      leftReview: false,
      bookedReturnTrip: false,
    },
    unlockedBadges: [],
    previousLevel: 0,
  };
};

export function useTravellerProgress() {
  const [progress, setProgress] = useState<TravellerProgress>(getInitialProgress);
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const [leveledUp, setLeveledUp] = useState<TravellerLevel | null>(null);

  // Calculate progress from booking history on mount
  useEffect(() => {
    const history = getBookingHistory();
    const newProgress = { ...progress };
    
    newProgress.bookingsCount = history.length;
    
    // Analyze destinations for tags
    history.forEach(booking => {
      const locations = `${booking.pickup} ${booking.dropoff}`.toLowerCase();
      
      // Check for tags
      const tagPatterns: Record<string, string[]> = {
        beach: ['balos', 'elafonisi', 'falassarna', 'beach', 'seitan', 'stavros', 'marathi'],
        oldtown: ['old town', 'chania old', 'rethymno old', 'heraklion old'],
        mountain: ['anogia', 'omalos', 'samaria', 'lassithi', 'plateau', 'mountain'],
        westcrete: ['chania', 'kissamos', 'falassarna', 'balos', 'elafonisi', 'platanias', 'agia marina'],
        village: ['anogia', 'archanes', 'margarites', 'vamos', 'gavalochori'],
      };
      
      Object.entries(tagPatterns).forEach(([tag, patterns]) => {
        if (patterns.some(p => locations.includes(p))) {
          newProgress.destinationTags[tag] = (newProgress.destinationTags[tag] || 0) + 1;
          
          // Track unique destinations
          if (!newProgress.uniqueDestinations[tag]) {
            newProgress.uniqueDestinations[tag] = new Set();
          }
          patterns.forEach(p => {
            if (locations.includes(p)) {
              newProgress.uniqueDestinations[tag].add(p);
            }
          });
        }
      });
    });
    
    setProgress(newProgress);
  }, []);

  // Save progress
  const saveProgress = useCallback((newProgress: TravellerProgress) => {
    try {
      // Convert Sets to arrays for storage
      const toStore = {
        ...newProgress,
        uniqueDestinations: Object.fromEntries(
          Object.entries(newProgress.uniqueDestinations).map(([k, v]) => [k, Array.from(v)])
        ),
      };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, []);

  // Check badge unlock conditions
  const checkBadgeUnlock = useCallback((badge: Badge, prog: TravellerProgress): boolean => {
    const { unlockCondition } = badge;
    
    switch (unlockCondition.type) {
      case 'bookingsCount':
        return prog.bookingsCount >= unlockCondition.value;
      
      case 'destinationTag':
        return (prog.destinationTags[unlockCondition.tag!] || 0) >= unlockCondition.value;
      
      case 'uniqueDestinations':
        const uniqueSet = prog.uniqueDestinations[unlockCondition.tag!];
        return uniqueSet ? uniqueSet.size >= unlockCondition.value : false;
      
      case 'action':
        return unlockCondition.actions!.some(action => 
          prog.actions[action as keyof typeof prog.actions]
        );
      
      case 'combined':
        return unlockCondition.actions!.every(action => 
          prog.actions[action as keyof typeof prog.actions]
        );
      
      default:
        return false;
    }
  }, []);

  // Get unlocked badges
  const getUnlockedBadges = useCallback((): Badge[] => {
    return CRETE_BADGES.filter(badge => 
      progress.unlockedBadges.includes(badge.id) || checkBadgeUnlock(badge, progress)
    );
  }, [progress, checkBadgeUnlock]);

  // Get current level
  const getCurrentLevel = useCallback((): TravellerLevel => {
    const unlockedCount = getUnlockedBadges().length;
    
    for (let i = TRAVELLER_LEVELS.length - 1; i >= 0; i--) {
      if (unlockedCount >= TRAVELLER_LEVELS[i].badgesRequired) {
        return TRAVELLER_LEVELS[i];
      }
    }
    
    return { level: 0, name: 'New Traveller', badgesRequired: 0, gemsUnlocked: 0 };
  }, [getUnlockedBadges]);

  // Get next level
  const getNextLevel = useCallback((): TravellerLevel | null => {
    const current = getCurrentLevel();
    const next = TRAVELLER_LEVELS.find(l => l.level === current.level + 1);
    return next || null;
  }, [getCurrentLevel]);

  // Record an action
  const recordAction = useCallback((action: keyof TravellerProgress['actions']) => {
    setProgress(prev => {
      const newProgress = {
        ...prev,
        actions: { ...prev.actions, [action]: true },
      };
      
      // Check for new badge unlocks
      CRETE_BADGES.forEach(badge => {
        if (!prev.unlockedBadges.includes(badge.id) && checkBadgeUnlock(badge, newProgress)) {
          newProgress.unlockedBadges = [...newProgress.unlockedBadges, badge.id];
          setNewlyUnlockedBadge(badge);
          trackEvent('badge_unlock' as any, { badgeId: badge.id });
        }
      });
      
      // Check for level up
      const prevLevel = getCurrentLevel().level;
      const newUnlockedCount = CRETE_BADGES.filter(b => 
        newProgress.unlockedBadges.includes(b.id) || checkBadgeUnlock(b, newProgress)
      ).length;
      
      const newLevel = TRAVELLER_LEVELS.find(l => 
        newUnlockedCount >= l.badgesRequired
      );
      
      if (newLevel && newLevel.level > prevLevel) {
        setLeveledUp(newLevel);
        trackEvent('level_up' as any, { level: newLevel.level, name: newLevel.name });
      }
      
      saveProgress(newProgress);
      return newProgress;
    });
  }, [checkBadgeUnlock, getCurrentLevel, saveProgress]);

  // Get featured badge (next to unlock)
  const getFeaturedBadge = useCallback((): { badge: Badge; progress: number } | null => {
    const unlocked = getUnlockedBadges();
    const unlockedIds = unlocked.map(b => b.id);
    
    const locked = CRETE_BADGES.filter(b => !unlockedIds.includes(b.id));
    if (locked.length === 0) return null;
    
    const badge = locked[0];
    let currentProgress = 0;
    
    switch (badge.unlockCondition.type) {
      case 'bookingsCount':
        currentProgress = (progress.bookingsCount / badge.unlockCondition.value) * 100;
        break;
      case 'destinationTag':
        currentProgress = ((progress.destinationTags[badge.unlockCondition.tag!] || 0) / badge.unlockCondition.value) * 100;
        break;
      default:
        currentProgress = 0;
    }
    
    return { badge, progress: Math.min(currentProgress, 99) };
  }, [progress, getUnlockedBadges]);

  // Clear newly unlocked badge notification
  const clearNewBadgeNotification = useCallback(() => {
    setNewlyUnlockedBadge(null);
  }, []);

  // Clear level up notification
  const clearLevelUpNotification = useCallback(() => {
    setLeveledUp(null);
  }, []);

  return {
    progress,
    getUnlockedBadges,
    getCurrentLevel,
    getNextLevel,
    getFeaturedBadge,
    recordAction,
    newlyUnlockedBadge,
    leveledUp,
    clearNewBadgeNotification,
    clearLevelUpNotification,
    allBadges: CRETE_BADGES,
    allLevels: TRAVELLER_LEVELS,
  };
}
