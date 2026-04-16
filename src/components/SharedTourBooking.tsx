import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Users, 
  MapPin, 
  Phone, 
  User, 
  Mail,
  CreditCard, 
  ChevronRight, 
  Loader2,
  CalendarCheck,
  Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/PhoneInput";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { generateBookingId } from "@/lib/booking";

interface SharedTourBookingProps {
  tourId: string;
  tourTitle: string;
  onClose: () => void;
}

const SharedTourBooking = ({ tourId, tourTitle, onClose }: SharedTourBookingProps) => {
  const { language, t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingInventory, setIsCheckingInventory] = useState(false);
  const [remainingSeats, setRemainingSeats] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    date: "",
    passengers: "1",
    name: "",
    email: "",
    phone: "",
    pickup: "",
  });

  const pickupOptions = [
    { id: 'market', label: t.tours.sharedPickupMarket },
    { id: 'loca', label: t.tours.sharedPickupLoca },
    { id: 'creta_palm', label: t.tours.sharedPickupCretaPalm },
    { id: 'silk_oil', label: t.tours.sharedPickupSilkOil },
    { id: 'platanias', label: t.tours.sharedPickupPlatanias },
  ];

  // Calculate next 4 Wednesdays
  const getNextWednesdays = () => {
    const wednesdays = [];
    let date = new Date();
    // Start from today
    while (wednesdays.length < 4) {
      if (date.getDay() === 3) { // 3 = Wednesday
        wednesdays.push(new Date(date).toLocaleDateString('en-GB')); // DD/MM/YYYY
      }
      date.setDate(date.getDate() + 1);
    }
    return wednesdays;
  };

  const availableDates = getNextWednesdays();

  // Check inventory when date changes
  useEffect(() => {
    if (formData.date) {
      checkInventory(formData.date);
    }
  }, [formData.date]);

  const checkInventory = async (date: string) => {
    setIsCheckingInventory(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('passengers')
        .eq('date', date)
        .eq('booking_type', 'shared')
        .neq('status', 'cancelled');

      if (error) throw error;

      const totalPassengers = data?.reduce((sum, b) => sum + parseInt(b.passengers || "0"), 0) || 0;
      setRemainingSeats(20 - totalPassengers);
    } catch (err) {
      console.error("Error checking inventory:", err);
    } finally {
      setIsCheckingInventory(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.date) {
        toast({ title: "Please select a date", variant: "destructive" });
        return;
      }
      if (remainingSeats !== null && parseInt(formData.passengers) > remainingSeats) {
        toast({ title: `Only ${remainingSeats} seats remaining for this date`, variant: "destructive" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.name || !formData.phone || !formData.pickup) {
        toast({ title: "Please fill all fields", variant: "destructive" });
        return;
      }
      handlePayment();
    }
  };

  const handlePayment = async () => {
    setIsLoading(true);
    const bookingId = generateBookingId();
    
    try {
      // 1. Create pending booking
      const { error: bookingError } = await supabase.from('bookings').insert({
        booking_id: bookingId,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        date: formData.date,
        time: "09:00", // Fixed for shared tours
        pickup: formData.pickup,
        dropoff: "Shared Tour Return",
        passengers: formData.passengers,
        vehicle_type: "Shared Minivan",
        booking_type: 'shared',
        status: 'pending',
        payment_status: 'pending',
        payment_amount: 18 * parseInt(formData.passengers),
        total_amount: 38 * parseInt(formData.passengers),
        deposit_paid: 0
      });

      if (bookingError) throw bookingError;

      // 2. Redirect to Stripe
      const { data, error: payError } = await supabase.functions.invoke('create-payment', {
        body: {
          bookingId,
          customerEmail: formData.email,
          customerName: formData.name,
          amount: 18 * parseInt(formData.passengers),
          bookingType: 'shared',
          paymentType: 'deposit',
          pickup: formData.pickup,
          dropoff: tourTitle,
          date: formData.date
        },
      });

      if (payError) throw payError;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast({ 
        title: language === 'gr' ? "Σφάλμα κράτησης" : "Booking Error", 
        description: "Please try again later or contact support.",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-card rounded-[2.5rem] shadow-2xl overflow-hidden border border-border/50"
      >
        {/* Header with background image */}
        <div className="relative p-8 bg-primary overflow-hidden">
           {/* Elafonisi subtle background */}
           <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop" 
                alt="Elafonisi background" 
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
           </div>

           <div className="relative z-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <p className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-2">{t.nav.sharedTours}</p>
              <h3 className="text-2xl font-black text-white tracking-tight">{tourTitle}</h3>
              <button 
                onClick={onClose}
                className="absolute top-0 right-0 text-white/50 hover:text-white transition-colors"
                title="Close"
              >
                <Users className="w-5 h-5 rotate-45" />
              </button>
           </div>
        </div>

        {/* Progress bar */}
        <div className="flex h-1 bg-muted">
           <div className={cn("bg-accent transition-all duration-500", step === 1 ? "w-1/2" : "w-full")} />
        </div>

        <div className="p-8 md:p-10 space-y-8">
           <AnimatePresence mode="wait">
             {step === 1 ? (
               <motion.div 
                 key="step1"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="space-y-6"
               >
                  <div className="space-y-4">
                     <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        {t.tours.sharedBookingSelectDate}
                     </Label>
                     <div className="grid grid-cols-2 gap-3">
                        {availableDates.map(date => (
                          <button
                            key={date}
                            onClick={() => setFormData({...formData, date})}
                            className={cn(
                              "p-4 rounded-2xl border-2 transition-all text-left group",
                              formData.date === date 
                                ? "border-accent bg-accent/5 ring-4 ring-accent/10" 
                                : "border-border/50 hover:border-accent/30 hover:bg-muted/50"
                            )}
                          >
                             <p className={cn("text-xs font-black uppercase mb-1 transition-colors", formData.date === date ? "text-accent" : "text-muted-foreground")}>
                               {language === 'gr' ? 'Τετάρτη' : 'Wednesday'}
                             </p>
                             <p className="font-bold text-primary">{date}</p>
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <Users className="w-4 h-4 text-accent" />
                           {t.tours.sharedBookingPassengers}
                        </Label>
                        <div className="flex items-center gap-4 bg-muted/50 p-1 rounded-xl border border-border/50">
                           <button 
                             onClick={() => setFormData({...formData, passengers: Math.max(1, parseInt(formData.passengers) - 1).toString()})}
                             className="w-8 h-8 rounded-lg bg-card flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm"
                           >-</button>
                           <span className="font-black w-4 text-center">{formData.passengers}</span>
                           <button 
                             onClick={() => setFormData({...formData, passengers: Math.min(parseInt(formData.passengers) + 1, remainingSeats || 20).toString()})}
                             className="w-8 h-8 rounded-lg bg-card flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-sm"
                           >+</button>
                        </div>
                     </div>
                  </div>

                  {formData.date && (
                    <div className={cn(
                      "p-4 rounded-2xl border flex items-center justify-between",
                      remainingSeats === 0 ? "bg-red-50 border-red-100" : "bg-accent/5 border-accent/10"
                    )}>
                       <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full animate-pulse", remainingSeats === 0 ? "bg-red-500" : "bg-accent")} />
                          <p className="text-sm font-bold text-primary">
                             {isCheckingInventory ? t.tours.sharedBookingChecking : remainingSeats === 0 ? t.tours.sharedBookingFull : `${remainingSeats} ${t.tours.sharedBookingRemaining}`}
                          </p>
                       </div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Availability</p>
                    </div>
                  )}
               </motion.div>
             ) : (
               <motion.div 
                 key="step2"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="space-y-6"
               >
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.tours.sharedBookingFullName}</Label>
                     <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          placeholder="John Doe" 
                          className="pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:ring-accent"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.tours.sharedBookingEmail}</Label>
                     <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          type="email"
                          placeholder={t.tours.sharedBookingEmailPlaceholder} 
                          className="pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:ring-accent"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          required
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.tours.sharedBookingPhone}</Label>
                     <PhoneInput 
                        value={formData.phone}
                        onChange={value => setFormData({...formData, phone: value})}
                        className="h-14 rounded-2xl bg-muted/30"
                     />
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{t.tours.sharedBookingPickup}</Label>
                     <Select 
                       value={formData.pickup} 
                       onValueChange={value => setFormData({...formData, pickup: value})}
                     >
                        <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-border/50 focus:ring-accent pl-12 text-left relative touch-manipulation">
                           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                           <SelectValue placeholder={t.tours.sharedBookingPickupPlaceholder} />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-border/50 shadow-2xl z-[110]">
                           {pickupOptions.map(option => (
                             <SelectItem key={option.id} value={option.label} className="py-3 rounded-xl focus:bg-accent focus:text-white transition-colors cursor-pointer">
                               {option.label}
                             </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="p-4 rounded-2xl bg-olive/5 border border-olive/10 flex items-start gap-4">
                     <div className="w-8 h-8 rounded-lg bg-olive/10 flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-olive" />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-primary italic">{t.tours.sharedBookingDepositOnly}: €{18 * parseInt(formData.passengers)}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black leading-tight">
                          {t.tours.sharedBookingRemainingPay.replace('amount', '€' + (20 * parseInt(formData.passengers)))}
                        </p>
                     </div>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="flex gap-4">
              {step === 2 && (
                <Button 
                   variant="ghost" 
                   className="h-14 rounded-2xl px-6"
                   onClick={() => setStep(1)}
                   disabled={isLoading}
                >
                   Back
                </Button>
              )}
              <Button 
                onClick={handleNext}
                disabled={isLoading || isCheckingInventory || (step === 1 && (!formData.date || remainingSeats === 0))}
                className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg gap-3 shadow-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {step === 1 ? t.tours.sharedBookingNext : t.tours.sharedBookingPayConfirm}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </Button>
           </div>
           
           <div className="flex items-center justify-center gap-2 py-4 grayscale opacity-30">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
           </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SharedTourBooking;
