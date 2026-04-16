import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  Check, 
  MessageCircle,
  Plane,
  Shield,
  Sparkles,
  Languages,
  ArrowRight,
  Mail,
  User,
  Phone,
  Loader2,
  Bookmark,
  BadgeCheck,
  Ban,
  CalendarX,
  Headphones,
  Banknote,
  CreditCard,
  Crown,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PhoneInput from "@/components/PhoneInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateWhatsAppLink, trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import { useSavedQuotes } from "@/hooks/useSmartBooking";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLoyaltyStatus, LoyaltyBadge } from "./LoyaltyBadge";
import { CHILD_SEAT_PRICE } from "./ContextualAddons";

interface QuoteSummaryProps {
  formData: {
    pickup: string;
    dropoff: string;
    date: string;
    time: string;
    passengers: string;
    luggage: string;
    vehicleType: string;
    childSeat: number;
    extraStop: boolean;
    meetGreet: boolean;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  estimatedPrice: string | null;
  priceAmount?: number;
  isFixedPrice?: boolean;
  isSubmitting?: boolean;
  errors?: Record<string, string>;
  hasReturnTrip?: boolean;
  onConfirm: (paymentMethod: 'online' | 'cash', applyDiscount?: boolean) => void;
  onBack: () => void;
  onInputChange: (field: string, value: string) => void;
}

const QuoteSummary = ({ 
  formData, 
  estimatedPrice, 
  priceAmount = 0,
  isFixedPrice = false,
  isSubmitting = false,
  errors = {},
  hasReturnTrip = false,
  onConfirm,
  onBack,
  onInputChange
}: QuoteSummaryProps) => {
  const { saveQuote, savedQuotes } = useSavedQuotes();
  const { language } = useLanguage();
  
  // Get loyalty status for automatic discount
  const loyaltyStatus = useLoyaltyStatus(formData.customerEmail);
  const loyaltyDiscountPercent = loyaltyStatus.discount; // 0.10 for VIP, 0.05 for loyal, 0 for others
  
  // Parse estimated price range to get average (e.g., "€55 – €120" -> 87.5)
  const getAveragePriceFromRange = (priceString: string): number => {
    // Match numbers in the string (handles €25, €85, etc.)
    const numbers = priceString.match(/\d+/g);
    if (numbers && numbers.length >= 2) {
      const min = parseInt(numbers[0]);
      const max = parseInt(numbers[1]);
      return Math.round((min + max) / 2);
    } else if (numbers && numbers.length === 1) {
      return parseInt(numbers[0]);
    }
    return 0;
  };
  
  // Use priceAmount if available (fixed price), otherwise calculate average from range
  const basePrice = priceAmount > 0 ? priceAmount : (estimatedPrice ? getAveragePriceFromRange(estimatedPrice) : 0);
  
  // Add child seat charges (€5 per seat for all booking types)
  const childSeatCharge = formData.childSeat * CHILD_SEAT_PRICE;
  const effectivePrice = basePrice + childSeatCharge;
  
  // Calculate discounts - 5% for online payment
  const onlineDiscountPercent = 0.05;
  const onlineDiscountAmount = Math.ceil(effectivePrice * onlineDiscountPercent);
  const discountedTotal = effectivePrice - onlineDiscountAmount;
  
  // VIP + Return Trip bonus: extra 5% discount for VIP customers booking return trip
  const vipReturnBonus = loyaltyStatus.level === 'vip' && hasReturnTrip ? 0.05 : 0;
  const totalCashDiscountPercent = loyaltyDiscountPercent + vipReturnBonus;
  
  // VIP/Loyalty discount ONLY applies to cash payment (+ return trip bonus for VIP)
  const loyaltyDiscountAmount = Math.ceil(effectivePrice * totalCashDiscountPercent);
  const cashDiscountedTotal = effectivePrice - loyaltyDiscountAmount;
  
  const extras: string[] = [];
  if (formData.childSeat > 0) extras.push(`Child seat ×${formData.childSeat}`);
  if (formData.extraStop) extras.push('Extra stop');
  if (formData.meetGreet) extras.push('Meet & Greet');

  const isAirport = formData.pickup.toLowerCase().includes('airport') || 
                    formData.dropoff.toLowerCase().includes('airport');

  // Check if this quote is already saved
  const isAlreadySaved = savedQuotes.some(
    q => q.pickup === formData.pickup && q.dropoff === formData.dropoff
  );

  const handleSaveQuote = () => {
    saveQuote({
      pickup: formData.pickup,
      dropoff: formData.dropoff,
      date: formData.date,
      time: formData.time,
      passengers: formData.passengers,
      vehicleType: formData.vehicleType,
      luggage: formData.luggage,
      childSeat: formData.childSeat,
      extraStop: formData.extraStop,
      meetGreet: formData.meetGreet,
    });
    toast({
      title: "Quote saved ✅",
      description: "You can resume this booking anytime from the homepage.",
    });
  };

  const whatsappLink = generateWhatsAppLink({
    pickup: formData.pickup,
    dropoff: formData.dropoff,
    date: formData.date,
    time: formData.time,
    passengers: formData.passengers,
    luggage: formData.luggage,
    vehicleType: formData.vehicleType,
    extras,
  });

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_click', {
      pickup: formData.pickup,
      dropoff: formData.dropoff,
      source: 'quote_summary'
    });
    window.open(whatsappLink, '_blank');
  };

  const inclusions = [
    ...(isAirport ? [{ icon: Plane, text: language === 'gr' ? "Παρακολούθηση πτήσης" : "Flight monitoring included" }] : []),
    { icon: Users, text: language === 'gr' ? "Υποδοχή στο σημείο παραλαβής" : "Meet & Greet at pickup" },
    { icon: Shield, text: language === 'gr' ? "Χωρίς κρυφές χρεώσεις" : "No hidden fees, fixed price" },
    { icon: Sparkles, text: language === 'gr' ? "Καθαρά, premium οχήματα" : "Clean, premium vehicles" },
    { icon: Languages, text: language === 'gr' ? "Αγγλόφωνοι οδηγοί" : "English-speaking drivers" },
  ];

  const vehicleLabels: Record<string, string> = {
    taxi: 'Taxi (Sedan)',
    minibus: 'Minibus',
    sedan: 'Sedan',
    minivan: 'Minivan',
  };

  // Check if form is valid for payment
  const isFormValid = formData.customerEmail.trim() && 
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail) &&
                      formData.customerName.trim();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* SECTION 1: Price Display (Most Important - First!) */}
      {estimatedPrice ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/20 to-primary/10 border border-accent/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {language === 'gr' ? 'Σταθερή Τιμή' : 'Fixed Price'}
              </p>
              <p className="text-3xl font-bold text-primary">{estimatedPrice}</p>
              {childSeatCharge > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  +€{childSeatCharge} {language === 'gr' ? 'παιδικό κάθισμα' : 'child seat'}
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                <BadgeCheck className="w-3 h-3" />
                {language === 'gr' ? 'Εγγύηση' : 'Guaranteed'}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* SECTION 2: Route Summary (Compact) */}
      <div className="p-3 rounded-xl bg-muted/50 border border-border">
        <div className="flex items-start gap-2">
          <div className="flex flex-col items-center py-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <div className="w-0.5 h-5 bg-border" />
            <div className="w-2 h-2 rounded-full bg-olive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{formData.pickup}</p>
            <p className="text-sm text-muted-foreground truncate">{formData.dropoff}</p>
          </div>
          <div className="text-right text-xs text-muted-foreground shrink-0">
            <p>{formData.date}</p>
            <p>{formData.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {formData.passengers}
          </span>
          <span className="flex items-center gap-1">
            <Car className="w-3 h-3" />
            {vehicleLabels[formData.vehicleType] || formData.vehicleType}
          </span>
          {extras.length > 0 && (
            <span className="text-accent">+{extras.length} extras</span>
          )}
        </div>
      </div>

      {/* SECTION 3: Customer Info (Quick - Email first) */}
      <div className="space-y-3 p-4 rounded-2xl bg-muted/50 border border-border">
        <p className="text-sm font-medium text-foreground">
          {language === 'gr' ? 'Τα στοιχεία σας' : 'Your Details'}
        </p>
        
        {/* Email FIRST - Most important */}
        <div>
          <Label htmlFor="customerEmail" className="text-sm font-medium">
            {language === 'gr' ? 'Email *' : 'Email *'}
          </Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="customerEmail"
              type="email"
              placeholder="email@example.com"
              value={formData.customerEmail}
              onChange={(e) => onInputChange("customerEmail", e.target.value)}
              className={cn("pl-10", errors.customerEmail && "border-destructive")}
              autoComplete="email"
            />
          </div>
          {errors.customerEmail && <p className="text-xs text-destructive mt-1">{errors.customerEmail}</p>}
        </div>

        {/* Name */}
        <div>
          <Label htmlFor="customerName" className="text-sm font-medium">
            {language === 'gr' ? 'Όνομα *' : 'Name *'}
          </Label>
          <div className="relative mt-1.5">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="customerName"
              placeholder={language === 'gr' ? 'Το όνομά σας' : 'Your name'}
              value={formData.customerName}
              onChange={(e) => onInputChange("customerName", e.target.value)}
              className={cn("pl-10", errors.customerName && "border-destructive")}
              autoComplete="name"
            />
          </div>
          {errors.customerName && <p className="text-xs text-destructive mt-1">{errors.customerName}</p>}
        </div>

        {/* Phone - Optional */}
        <div>
          <Label htmlFor="customerPhone" className="text-sm font-medium text-muted-foreground">
            {language === 'gr' ? 'Τηλέφωνο (προαιρετικό)' : 'Phone (optional)'}
          </Label>
          <div className="mt-1.5">
            <PhoneInput
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(val) => onInputChange("customerPhone", val)}
              placeholder="xxx xxx xxxx"
              autoComplete="tel"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: VIP/Loyalty Badge - Only show if discount applies */}
      {loyaltyStatus.level && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-400">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm text-emerald-700 dark:text-emerald-300">
                  {loyaltyStatus.level === 'vip' 
                    ? (language === 'gr' ? 'VIP Πελάτης' : 'VIP Customer')
                    : (language === 'gr' ? 'Πιστός Πελάτης' : 'Loyal Customer')}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-white">
                  -{Math.round(totalCashDiscountPercent * 100)}%
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                {language === 'gr' 
                  ? `Εξοικονομείτε €${loyaltyDiscountAmount} στην πληρωμή με μετρητά!`
                  : `Save €${loyaltyDiscountAmount} when paying driver!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: Payment Options - ONLY show for fixed prices */}
      {estimatedPrice && effectivePrice > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            {language === 'gr' ? 'Τρόπος πληρωμής:' : 'Payment method:'}
          </p>
          
          {/* Option 1: Pay Online & Get 5% Discount */}
          <div className="p-3 rounded-xl border-2 border-accent bg-accent/5 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                <span className="font-semibold text-sm">
                  {language === 'gr' ? 'Πληρωμή Online' : 'Pay Online'}
                </span>
              </div>
              <span className="text-xs font-bold text-white bg-accent px-2 py-1 rounded-full">
                -5% {language === 'gr' ? 'Έκπτωση' : 'OFF'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="line-through text-muted-foreground">€{effectivePrice}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="font-bold text-accent text-lg">€{discountedTotal}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'gr' 
                ? 'Ασφαλής πληρωμή με κάρτα'
                : 'Secure card payment'}
            </p>
            <Button 
              variant="hero" 
              size="lg" 
              className="w-full mt-2"
              onClick={() => onConfirm('online', true)}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'gr' ? 'Αποστολή...' : 'Processing...'}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  {language === 'gr' 
                    ? `Πληρωμή €${discountedTotal} Online` 
                    : `Pay €${discountedTotal} Online`}
                </>
              )}
            </Button>
          </div>

          {/* Option 2: Pay Driver (cash or card) */}
          <div className={cn(
            "p-3 rounded-xl border space-y-2",
            loyaltyDiscountPercent > 0 ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20" : "border-border bg-background"
          )}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Banknote className={cn("w-4 h-4", loyaltyDiscountPercent > 0 ? "text-emerald-600" : "text-muted-foreground")} />
                <span className="font-medium text-sm">
                  {language === 'gr' ? 'Πληρωμή στον Οδηγό (μετρητά ή κάρτα)' : 'Pay Driver (cash or card)'}
                </span>
              </div>
              {loyaltyDiscountPercent > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2 py-1 rounded-full">
                  -{Math.round(totalCashDiscountPercent * 100)}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              {loyaltyDiscountPercent > 0 ? (
                <>
                  <span className="line-through text-muted-foreground">€{effectivePrice}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="font-bold text-emerald-600">€{cashDiscountedTotal}</span>
                </>
              ) : (
                <span className="font-medium">€{effectivePrice}</span>
              )}
            </div>
            <Button 
              variant="outline" 
              size="lg" 
              className={cn(
                "w-full mt-1",
                loyaltyDiscountPercent > 0 && "border-emerald-300 hover:bg-emerald-50 dark:border-emerald-700"
              )}
              onClick={() => onConfirm('cash', false)}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'gr' ? 'Αποστολή...' : 'Processing...'}
                </>
              ) : (
                <>
                  {language === 'gr' ? 'Κράτηση Τώρα' : 'Book Now'}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* For routes without fixed price - Contact Only */}
      {!estimatedPrice && (
        <div className="space-y-3">
          <Button 
            variant="hero" 
            size="lg" 
            className="w-full"
            onClick={() => onConfirm('cash', false)}
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === 'gr' ? 'Αποστολή...' : 'Sending...'}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                {language === 'gr' ? 'Αποστολή Αιτήματος' : 'Send Request'}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Trust Badges - Compact */}
      <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-olive/5 border border-olive/10">
        {[
          { icon: BadgeCheck, text: language === 'gr' ? "Πιστοποιημένοι οδηγοί" : "Licensed drivers" },
          { icon: Ban, text: language === 'gr' ? "Χωρίς κρυφές χρεώσεις" : "No hidden fees" },
          { icon: CalendarX, text: language === 'gr' ? "Δωρεάν ακύρωση 24ω" : "Free cancel 24h" },
          { icon: Headphones, text: language === 'gr' ? "24/7 υποστήριξη" : "24/7 support" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2">
            <item.icon className="w-3.5 h-3.5 text-olive flex-shrink-0" />
            <span className="text-xs text-foreground leading-tight">{item.text}</span>
          </div>
        ))}
      </div>

      {/* What's Included - Collapsed */}
      <details className="group">
        <summary className="flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          <Check className="w-4 h-4 text-accent" />
          {language === 'gr' ? 'Τι περιλαμβάνεται' : "What's included"}
          <span className="text-xs ml-auto group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="grid grid-cols-1 gap-1.5 mt-2 pl-6">
          {inclusions.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="w-3 h-3 text-accent flex-shrink-0" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </details>

      {/* Footer Actions */}
      <div className="flex gap-2 pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 text-muted-foreground"
          onClick={onBack}
          disabled={isSubmitting}
        >
          {language === 'gr' ? '← Πίσω' : '← Back'}
        </Button>
        <Button 
          variant="whatsapp" 
          size="sm" 
          className="flex-1"
          onClick={handleWhatsAppClick}
          disabled={isSubmitting}
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default QuoteSummary;
