import { CreditCard, Banknote, Clock, CheckCircle2, XCircle, RotateCcw, Wallet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

interface PaymentStatusCardProps {
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cash' | 'cash_collected';
  paymentType?: 'full' | 'deposit' | 'cash';
  paymentAmount?: number;
  paidAt?: string;
  totalAmount?: number;
  status?: string;
  onConfirmPrice?: () => void;
}

const PaymentStatusCard = ({ 
  paymentStatus, 
  paymentType, 
  paymentAmount,
  paidAt,
  totalAmount,
  status,
  onConfirmPrice
}: PaymentStatusCardProps) => {
  const { language } = useLanguage();

  if (!paymentStatus) return null;

  const getStatusConfig = () => {
    switch (paymentStatus) {
      case 'paid':
        return {
          icon: CheckCircle2,
          bgClass: 'bg-green-50 dark:bg-green-900/20',
          borderClass: 'border-green-200 dark:border-green-800',
          iconClass: 'text-green-600 dark:text-green-400',
          textClass: 'text-green-700 dark:text-green-300',
          label: language === 'gr' ? 'Πληρωμή Ολοκληρώθηκε' : 'Payment Completed',
        };
      case 'cash':
        return {
          icon: Banknote,
          bgClass: 'bg-amber-50 dark:bg-amber-900/20',
          borderClass: 'border-amber-200 dark:border-amber-800',
          iconClass: 'text-amber-600 dark:text-amber-400',
          textClass: 'text-amber-700 dark:text-amber-300',
          label: language === 'gr' ? 'Πληρωμή στον Οδηγό' : 'Pay Driver on Arrival',
        };
      case 'cash_collected':
        return {
          icon: Wallet,
          bgClass: 'bg-green-50 dark:bg-green-900/20',
          borderClass: 'border-green-200 dark:border-green-800',
          iconClass: 'text-green-600 dark:text-green-400',
          textClass: 'text-green-700 dark:text-green-300',
          label: language === 'gr' ? 'Μετρητά Εισπράχθηκαν' : 'Cash Collected',
        };
      case 'pending':
        return {
          icon: Clock,
          bgClass: 'bg-gray-50 dark:bg-gray-800',
          borderClass: 'border-gray-200 dark:border-gray-700',
          iconClass: 'text-gray-500 dark:text-gray-400',
          textClass: 'text-gray-600 dark:text-gray-300',
          label: language === 'gr' ? 'Αναμονή Πληρωμής' : 'Payment Pending',
        };
      case 'failed':
        return {
          icon: XCircle,
          bgClass: 'bg-red-50 dark:bg-red-900/20',
          borderClass: 'border-red-200 dark:border-red-800',
          iconClass: 'text-red-600 dark:text-red-400',
          textClass: 'text-red-700 dark:text-red-300',
          label: language === 'gr' ? 'Αποτυχία Πληρωμής' : 'Payment Failed',
        };
      case 'refunded':
        return {
          icon: RotateCcw,
          bgClass: 'bg-purple-50 dark:bg-purple-900/20',
          borderClass: 'border-purple-200 dark:border-purple-800',
          iconClass: 'text-purple-600 dark:text-purple-400',
          textClass: 'text-purple-700 dark:text-purple-300',
          label: language === 'gr' ? 'Επιστροφή Χρημάτων' : 'Refunded',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  const getPaymentTypeLabel = () => {
    if (!paymentType) return null;
    switch (paymentType) {
      case 'full':
        return language === 'gr' ? 'Πλήρης πληρωμή' : 'Full payment';
      case 'deposit':
        return language === 'gr' ? 'Προκαταβολή 20%' : '20% Deposit';
      case 'cash':
        return language === 'gr' ? 'Μετρητά' : 'Cash';
      default:
        return null;
    }
  };

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

  const remainingAmount = paymentType === 'deposit' && paymentAmount && totalAmount
    ? totalAmount - paymentAmount
    : null;

  return (
    <div className={`rounded-xl border p-4 ${config.bgClass} ${config.borderClass}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bgClass}`}>
          <Icon className={`w-5 h-5 ${config.iconClass}`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${config.textClass}`}>
              {config.label}
            </h3>
            {paymentAmount && paymentStatus === 'paid' && (
              <span className={`text-lg font-bold ${config.textClass}`}>
                €{paymentAmount.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-1 space-y-1">
            {getPaymentTypeLabel() && (
              <p className="text-sm text-muted-foreground">
                {getPaymentTypeLabel()}
              </p>
            )}
            
            {paidAt && (paymentStatus === 'paid' || paymentStatus === 'cash_collected') && (
              <p className="text-xs text-muted-foreground">
                {paymentStatus === 'cash_collected'
                  ? (language === 'gr' ? 'Εισπράχθηκε στις' : 'Collected on')
                  : (language === 'gr' ? 'Πληρώθηκε στις' : 'Paid on')
                } {formatDate(paidAt)}
              </p>
            )}

            {remainingAmount && remainingAmount > 0 && (
              <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-700">
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  <Banknote className="w-4 h-4 inline mr-1" />
                  {language === 'gr' 
                    ? `Υπόλοιπο €${remainingAmount.toFixed(2)} πληρωτέο στον οδηγό`
                    : `Remaining €${remainingAmount.toFixed(2)} due to driver`
                  }
                </p>
              </div>
            )}

            {paymentStatus === 'cash' && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {language === 'gr' 
                  ? 'Έχετε μετρητά ή κάρτα έτοιμα για τον οδηγό'
                  : 'Have cash or card ready for the driver'
                }
              </p>
            )}

            {paymentStatus === 'cash_collected' && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {language === 'gr' 
                  ? 'Η πληρωμή σας ολοκληρώθηκε επιτυχώς. Καλό ταξίδι!'
                  : 'Your payment has been completed successfully. Have a great trip!'
                }
              </p>
            )}

            {paymentStatus === 'failed' && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {language === 'gr' 
                  ? 'Παρακαλώ επικοινωνήστε μαζί μας για να ολοκληρώσετε την πληρωμή'
                  : 'Please contact us to complete your payment'
                }
              </p>
            )}

            {/* Price Confirmation for Transfers */}
            {status === 'pending' && totalAmount && totalAmount > 0 && !paidAt && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
                  {language === 'gr' ? '💰 Επιβεβαίωση Τιμής:' : '💰 Price Confirmation:'} €{totalAmount.toFixed(2)}
                </p>
                <Button 
                  onClick={onConfirmPrice}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {language === 'gr' ? 'Αποδοχή & Επιβεβαίωση' : 'Accept & Confirm'}
                </Button>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  {language === 'gr' 
                    ? 'Με την επιβεβαίωση αποδέχεστε την τιμή και η κράτηση οριστικοποιείται.' 
                    : 'By confirming you accept the price and the booking is finalized.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusCard;
