import { CheckCircle2, Circle, Clock, User, MapPin, Sparkles, CreditCard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface TripStatusTimelineProps {
  status: string;
  driverAssigned?: boolean;
  isTour?: boolean;
}

const TRANSFER_STEPS = [
  { key: 'pending', label: 'Received', labelGr: 'Ελήφθη', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', labelGr: 'Επιβεβαιώθηκε', icon: CheckCircle2 },
  { key: 'driver_assigned', label: 'Driver', labelGr: 'Οδηγός', icon: User },
  { key: 'completed', label: 'Pickup', labelGr: 'Παραλαβή', icon: MapPin },
];

const TOUR_STEPS = [
  { key: 'pending', label: 'Received', labelGr: 'Ελήφθη', icon: Clock },
  { key: 'price_sent', label: 'Quote Sent', labelGr: 'Προσφορά', icon: CreditCard },
  { key: 'awaiting', label: 'Awaiting', labelGr: 'Αναμονή', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', labelGr: 'Επιβεβαιώθηκε', icon: CheckCircle2 },
  { key: 'driver_assigned', label: 'Driver', labelGr: 'Οδηγός', icon: User },
];

const getStatusIndex = (status: string, driverAssigned?: boolean, isTour?: boolean): number => {
  if (isTour) {
    // Tour status flow: pending → price_sent → awaiting_confirmation → confirmed → driver
    // Driver assignment takes priority once assigned
    if (driverAssigned) return 4;
    switch (status) {
      case 'pending': return 0;
      case 'price_sent': return 1;
      case 'awaiting_confirmation': return 2;
      case 'confirmed': return 3;
      case 'driver_assigned': return 4;
      case 'declined': return -1;
      case 'cancelled': return -1;
      default: return 0;
    }
  }
  
  // Transfer status flow: pending → confirmed → driver → completed
  // Driver assignment takes priority over just "confirmed"
  if (driverAssigned) return 2; // Driver step
  switch (status) {
    case 'pending': return 0;
    case 'confirmed': return 1;
    case 'driver_assigned': return 2;
    case 'completed': return 3;
    case 'cancelled': return -1;
    default: return 0;
  }
};

const TripStatusTimeline = ({ status, driverAssigned, isTour = false }: TripStatusTimelineProps) => {
  const { language } = useLanguage();
  const STEPS = isTour ? TOUR_STEPS : TRANSFER_STEPS;
  const currentIndex = getStatusIndex(status, driverAssigned, isTour);

  if (status === 'cancelled') {
    return (
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-center">
        <p className="text-sm font-medium text-destructive">
          {language === 'gr' ? 'Η κράτηση ακυρώθηκε' : 'Booking cancelled'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      {/* Live indicator */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {language === 'gr' ? 'Κατάσταση' : 'Status'}
        </p>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          <span className="text-[10px] font-medium text-green-600 dark:text-green-400">LIVE</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative flex-1">
              {/* Connector line */}
              {index > 0 && (
                <div 
                  className={cn(
                    "absolute top-4 right-1/2 w-full h-0.5 -z-10",
                    isCompleted ? 'bg-accent' : 'bg-border'
                  )}
                  style={{ transform: 'translateX(50%)' }}
                />
              )}
              
              {/* Icon */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                isCompleted 
                  ? 'bg-accent text-accent-foreground' 
                  : isCurrent 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/20 ring-offset-2 ring-offset-card'
                    : 'bg-muted text-muted-foreground'
              )}>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className={cn("w-4 h-4", isCurrent && 'animate-pulse')} />
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-[10px] mt-2 text-center font-medium",
                isCurrent 
                  ? 'text-primary' 
                  : isCompleted 
                    ? 'text-foreground' 
                    : 'text-muted-foreground'
              )}>
                {language === 'gr' ? step.labelGr : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TripStatusTimeline;
