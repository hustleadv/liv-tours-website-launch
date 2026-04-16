import { useState } from "react";
import { CreditCard, Banknote, Clock, CheckCircle2, XCircle, RotateCcw, Wallet, Percent, Receipt, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TourPaymentStatusCardProps {
  paymentStatus?: 'pending' | 'paid' | 'deposit_paid' | 'failed' | 'refunded' | 'cash';
  paymentType?: 'full' | 'deposit' | 'cash';
  depositAmount?: number;
  finalPrice?: number;
  paidAt?: string;
  priceConfirmedAt?: string;
  requestId?: string;
  onPayDeposit?: () => void;
  onPayFull?: () => void;
  onConfirmPrice?: () => void;
}

const TourPaymentStatusCard = ({ 
  paymentStatus,
  paymentType,
  depositAmount,
  finalPrice,
  paidAt,
  priceConfirmedAt,
  requestId,
  onPayDeposit,
  onPayFull,
  onConfirmPrice,
}: TourPaymentStatusCardProps) => {
  const { language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate 30% deposit if not provided
  const calculatedDeposit = depositAmount || (finalPrice ? Math.ceil(finalPrice * 0.30) : 0);
  const remainingAmount = finalPrice ? finalPrice - calculatedDeposit : 0;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language === 'gr' ? 'el-GR' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handlePayDeposit = async () => {
    if (!requestId) {
      toast({
        title: language === 'gr' ? 'Σφάλμα' : 'Error',
        description: language === 'gr' ? 'Λείπει το ID κράτησης' : 'Missing booking ID',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('pay-tour-deposit', {
        body: { requestId }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast({
        title: language === 'gr' ? 'Σφάλμα Πληρωμής' : 'Payment Error',
        description: err.message || (language === 'gr' ? 'Αποτυχία δημιουργίας πληρωμής' : 'Failed to create payment'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Pending price confirmation - waiting for admin to set price
  if (!finalPrice && paymentStatus === 'pending') {
    return (
      <div className="rounded-xl border p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              {language === 'gr' ? 'Αναμονή Τιμολόγησης' : 'Awaiting Quote'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {language === 'gr' 
                ? 'Θα λάβετε σύντομα email με την τελική τιμή της εκδρομής σας.'
                : 'You will receive an email shortly with your final tour price.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Price confirmed, awaiting deposit payment
  if (finalPrice && priceConfirmedAt && paymentStatus === 'pending') {
    return (
      <div className="rounded-xl border p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-800">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300">
                {language === 'gr' ? 'Τιμή Επιβεβαιώθηκε' : 'Price Confirmed'}
              </h3>
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                €{finalPrice.toFixed(2)}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'gr' ? 'Προκαταβολή (30%)' : 'Deposit (30%)'}
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  €{calculatedDeposit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'gr' ? 'Υπόλοιπο στον οδηγό' : 'Remaining to driver'}
                </span>
                <span className="text-muted-foreground">
                  €{remainingAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <Button 
              onClick={handlePayDeposit}
              disabled={isProcessing}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'gr' ? 'Επεξεργασία...' : 'Processing...'}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {language === 'gr' 
                    ? `Πληρωμή Προκαταβολής €${calculatedDeposit.toFixed(2)}`
                    : `Pay Deposit €${calculatedDeposit.toFixed(2)}`
                  }
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-2">
              {language === 'gr' 
                ? 'Ασφαλής πληρωμή με Stripe'
                : 'Secure payment via Stripe'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Deposit paid - show remaining balance
  if (paymentStatus === 'deposit_paid' || (paymentStatus === 'paid' && paymentType === 'deposit')) {
    return (
      <div className="rounded-xl border p-4 bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-900/20 dark:to-amber-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-green-700 dark:text-green-300">
                {language === 'gr' ? 'Προκαταβολή Πληρώθηκε' : 'Deposit Paid'}
              </h3>
              <span className="text-lg font-bold text-green-700 dark:text-green-300">
                €{calculatedDeposit.toFixed(2)}
              </span>
            </div>

            {paidAt && (
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'gr' ? 'Πληρώθηκε στις' : 'Paid on'} {formatDate(paidAt)}
              </p>
            )}

            {remainingAmount > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                    {language === 'gr' 
                      ? `Υπόλοιπο €${remainingAmount.toFixed(2)} πληρωτέο στον οδηγό`
                      : `Remaining €${remainingAmount.toFixed(2)} due to driver`
                    }
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'gr' 
                    ? 'Μετρητά ή κάρτα στον οδηγό μετά την εκδρομή'
                    : 'Cash or card to driver after the tour'
                  }
                </p>
              </div>
            )}

            {finalPrice && (
              <div className="mt-3 p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {language === 'gr' ? 'Συνολικό κόστος εκδρομής' : 'Total tour cost'}
                  </span>
                  <span className="font-medium">€{finalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full payment completed
  if (paymentStatus === 'paid' && paymentType === 'full') {
    return (
      <div className="rounded-xl border p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 dark:bg-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-green-700 dark:text-green-300">
                {language === 'gr' ? 'Πλήρης Πληρωμή' : 'Fully Paid'}
              </h3>
              {finalPrice && (
                <span className="text-lg font-bold text-green-700 dark:text-green-300">
                  €{finalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {paidAt && (
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'gr' ? 'Πληρώθηκε στις' : 'Paid on'} {formatDate(paidAt)}
              </p>
            )}

            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              {language === 'gr' 
                ? 'Η εκδρομή σας είναι πλήρως εξοφλημένη. Απολαύστε!'
                : 'Your tour is fully paid. Enjoy!'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Cash payment
  if (paymentStatus === 'cash' || paymentType === 'cash') {
    return (
      <div className="rounded-xl border p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-800">
            <Banknote className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-amber-700 dark:text-amber-300">
                {language === 'gr' ? 'Πληρωμή στον Οδηγό' : 'Pay Driver'}
              </h3>
              {finalPrice && (
                <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
                  €{finalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
              {language === 'gr' 
                ? 'Έχετε μετρητά ή κάρτα έτοιμα για τον οδηγό'
                : 'Have cash or card ready for the driver'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Failed payment
  if (paymentStatus === 'failed') {
    return (
      <div className="rounded-xl border p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-800">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-red-700 dark:text-red-300">
              {language === 'gr' ? 'Αποτυχία Πληρωμής' : 'Payment Failed'}
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {language === 'gr' 
                ? 'Παρακαλώ επικοινωνήστε μαζί μας για να ολοκληρώσετε την πληρωμή'
                : 'Please contact us to complete your payment'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default: Price set but not confirmed yet (price sent to customer)
  if (finalPrice && !priceConfirmedAt) {
    return (
      <div className="rounded-xl border p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
            <Percent className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                {language === 'gr' ? 'Προσφορά Τιμής' : 'Price Quote'}
              </h3>
              <span className="text-lg font-bold text-primary">
                €{finalPrice.toFixed(2)}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'gr' ? 'Προκαταβολή (30%)' : 'Deposit (30%)'}
                </span>
                <span className="font-medium text-primary">
                  €{calculatedDeposit.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {language === 'gr' ? 'Υπόλοιπο στον οδηγό' : 'Remaining to driver'}
                </span>
                <span className="text-muted-foreground">
                  €{remainingAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-3">
              {language === 'gr' 
                ? 'Επιβεβαιώστε την τιμή για να προχωρήσετε την κράτηση.'
                : 'Confirm the price to proceed with your booking.'
              }
            </p>
            <Button 
              onClick={onConfirmPrice}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {language === 'gr' ? 'Αποδοχή & Επιβεβαίωση' : 'Accept & Confirm'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TourPaymentStatusCard;
