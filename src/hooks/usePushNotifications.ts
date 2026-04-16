import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  isSubscribed: boolean;
}

interface ScheduledReminder {
  bookingId: string;
  pickupTime: Date;
  timerId?: number;
}

const REMINDER_STORAGE_KEY = 'liv-pickup-reminders';

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
  });
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);

  useEffect(() => {
    // Check if notifications are supported
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'default',
    }));

    // Register service worker
    if (isSupported) {
      registerServiceWorker();
      loadScheduledReminders();
    }
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Check if already subscribed
      const subscription = await (registration as any).pushManager?.getSubscription();
      setState(prev => ({ ...prev, isSubscribed: !!subscription }));
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const loadScheduledReminders = () => {
    try {
      const stored = localStorage.getItem(REMINDER_STORAGE_KEY);
      if (stored) {
        const reminders = JSON.parse(stored);
        setScheduledReminders(reminders);
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const saveScheduledReminders = (reminders: ScheduledReminder[]) => {
    try {
      localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error('Failed to save reminders:', error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      console.log('Notifications not supported');
      return false;
    }

    try {
      console.log('Requesting notification permission...');
      
      // Check if we're in an iframe (Lovable preview)
      const isInIframe = window !== window.top;
      if (isInIframe) {
        console.log('Running in iframe - notifications may be limited');
      }
      
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      setState(prev => ({ ...prev, permission }));
      
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }, [state.isSupported]);

  const showNotification = useCallback(async (title: string, options?: NotificationOptions & { vibrate?: boolean; playSound?: boolean }) => {
    if (!state.isSupported || Notification.permission !== 'granted') {
      return false;
    }

    try {
      // Vibrate if supported and requested
      if (options?.vibrate !== false && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 300]);
      }

      // Play notification sound
      if (options?.playSound !== false) {
        try {
          const audioContext = new AudioContext();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(988, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(1047, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        } catch (audioError) {
          console.log('Could not play notification sound:', audioError);
        }
      }

      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200, 100, 300],
        ...options,
      });
      return true;
    } catch (error) {
      console.error('Failed to show notification:', error);
      return false;
    }
  }, [state.isSupported]);

  const schedulePickupReminder = useCallback(async (
    bookingId: string,
    pickupTime: Date,
    pickupLocation: string,
    reminderMinutesBefore: number = 60
  ) => {
    if (!state.isSupported) {
      return false;
    }

    // Request permission if not granted
    if (Notification.permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    const now = new Date();
    const reminderTime = new Date(pickupTime.getTime() - reminderMinutesBefore * 60 * 1000);
    const msUntilReminder = reminderTime.getTime() - now.getTime();

    // Don't schedule if reminder time has passed
    if (msUntilReminder <= 0) {
      console.log('Reminder time has already passed');
      return false;
    }

    // Clear any existing reminder for this booking
    cancelPickupReminder(bookingId);

    // Schedule the notification
    const timerId = window.setTimeout(async () => {
      const minutesUntilPickup = Math.round((pickupTime.getTime() - Date.now()) / (60 * 1000));
      
      let body = '';
      if (minutesUntilPickup <= 60) {
        body = `Your pickup is in ${minutesUntilPickup} minutes at ${pickupLocation}`;
      } else {
        const hours = Math.round(minutesUntilPickup / 60);
        body = `Your pickup is in ${hours} hour${hours > 1 ? 's' : ''} at ${pickupLocation}`;
      }

      await showNotification('🚗 Pickup Reminder', {
        body,
        tag: `pickup-${bookingId}`,
        requireInteraction: true,
        data: { bookingId, url: `/trip?token=${bookingId}` },
      });

      // Remove from scheduled reminders
      setScheduledReminders(prev => {
        const updated = prev.filter(r => r.bookingId !== bookingId);
        saveScheduledReminders(updated);
        return updated;
      });
    }, msUntilReminder);

    // Store the reminder
    const newReminder: ScheduledReminder = {
      bookingId,
      pickupTime,
      timerId,
    };

    setScheduledReminders(prev => {
      const updated = [...prev.filter(r => r.bookingId !== bookingId), newReminder];
      saveScheduledReminders(updated);
      return updated;
    });

    console.log(`Pickup reminder scheduled for ${reminderTime.toLocaleString()}`);
    return true;
  }, [state.isSupported, requestPermission, showNotification]);

  const cancelPickupReminder = useCallback((bookingId: string) => {
    setScheduledReminders(prev => {
      const reminder = prev.find(r => r.bookingId === bookingId);
      if (reminder?.timerId) {
        window.clearTimeout(reminder.timerId);
      }
      const updated = prev.filter(r => r.bookingId !== bookingId);
      saveScheduledReminders(updated);
      return updated;
    });
  }, []);

  const isReminderScheduled = useCallback((bookingId: string) => {
    return scheduledReminders.some(r => r.bookingId === bookingId);
  }, [scheduledReminders]);

  return {
    ...state,
    requestPermission,
    showNotification,
    schedulePickupReminder,
    cancelPickupReminder,
    isReminderScheduled,
  };
}
