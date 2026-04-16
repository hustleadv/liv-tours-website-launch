import { useState, useEffect } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  TourVibe, 
  TourDuration, 
  TourTimeSlot, 
  TourItinerary, 
  TourRequest 
} from "@/lib/tours";
import { trackEvent } from "@/lib/tracking";
import { useWeather } from "@/hooks/useWeather";
import { getWeatherLocation } from "@/lib/weatherLocations";
import VibeSelector from "./VibeSelector";
import TourDetailsForm from "./TourDetailsForm";
import ItinerarySelector from "./ItinerarySelector";
import TourSummary from "./TourSummary";
import { format } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";

interface TourBuilderWizardProps {
  onClose?: () => void;
  isModal?: boolean;
}

const TourBuilderWizard = ({ onClose, isModal = false }: TourBuilderWizardProps) => {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  
  // Step 1: Vibe
  const [selectedVibe, setSelectedVibe] = useState<TourVibe | null>(null);
  
  // Step 2: Details
  const [pickupArea, setPickupArea] = useState("");
  const [duration, setDuration] = useState<TourDuration | null>(null);
  const [customDuration, setCustomDuration] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<TourTimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  
  // Step 3: Itinerary
  const [selectedItinerary, setSelectedItinerary] = useState<TourItinerary | null>(null);
  
  // Step 4: Summary
  const [addons, setAddons] = useState<string[]>([]);

  useEffect(() => {
    trackEvent('tour_builder_open' as any);
  }, []);

  // Weather hook for the selected date and pickup location
  const weatherLocation = pickupArea ? getWeatherLocation(pickupArea) : null;
  const { forecast } = useWeather({
    location: weatherLocation || undefined,
    date: date ? format(date, 'yyyy-MM-dd') : undefined,
    enabled: !!date && !!pickupArea
  });

  const handleVibeSelect = (vibe: TourVibe) => {
    setSelectedVibe(vibe);
    trackEvent('tour_vibe_select' as any, { ctaType: vibe });
    
    // Auto-advance after small delay for visual feedback
    setTimeout(() => {
      setStep(2);
    }, 400);
  };

  const handleNext = () => {
    if (step === 1 && selectedVibe) {
      setStep(2);
    } else if (step === 2 && duration && groupSize) {
      trackEvent('tour_details_complete' as any);
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleItinerarySelect = (itinerary: TourItinerary) => {
    setSelectedItinerary(itinerary);
    trackEvent('tour_itinerary_select' as any, { ctaType: itinerary.id });
    setStep(4);
  };

  const handleCustomize = (itinerary: TourItinerary) => {
    setSelectedItinerary(itinerary);
    setNotes(notes ? `${notes}\n\nBased on ${itinerary.title} - please customize.` : `Based on ${itinerary.title} - please customize.`);
    setStep(4);
  };

  const getCurrentRequest = (): TourRequest => ({
    vibe: selectedVibe || 'custom',
    pickupArea,
    duration: duration || '6h',
    customDuration,
    groupSize,
    date: date ? format(date, 'dd MMM yyyy') : undefined,
    timeSlot: timeSlot || undefined,
    notes,
    selectedItinerary: selectedItinerary || undefined,
    addons,
  });

  const canProceed = () => {
    if (step === 1) return !!selectedVibe;
    if (step === 2) return !!duration && !!groupSize;
    return true;
  };

  const containerClass = isModal
    ? "max-h-[85vh] overflow-y-auto"
    : "min-h-[60vh]";

  return (
    <div className={containerClass}>
      {/* Header */}
      {isModal && (
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <span className="text-sm text-muted-foreground">{t.tourBuilder.step} {step} {t.tourBuilder.of} 4</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Step Indicator */}
      <div className="px-5 md:px-8 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            {t.tourBuilder.step} {step} {t.tourBuilder.of} 4
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s}
                className={`w-8 h-1.5 rounded-full transition-all ${
                  s <= step ? 'bg-accent' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-8 pt-2">
        {step === 1 && (
          <VibeSelector
            selectedVibe={selectedVibe}
            onSelect={handleVibeSelect}
          />
        )}

        {step === 2 && (
          <TourDetailsForm
            pickupArea={pickupArea}
            duration={duration}
            customDuration={customDuration}
            groupSize={groupSize}
            date={date}
            timeSlot={timeSlot}
            notes={notes}
            onPickupChange={setPickupArea}
            onDurationChange={setDuration}
            onCustomDurationChange={setCustomDuration}
            onGroupSizeChange={setGroupSize}
            onDateChange={setDate}
            onTimeSlotChange={setTimeSlot}
            onNotesChange={setNotes}
          />
        )}

        {step === 3 && selectedVibe && (
          <ItinerarySelector
            vibe={selectedVibe}
            selectedItinerary={selectedItinerary}
            onSelect={handleItinerarySelect}
            onCustomize={handleCustomize}
            weatherForecast={forecast}
          />
        )}

        {step === 4 && selectedItinerary && (
          <TourSummary
            request={getCurrentRequest()}
            itinerary={selectedItinerary}
            addons={addons}
            onAddonsChange={setAddons}
            onBack={() => setStep(3)}
            onSwitchVibe={() => {
              // Go back to vibe selection and clear beach vibe if weather is bad
              setSelectedVibe(null);
              setSelectedItinerary(null);
              setStep(1);
            }}
          />
        )}
      </div>

      {/* Footer Navigation - for steps 1-3 */}
      {step <= 3 && (
        <div className="p-5 md:p-8 pt-0">
          <div className="flex gap-3">
            {step > 1 && (
              <Button 
                variant="outline" 
                onClick={handleBack} 
                className="h-12 px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.tourBuilder.back}
              </Button>
            )}
            {step <= 2 && (
              <Button 
                variant="hero" 
                onClick={handleNext} 
                disabled={!canProceed()}
                className="flex-1 h-12"
              >
                {t.tourBuilder.continue}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TourBuilderWizard;
