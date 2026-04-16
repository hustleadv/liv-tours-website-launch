import { useState } from "react";
import { MapPin, Clock, Users, Calendar, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TourDuration, TourTimeSlot, DURATION_OPTIONS } from "@/lib/tours";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { useLanguage } from "@/contexts/LanguageContext";

interface TourDetailsFormProps {
  pickupArea: string;
  duration: TourDuration | null;
  customDuration: string;
  groupSize: string;
  date: Date | undefined;
  timeSlot: TourTimeSlot | null;
  notes: string;
  onPickupChange: (value: string) => void;
  onDurationChange: (value: TourDuration) => void;
  onCustomDurationChange: (value: string) => void;
  onGroupSizeChange: (value: string) => void;
  onDateChange: (value: Date | undefined) => void;
  onTimeSlotChange: (value: TourTimeSlot) => void;
  onNotesChange: (value: string) => void;
}

const TourDetailsForm = ({
  pickupArea,
  duration,
  customDuration,
  groupSize,
  date,
  timeSlot,
  notes,
  onPickupChange,
  onDurationChange,
  onCustomDurationChange,
  onGroupSizeChange,
  onDateChange,
  onTimeSlotChange,
  onNotesChange,
}: TourDetailsFormProps) => {
  const { t } = useLanguage();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const TIME_SLOTS: { id: TourTimeSlot; label: string; time: string }[] = [
    { id: 'morning', label: t.tourBuilder.morning, time: '8:00 - 12:00' },
    { id: 'afternoon', label: t.tourBuilder.afternoon, time: '12:00 - 18:00' },
    { id: 'sunset', label: t.tourBuilder.sunset, time: '16:00 - 21:00' },
  ];

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="text-center mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-black tracking-tight mb-2 bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">{t.tourBuilder.tourDetails}</h2>
        <p className="text-sm md:text-base text-muted-foreground">{t.tourBuilder.tellUsMore}</p>
      </div>

      {/* Pickup Area */}
      <div>
        <Label className="text-sm font-medium flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-accent" />
          {t.tourBuilder.pickupArea}
        </Label>
        <LocationAutocomplete
          value={pickupArea}
          onChange={onPickupChange}
          placeholder={t.tourBuilder.pickupPlaceholder}
          className="h-11 md:h-12"
          hidePopularDestinations={true}
        />
        <p className="text-xs text-muted-foreground mt-1">{t.tourBuilder.pickupHint}</p>
      </div>

      {/* Duration */}
      <div>
        <Label className="text-sm font-medium flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-accent" />
          {t.tourBuilder.duration}
        </Label>
        <div className="grid grid-cols-4 gap-1.5 md:gap-2">
          {DURATION_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onDurationChange(opt.id)}
              className={cn(
                "py-2.5 md:py-3 px-2 md:px-4 rounded-lg md:rounded-xl border-2 text-xs md:text-sm font-medium transition-all",
                duration === opt.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border hover:border-accent/50"
              )}
            >
              {opt.id === 'custom' ? t.tourBuilder.other : opt.id}
            </button>
          ))}
        </div>
        {duration === 'custom' && (
          <Input
            placeholder={t.tourBuilder.customDurationPlaceholder}
            value={customDuration}
            onChange={(e) => onCustomDurationChange(e.target.value)}
            className="mt-2 h-11 md:h-12"
          />
        )}
      </div>

      {/* Group Size */}
      <div>
        <Label className="text-sm font-medium flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-accent" />
          {t.tourBuilder.groupSize}
        </Label>
        <div className="grid grid-cols-5 md:grid-cols-9 gap-1.5 md:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, '9+'].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onGroupSizeChange(n.toString())}
              className={cn(
                "py-2.5 md:py-3 rounded-lg md:rounded-xl border-2 text-xs md:text-sm font-medium transition-all",
                groupSize === n.toString()
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border hover:border-accent/50"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Date & Time Slot */}
      <div className="grid gap-4">
        <div>
          <Label className="text-sm font-medium flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-accent" />
            {t.tourBuilder.date}
          </Label>
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-11 md:h-12 justify-start text-left font-normal text-sm",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, "dd MMM yyyy") : t.tourBuilder.selectDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(selectedDate) => {
                  onDateChange(selectedDate);
                  setDatePickerOpen(false);
                }}
                initialFocus
                className="p-3 pointer-events-auto"
                disabled={(d) => d < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <Label className="text-sm font-medium mb-2 block">{t.tourBuilder.preferredTime}</Label>
          <div className="grid grid-cols-3 gap-1.5 md:gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.id}
                type="button"
                onClick={() => onTimeSlotChange(slot.id)}
                className={cn(
                  "py-2 md:py-2.5 px-2 rounded-lg md:rounded-xl border-2 text-[11px] md:text-xs font-medium transition-all",
                  timeSlot === slot.id
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:border-accent/50"
                )}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label className="text-sm font-medium flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-accent" />
          {t.tourBuilder.notes}
        </Label>
        <Textarea
          placeholder={t.tourBuilder.notesPlaceholder}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={2}
          className="text-sm"
        />
      </div>

      <div className="bg-olive/10 border border-olive/20 rounded-lg md:rounded-xl p-3 md:p-4 mt-4">
        <p className="text-xs md:text-sm text-foreground">
          <span className="font-semibold">{t.tourBuilder.quickConfirmation}</span> {t.tourBuilder.respondWhatsApp}
        </p>
      </div>
    </div>
  );
};

export default TourDetailsForm;
