import React from 'react';
import { Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { TravellerLevel } from '@/data/badges';
import { cn } from '@/lib/utils';

interface TravellerLevelCardProps {
  currentLevel: TravellerLevel;
  nextLevel: TravellerLevel | null;
  unlockedBadgesCount: number;
  totalBadges: number;
}

export function TravellerLevelCard({ 
  currentLevel, 
  nextLevel, 
  unlockedBadgesCount,
  totalBadges,
}: TravellerLevelCardProps) {
  const progressPercent = (unlockedBadgesCount / totalBadges) * 100;
  
  return (
    <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-5 text-primary-foreground">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-primary-foreground/70 uppercase tracking-wider">
              Traveller Level
            </p>
            <h3 className="text-xl font-bold text-primary-foreground">
              {currentLevel.name}
            </h3>
          </div>
        </div>
        
        {currentLevel.level > 0 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Level {currentLevel.level}</span>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-primary-foreground/70 mb-1">
          <span>Badges unlocked</span>
          <span>{unlockedBadgesCount} of {totalBadges}</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      
      {/* Next level hint */}
      {nextLevel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-primary-foreground/70">
            {nextLevel.badgesRequired - unlockedBadgesCount} more badges to
          </span>
          <span className="flex items-center gap-1 font-medium">
            {nextLevel.name}
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      )}
      
      {unlockedBadgesCount === totalBadges && (
        <p className="text-xs text-accent font-medium">
          You have unlocked all badges. True Local Soul.
        </p>
      )}
    </div>
  );
}
