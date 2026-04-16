import { useState } from "react";
import { 
  ArrowRight, 
  MessageCircle, 
  Car, 
  MapPin, 
  Droplets, 
  Camera, 
  Lightbulb,
  Check,
  Clock,
  Users,
  Calendar,
  CreditCard,
  Percent,
  Banknote,
  Mail,
  User,
  Sparkles,
  Baby,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { 
  TourRequest, 
  TourItinerary, 
  TourDuration, 
  VIBE_OPTIONS, 
  DURATION_OPTIONS, 
  ADDON_OPTIONS,
  getTourWhatsAppLink
} from "@/lib/tours";
import { trackEvent } from "@/lib/tracking";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import WeatherDetails from "@/components/WeatherDetails";
import { getWeatherLocation } from "@/lib/weatherLocations";
import { parse, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface TourSummaryProps {
  request: TourRequest;
  itinerary: TourItinerary;
  addons: string[];
  onAddonsChange: (addons: string[]) => void;
  onBack: () => void;
  onSwitchVibe?: () => void;
}

const TourSummary = ({ request, itinerary, addons, onAddonsChange, onBack, onSwitchVibe }: TourSummaryProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentChoice, setShowPaymentChoice] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const vibeLabel = VIBE_OPTIONS.find(v => v.id === request.vibe)?.label || request.vibe;
  const durationLabel = DURATION_OPTIONS.find(d => d.id === request.duration)?.label || request.duration;

  const INCLUDED = [
    { icon: Car, text: t.tourBuilder.privateDriverVehicle },
    { icon: MapPin, text: t.tourBuilder.flexibleStops },
    { icon: Droplets, text: t.tourBuilder.acVehicle },
    { icon: Lightbulb, text: t.tourBuilder.localTipsRecommendations },
    { icon: Camera, text: t.tourBuilder.photoStops },
  ];

  // Estimated price - this would come from a more sophisticated pricing system
  const estimatedPrice = 150; // Base price, could be dynamic
  const depositAmount = Math.ceil(estimatedPrice * 0.3);
  const discountedDeposit = Math.ceil(depositAmount * 0.9);
  const discountSaved = depositAmount - discountedDeposit;

  const handlePayDeposit = async (applyDiscount: boolean) => {
    if (!customerEmail) {
      toast({
        title: t.tourBuilder.emailRequiredError,
        description: t.tourBuilder.enterEmailToProceed,
        variant: "destructive",
      });
      return;
    }

    setIsProcessingPayment(true);
    trackEvent('tour_pay_online_click' as any);

    try {
      const { data, error } = await supabase.functions.invoke('create-tour-deposit', {
        body: {
          customerEmail,
          customerName,
          estimatedTotal: estimatedPrice,
          tourTitle: itinerary.title,
          tourVibe: request.vibe,
          pickupArea: request.pickupArea,
          date: request.date,
          groupSize: request.groupSize,
          duration: request.duration,
          notes: request.notes,
          itineraryTitle: itinerary.title,
          addons,
          applyDiscount,
        },
      });

      if (error) throw error;

      if (data?.url) {
        toast({
          title: t.tourBuilder.redirectingPayment,
          description: t.tourBuilder.paySecurely.replace('{amount}', String(applyDiscount ? discountedDeposit : depositAmount)),
        });
        // Open Stripe checkout in same tab
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: t.tourBuilder.paymentError,
        description: error.message || t.tourBuilder.failedPaymentSession,
        variant: "destructive",
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Get weather location from itinerary or pickup area
  // Try to find a meaningful location from stops (skip generic ones like "Pickup", "Return")
  const getMainStop = () => {
    const meaningfulStops = itinerary.stops?.filter(s => 
      !s.toLowerCase().includes('pickup') && 
      !s.toLowerCase().includes('return') &&
      s.length > 3
    );
    return meaningfulStops?.[0]?.split('(')[0]?.trim() || request.pickupArea || 'Chania';
  };
  
  const weatherLocation = itinerary.weatherLocation || 
    getWeatherLocation(getMainStop());

  // Convert display date to API format (yyyy-MM-dd)
  const getWeatherDate = (): string | undefined => {
    if (!request.date) return undefined;
    try {
      // Try different date formats
      const formats = ['dd MMM yyyy', 'yyyy-MM-dd', 'dd/MM/yyyy', 'd MMM yyyy'];
      for (const fmt of formats) {
        try {
          const parsedDate = parse(request.date, fmt, new Date());
          if (!isNaN(parsedDate.getTime())) {
            return format(parsedDate, 'yyyy-MM-dd');
          }
        } catch {
          continue;
        }
      }
      // If it's already in yyyy-MM-dd format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(request.date)) {
        return request.date;
      }
      return undefined;
    } catch {
      return undefined;
    }
  };
  
  const weatherDate = getWeatherDate();

  const handleAddonToggle = (addonId: string) => {
    trackEvent('tour_addon_toggle' as any, { ctaType: addonId });
    if (addons.includes(addonId)) {
      onAddonsChange(addons.filter(a => a !== addonId));
    } else {
      onAddonsChange([...addons, addonId]);
    }
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    trackEvent('tour_request_submit' as any);
    
    toast({
      title: t.tourBuilder.tourRequestSubmitted,
      description: t.tourBuilder.confirmViaMins,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      // Could navigate to a confirmation page
      window.open(getTourWhatsAppLink(request), '_blank');
    }, 800);
  };

  const handleWhatsApp = () => {
    trackEvent('tour_whatsapp_click' as any);
    window.open(getTourWhatsAppLink(request), '_blank');
  };

  // Filter addons based on duration
  const availableAddons = ADDON_OPTIONS.filter(addon => {
    if (addon.id === 'sunset-addon' && request.duration === '4h') return true;
    if (addon.id === 'sunset-addon' && request.duration === '8h') return false;
    return true;
  });

  return (
    <div className="space-y-4 md:space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-2 md:mb-4">
        <h2 className="text-lg md:text-2xl font-black tracking-tight mb-1 bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">{t.tourBuilder.yourTour}</h2>
        <p className="text-xs md:text-sm text-muted-foreground">{t.tourBuilder.reviewConfirm}</p>
      </div>

      {/* Tour Details Card - Redesigned */}
      <div className="bg-gradient-to-br from-background via-background to-muted/30 rounded-2xl border border-border/50 shadow-lg overflow-hidden">
        {/* Header with emoji and title */}
        <div className="bg-primary/5 p-4 md:p-5 border-b border-border/50">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl md:text-3xl">{VIBE_OPTIONS.find(v => v.id === request.vibe)?.emoji}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] md:text-xs text-accent uppercase tracking-wider font-medium mb-0.5">{vibeLabel}</p>
              <h3 className="text-base md:text-lg font-bold text-primary leading-tight">{itinerary.title}</h3>
            </div>
          </div>
        </div>

        {/* Tour Info Grid */}
        <div className="p-4 md:p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-2.5 md:p-3 rounded-xl bg-muted/50">
              <Clock className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium">{durationLabel}</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 md:p-3 rounded-xl bg-muted/50">
              <Users className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-xs md:text-sm font-medium">{request.groupSize} {t.tourBuilder.people}</span>
            </div>
            {request.pickupArea && (
              <div className="flex items-center gap-2.5 p-2.5 md:p-3 rounded-xl bg-muted/50 col-span-2">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium truncate">{request.pickupArea}</span>
              </div>
            )}
            {request.date && (
              <div className="flex items-center gap-2.5 p-2.5 md:p-3 rounded-xl bg-muted/50 col-span-2">
                <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">{request.date}</span>
              </div>
            )}
          </div>

          {/* Weather Forecast - Always show if we have location */}
          {weatherLocation && (
            <div className="mt-4 p-3 md:p-4 rounded-xl bg-muted/30 border border-border/50">
              <WeatherDetails 
                location={weatherLocation}
                date={weatherDate || format(new Date(), 'yyyy-MM-dd')}
                tourVibe={vibeLabel}
                onSwitchItinerary={onSwitchVibe}
              />
            </div>
          )}

          {request.notes && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
              <p className="text-xs md:text-sm text-amber-800 dark:text-amber-200">
                <span className="font-semibold">{t.tourBuilder.notesLabel}</span> {request.notes}
              </p>
            </div>
          )}
        </div>

        {/* What's Included */}
        <div className="p-4 md:p-5 border-t border-border/50">
          <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-wider">{t.tourBuilder.included}</p>
          <div className="grid grid-cols-2 gap-2">
            {INCLUDED.map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-[11px] md:text-xs text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-olive/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-3 h-3 text-olive" />
                </div>
                <span className="truncate">{item.text}</span>
              </div>
            ))}
          </div>
          {/* Refreshments block */}
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-olive/10 to-accent/10 border border-olive/20">
            <p className="text-[11px] md:text-xs text-olive font-medium flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{t.tourBuilder.freeRefreshments}</span>
            </p>
          </div>
        </div>

        {/* Pricing Footer */}
        <div className="p-4 md:p-5 bg-gradient-to-r from-primary/5 to-accent/5 border-t border-border/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">{t.tourBuilder.estimatedPrice}</p>
              <p className="text-xl md:text-2xl font-bold text-primary">{t.tourBuilder.from} €150</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] md:text-xs text-muted-foreground max-w-[120px]">
                {t.tourBuilder.finalPriceWhatsApp}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add-ons Card - Redesigned */}
      <div className="bg-background rounded-2xl border border-border/50 shadow-md overflow-hidden">
        <div className="p-4 md:p-5 border-b border-border/50 bg-gradient-to-r from-accent/5 to-olive/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">{t.tourBuilder.extraOptions}</p>
              <p className="text-[10px] text-muted-foreground">{t.tourBuilder.enhanceExperience || 'Enhance your experience'}</p>
            </div>
          </div>
        </div>
        <div className="p-3 md:p-4 grid gap-2">
          {availableAddons.map((addon) => {
            const isSelected = addons.includes(addon.id);
            return (
              <label 
                key={addon.id}
                className={cn(
                  "flex items-center gap-3 cursor-pointer p-3 md:p-4 rounded-xl transition-all border-2",
                  isSelected 
                    ? "border-accent bg-gradient-to-r from-accent/10 to-accent/5 shadow-sm" 
                    : "border-transparent bg-muted/30 hover:bg-muted/50 hover:border-border"
                )}
              >
                <div className={cn(
                  "w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                  isSelected ? "bg-accent text-white" : "bg-muted/80"
                )}>
                  {addon.id === 'child-seat' && <Baby className="w-5 h-5" />}
                  {addon.id === 'extra-hour' && <Clock className="w-5 h-5" />}
                  {addon.id === 'sunset-addon' && <Sun className="w-5 h-5" />}
                  {addon.id === 'extra-stop' && <MapPin className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-accent" : "text-foreground"
                    )}>{addon.label}</p>
                    {addon.priceNote && (
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium",
                        addon.priceNote.toLowerCase().includes('free') 
                          ? "bg-olive/20 text-olive" 
                          : "bg-accent/10 text-accent"
                      )}>
                        {addon.priceNote}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                </div>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => handleAddonToggle(addon.id)}
                  className="h-5 w-5"
                />
              </label>
            );
          })}
        </div>
        {addons.length > 0 && (
          <div className="px-4 pb-4 md:px-5 md:pb-5">
            <div className="p-3 rounded-xl bg-olive/10 border border-olive/20">
              <p className="text-xs text-olive font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                {t.tourBuilder.extrasConfirmed}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {!showPaymentChoice ? (
        <div className="flex flex-col gap-3 pt-2">
          <Button 
            variant="hero" 
            size="lg" 
            className="w-full text-sm md:text-base h-12 md:h-14 rounded-xl shadow-lg"
            onClick={() => setShowPaymentChoice(true)}
          >
            {t.tourBuilder.continueBtn}
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
          <Button 
            variant="whatsapp" 
            size="default" 
            className="w-full text-sm h-11 md:h-12 rounded-xl"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
            {t.tourBuilder.confirmWhatsApp}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-xs md:text-sm text-muted-foreground"
            onClick={onBack}
          >
            {t.tourBuilder.backToItineraries}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Customer Details for Payment */}
          <div className="bg-background rounded-2xl border border-border/50 shadow-md overflow-hidden">
            <div className="p-4 md:p-5 border-b border-border/50 bg-muted/30">
              <h4 className="text-xs font-semibold text-primary uppercase tracking-wider">{t.tourBuilder.yourDetails}</h4>
            </div>
            <div className="p-4 md:p-5 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {t.tourBuilder.emailRequired}
                </Label>
                <Input
                  type="email"
                  placeholder={t.tourBuilder.emailPlaceholder}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-11 text-sm rounded-xl"
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                  <User className="w-3.5 h-3.5" />
                  {t.tourBuilder.nameOptional}
                </Label>
                <Input
                  type="text"
                  placeholder={t.tourBuilder.namePlaceholder}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-11 text-sm rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Deposit Info Card */}
          <div className="bg-gradient-to-br from-primary/5 to-muted/50 rounded-2xl border border-border/50 p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{t.tourBuilder.estimatedPrice}</span>
              <span className="text-lg md:text-xl font-bold text-primary">{t.tourBuilder.from} €{estimatedPrice}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border/50">
              <span className="text-xs md:text-sm font-medium">{t.tourBuilder.deposit30}</span>
              <span className="text-lg md:text-xl font-bold text-accent">€{depositAmount}</span>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-2">
              {t.tourBuilder.finalPriceConfirmed}
            </p>
          </div>

          {/* Online Payment Discount Banner */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-accent bg-gradient-to-r from-accent/10 to-olive/10 p-4 md:p-5">
            <div className="absolute top-0 right-0 w-20 h-20 bg-accent/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Percent className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm md:text-base font-bold text-accent mb-1">
                  {t.tourBuilder.saveOnDeposit.replace('{amount}', `€${discountSaved}`)}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {t.tourBuilder.payOnlineDiscount}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full text-sm md:text-base h-12 md:h-14 rounded-xl shadow-lg relative overflow-hidden"
              onClick={() => handlePayDeposit(true)}
              disabled={isProcessingPayment || !customerEmail}
            >
              <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
              {isProcessingPayment ? "..." : t.tourBuilder.payOnline}
              <span className="ml-2 px-2.5 py-1 bg-white/20 rounded-lg text-xs font-bold">
                €{discountedDeposit}
              </span>
            </Button>
            
            <div className="relative flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full text-sm md:text-base h-11 md:h-12 rounded-xl"
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              <Banknote className="w-4 h-4 md:w-5 md:h-5" />
              {isSubmitting ? "..." : t.tourBuilder.payLater}
            </Button>
            <p className="text-[10px] md:text-xs text-center text-muted-foreground">
              {t.tourBuilder.cashOnArrival}
            </p>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            className="w-full text-xs md:text-sm text-muted-foreground"
            onClick={() => setShowPaymentChoice(false)}
          >
            ← {t.tourBuilder.back}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TourSummary;
