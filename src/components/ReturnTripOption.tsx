import { useState } from "react";
import { RotateCcw, Calendar, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReturnTripOptionProps {
  enabled: boolean;
  returnDate?: Date;
  returnTime: string;
  onToggle: (enabled: boolean) => void;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  minDate?: Date;
  dropoffLocation?: string;
  isPortRoute?: boolean;
  isAirportRoute?: boolean;
}

const ReturnTripOption = ({
  enabled,
  returnDate,
  returnTime,
  onToggle,
  onDateChange,
  onTimeChange,
  minDate,
  dropoffLocation,
  isPortRoute = false,
  isAirportRoute = false,
}: ReturnTripOptionProps) => {
  const { language } = useLanguage();
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [timePopoverOpen, setTimePopoverOpen] = useState(false);
  
  // Generate dynamic text based on dropoff location
  const getReturnFromText = () => {
    if (dropoffLocation) {
      return language === 'gr' 
        ? `Κλείστε και την επιστροφή σας από ${dropoffLocation}`
        : `Book your return from ${dropoffLocation} too`;
    }
    // Fallback for port routes
    if (isPortRoute) {
      return language === 'gr' 
        ? 'Κλείστε και την επιστροφή σας από το λιμάνι'
        : 'Book your return from the port too';
    }
    return language === 'gr' 
      ? 'Κλείστε και την επιστροφή σας'
      : 'Book your return trip too';
  };
  
  const getDiscountText = () => {
    return language === 'gr' 
      ? 'Κλείστε και την επιστροφή και κερδίστε 5-10% έκπτωση!'
      : 'Book return trip & save 5-10% on total!';
  };

  return (
    <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 p-4 space-y-3">
      {/* Toggle Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
            <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <Label className="text-sm font-medium cursor-pointer">
              {language === 'gr' ? 'Επιστροφή' : 'Return Trip'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {getReturnFromText()}
            </p>
          </div>
        </div>
        <Switch 
          checked={enabled} 
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-blue-600"
        />
      </div>

      {/* Return Details - Shown when enabled */}
      {enabled && (
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200 dark:border-blue-800 animate-fade-in">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              {language === 'gr' ? 'Ημ. Επιστροφής' : 'Return Date'}
            </Label>
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 bg-background",
                    !returnDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-3.5 w-3.5" />
                  {returnDate ? format(returnDate, "dd MMM") : (language === 'gr' ? 'Επιλογή' : 'Select')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={returnDate}
                  onSelect={(d) => {
                    onDateChange(d);
                    if (d) setDatePopoverOpen(false);
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  disabled={(date) => date < (minDate || new Date())}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">
              {language === 'gr' ? 'Ώρα' : 'Time'}
            </Label>
            <Popover open={timePopoverOpen} onOpenChange={setTimePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left font-normal h-9 bg-background",
                    !returnTime && "text-muted-foreground"
                  )}
                >
                  <Clock className="mr-2 h-3.5 w-3.5" />
                  {returnTime || (language === 'gr' ? 'Επιλογή' : 'Select')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2 pointer-events-auto" align="start">
                <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
                  {Array.from({ length: 24 }, (_, h) => 
                    [0, 15, 30, 45].map(m => {
                      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                      return (
                        <Button
                          key={time}
                          variant={returnTime === time ? "default" : "ghost"}
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => {
                            onTimeChange(time);
                            setTimePopoverOpen(false);
                          }}
                        >
                          {time}
                        </Button>
                      );
                    })
                  ).flat()}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}

      {/* Discount note */}
      {enabled && (
        <p className="text-xs text-lime-700 dark:text-lime-400 bg-lime-100 dark:bg-lime-900/50 rounded-lg px-3 py-2 font-medium">
          🎉 {getDiscountText()}
        </p>
      )}
    </div>
  );
};

export default ReturnTripOption;
