import React, { useEffect, useState } from 'react';
import { Bell, BellOff, BellRing, Check, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotificationToggleProps {
  bookingId: string;
  pickupTime: Date;
  pickupLocation: string;
  compact?: boolean;
}

export function NotificationToggle({
  bookingId,
  pickupTime,
  pickupLocation,
  compact = false,
}: NotificationToggleProps) {
  const { language } = useLanguage();
  const {
    isSupported,
    permission,
    requestPermission,
    schedulePickupReminder,
    cancelPickupReminder,
    isReminderScheduled,
  } = usePushNotifications();

  const [isScheduled, setIsScheduled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsScheduled(isReminderScheduled(bookingId));
  }, [bookingId, isReminderScheduled]);

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      if (isScheduled) {
        cancelPickupReminder(bookingId);
        setIsScheduled(false);
        toast.success(language === 'gr' ? 'Η υπενθύμιση ακυρώθηκε' : 'Pickup reminder cancelled');
      } else {
        if (permission !== 'granted') {
          const granted = await requestPermission();
          if (!granted) {
            toast.error(
              language === 'gr' 
                ? 'Ενεργοποίησε τις ειδοποιήσεις για υπενθυμίσεις' 
                : 'Please enable notifications to receive pickup reminders'
            );
            return;
          }
        }

        const success = await schedulePickupReminder(
          bookingId,
          pickupTime,
          pickupLocation,
          60 // Remind 1 hour before
        );

        if (success) {
          setIsScheduled(true);
          toast.success(
            language === 'gr' 
              ? 'Θα ειδοποιηθείς 1 ώρα πριν' 
              : "You'll be notified 1 hour before pickup"
          );
        } else {
          toast.error(
            language === 'gr' 
              ? 'Δεν ήταν δυνατή η προγραμματισμένη υπενθύμιση' 
              : 'Could not schedule reminder. Pickup may be too soon.'
          );
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isPastPickup = new Date() > pickupTime;
  
  if (isPastPickup) {
    return null;
  }

  // Calculate time until pickup
  const msUntilPickup = pickupTime.getTime() - Date.now();
  const hoursUntilPickup = Math.floor(msUntilPickup / (1000 * 60 * 60));
  const minutesUntilPickup = Math.floor((msUntilPickup % (1000 * 60 * 60)) / (1000 * 60));

  const timeUntilText = hoursUntilPickup > 0 
    ? `${hoursUntilPickup}h ${minutesUntilPickup}m`
    : `${minutesUntilPickup}m`;

  if (compact) {
    return (
      <Button
        variant={isScheduled ? 'secondary' : 'outline'}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isScheduled ? (
          <>
            <BellRing className="h-4 w-4" />
            <span>{language === 'gr' ? 'Ενεργή' : 'Reminder On'}</span>
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            <span>{language === 'gr' ? 'Υπενθύμιση' : 'Remind Me'}</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
      isScheduled 
        ? 'bg-gradient-to-r from-olive/10 to-olive/5 border-olive/20' 
        : 'bg-gradient-to-r from-primary/5 to-transparent border-border'
    }`}>
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
            isScheduled 
              ? 'bg-olive/20' 
              : 'bg-primary/10'
          }`}>
            {isScheduled ? (
              <BellRing className="h-5 w-5 text-olive animate-pulse" />
            ) : (
              <Bell className="h-5 w-5 text-primary" />
            )}
            {isScheduled && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-olive rounded-full border-2 border-background" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground text-sm">
                {language === 'gr' ? 'Υπενθύμιση Παραλαβής' : 'Pickup Reminder'}
              </h4>
              {isScheduled && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-olive/20 text-olive font-medium">
                  {language === 'gr' ? 'Ενεργή' : 'Active'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {isScheduled
                ? (language === 'gr' 
                    ? `Θα ειδοποιηθείς 1 ώρα πριν · σε ${timeUntilText}` 
                    : `We'll notify you 1h before · in ${timeUntilText}`)
                : (language === 'gr' 
                    ? `Παραλαβή σε ${timeUntilText}` 
                    : `Pickup in ${timeUntilText}`)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Switch
            checked={isScheduled}
            onCheckedChange={handleToggle}
            disabled={isLoading}
            className={isScheduled ? 'data-[state=checked]:bg-olive' : ''}
          />
        </div>
      </div>
      
      {permission === 'denied' && (
        <div className="px-4 pb-3">
          <p className="text-xs text-destructive flex items-center gap-1.5">
            <BellOff className="w-3 h-3" />
            {language === 'gr' 
              ? 'Οι ειδοποιήσεις είναι απενεργοποιημένες. Ενεργοποίησέ τις στις ρυθμίσεις.' 
              : 'Notifications are blocked. Enable them in browser settings.'}
          </p>
        </div>
      )}
    </div>
  );
}
