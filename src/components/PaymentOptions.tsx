import { useState } from "react";
import { CreditCard, Banknote, Loader2, Lock, Shield, Percent, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/tracking";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface PaymentOptionsProps {
  bookingId: string;
  customerEmail: string;
  customerName: string;
  amount: number; // Amount in EUR
  bookingType: 'transfer' | 'tour';
  pickup: string;
  dropoff: string;
  date: string;
  onPaymentStarted?: () => void;
  onSkip?: () => void;
}

const PaymentOptions = ({
  bookingId,
  customerEmail,
  customerName,
  amount,
  bookingType,
  pickup,
  dropoff,
  date,
  onPaymentStarted,
  onSkip,
}: PaymentOptionsProps) => {
  const { language } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<'online_full' | 'online_deposit' | 'cash'>('online_full');
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate 5% online discount for transfers, 10% for tours
  const isTransfer = bookingType === 'transfer';
  const discountPercent = isTransfer ? 0.05 : 0.10;
  const discountAmount = Math.ceil(amount * discountPercent);
  const discountedAmount = amount - discountAmount;
  
  // Calculate deposit for tours (30%)
  const depositAmount = Math.ceil(amount * 0.3);
  const discountedDeposit = Math.ceil(depositAmount * 0.9); // 10% off deposit for tours

  const handlePayOnline = async (paymentType: 'full' | 'deposit') => {
    setIsProcessing(true);
    
    const finalAmount = paymentType === 'deposit' ? discountedDeposit : discountedAmount;
    
    trackEvent('payment_initiated', {
      bookingId,
      paymentType,
      amount: finalAmount,
    });

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          bookingId,
          customerEmail,
          customerName,
          amount: finalAmount,
          originalAmount: amount,
          bookingType,
          paymentType,
          pickup,
          dropoff,
          date,
          applyDiscount: true,
          discountAmount: paymentType === 'deposit' ? (depositAmount - discountedDeposit) : discountAmount,
        },
      });

      if (error) throw error;

      if (data?.url) {
        onPaymentStarted?.();
        window.open(data.url, '_blank');
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: language === 'gr' ? 'Σφάλμα πληρωμής' : 'Payment error',
        description: language === 'gr' 
          ? 'Δεν ήταν δυνατή η εκκίνηση πληρωμής. Δοκιμάστε ξανά ή πληρώστε κατά την άφιξη.'
          : 'Could not initiate payment. Please try again or pay on arrival.',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'online_full') {
      handlePayOnline('full');
    } else if (paymentMethod === 'online_deposit') {
      handlePayOnline('deposit');
    } else {
      // Cash payment - just skip
      onSkip?.();
    }
  };

  return (
    <div className="space-y-4 md:space-y-5 animate-fade-in">
      <div className="text-center mb-3 md:mb-4">
        <h3 className="text-base md:text-lg font-semibold text-primary mb-1">
          {language === 'gr' ? 'Επιλογές Πληρωμής' : 'Payment Options'}
        </h3>
        <p className="text-xs md:text-sm text-muted-foreground">
          {language === 'gr' ? 'Επιλέξτε πώς θέλετε να πληρώσετε' : 'Choose how you\'d like to pay'}
        </p>
      </div>

      {/* Price Summary */}
      <div className="p-3 md:p-4 rounded-xl bg-accent/10 border border-accent/20 text-center">
        <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {language === 'gr' ? 'Συνολικό Ποσό' : 'Total Amount'}
        </p>
        <p className="text-2xl md:text-3xl font-bold text-primary">€{amount}</p>
      </div>

      <RadioGroup
        value={paymentMethod}
        onValueChange={(value) => setPaymentMethod(value as typeof paymentMethod)}
        className="space-y-2 md:space-y-3"
      >
        {/* Pay Online with Discount - RECOMMENDED */}
        <div className="relative">
          <RadioGroupItem
            value="online_full"
            id="online_full"
            className="peer sr-only"
          />
          <Label
            htmlFor="online_full"
            className={cn(
              "flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all",
              "peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5",
              "border-accent/50 bg-accent/5 hover:border-accent"
            )}
          >
            <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-accent mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm md:text-base text-foreground">
                  {language === 'gr' ? 'Πληρωμή Online' : 'Pay Online'}
                </p>
                <span className="text-[10px] md:text-xs font-bold text-white bg-accent px-1.5 md:px-2 py-0.5 rounded-full">
                  -{Math.round(discountPercent * 100)}% {language === 'gr' ? 'Έκπτωση' : 'OFF'}
                </span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {language === 'gr' ? 'Ασφαλής πληρωμή με κάρτα' : 'Secure card payment'}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1.5 md:gap-2">
                <span className="text-xs md:text-sm line-through text-muted-foreground">€{amount}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground hidden md:block" />
                <span className="text-sm md:text-base font-bold text-accent">€{discountedAmount}</span>
              </div>
              <p className="text-[10px] md:text-xs text-accent">
                {language === 'gr' ? `Εξοικονομείτε €${discountAmount}` : `Save €${discountAmount}`}
              </p>
            </div>
          </Label>
        </div>

        {/* Pay Deposit (for tours only) */}
        {bookingType === 'tour' && (
          <div className="relative">
            <RadioGroupItem
              value="online_deposit"
              id="online_deposit"
              className="peer sr-only"
            />
            <Label
              htmlFor="online_deposit"
              className="flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl border-2 border-border bg-card cursor-pointer transition-all hover:border-primary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
            >
              <Percent className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm md:text-base text-foreground">
                    {language === 'gr' ? 'Προκαταβολή 30%' : '30% Deposit'}
                  </p>
                  <span className="text-[10px] md:text-xs font-bold text-white bg-primary px-1.5 md:px-2 py-0.5 rounded-full">
                    -10% {language === 'gr' ? 'Έκπτωση' : 'OFF'}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                  {language === 'gr' ? 'Υπόλοιπο κατά την άφιξη' : 'Balance on arrival'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <span className="text-xs md:text-sm line-through text-muted-foreground">€{depositAmount}</span>
                  <span className="text-sm md:text-base font-bold text-primary">€{discountedDeposit}</span>
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  + €{amount - depositAmount} {language === 'gr' ? 'αργότερα' : 'later'}
                </p>
              </div>
            </Label>
          </div>
        )}

        {/* Pay Cash Option */}
        <div className="relative">
          <RadioGroupItem
            value="cash"
            id="cash"
            className="peer sr-only"
          />
          <Label
            htmlFor="cash"
            className="flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl border-2 border-border bg-card cursor-pointer transition-all hover:border-primary/30 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
          >
            <Banknote className="w-4 h-4 md:w-5 md:h-5 text-olive mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm md:text-base text-foreground">
                {language === 'gr' ? 'Πληρωμή στον Οδηγό' : 'Pay on Arrival'}
              </p>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {language === 'gr' ? 'Μετρητά ή κάρτα' : 'Cash or card to driver'}
              </p>
            </div>
            <span className="text-sm md:text-base font-medium text-muted-foreground flex-shrink-0">€{amount}</span>
          </Label>
        </div>
      </RadioGroup>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
        <Lock className="w-3 h-3 md:w-3.5 md:h-3.5" />
        <span>{language === 'gr' ? 'Ασφαλής πληρωμή με Stripe' : 'Secure payment powered by Stripe'}</span>
        <Shield className="w-3 h-3 md:w-3.5 md:h-3.5" />
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 md:space-y-3 pt-1 md:pt-2">
        <Button
          variant="hero"
          size="lg"
          className="w-full text-sm md:text-base h-11 md:h-12"
          onClick={handleConfirmPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {language === 'gr' ? 'Επεξεργασία...' : 'Processing...'}
            </>
          ) : paymentMethod === 'cash' ? (
            language === 'gr' ? 'Συνέχεια με Πληρωμή Μετρητοίς' : 'Continue with Cash Payment'
          ) : paymentMethod === 'online_deposit' ? (
            language === 'gr' ? `Πληρωμή €${discountedDeposit} Τώρα` : `Pay €${discountedDeposit} Deposit Now`
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              {language === 'gr' ? `Πληρωμή €${discountedAmount} Τώρα` : `Pay €${discountedAmount} Now`}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentOptions;
