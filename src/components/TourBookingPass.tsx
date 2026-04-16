import { Calendar, Clock, MapPin, Users, Sparkles, Navigation, Tag } from 'lucide-react';
import { BookingData } from '@/lib/booking';
import { useLanguage } from '@/contexts/LanguageContext';

interface TourBookingPassProps {
  booking: BookingData;
}

const VIBE_LABELS: Record<string, { en: string; gr: string; icon: string }> = {
  'beach': { en: 'Beach Lover', gr: 'Λάτρης Παραλίας', icon: '🏖️' },
  'adventure': { en: 'Adventure', gr: 'Περιπέτεια', icon: '🧗' },
  'culture': { en: 'Culture', gr: 'Πολιτισμός', icon: '🏛️' },
  'food': { en: 'Food & Wine', gr: 'Φαγητό & Κρασί', icon: '🍷' },
  'nature': { en: 'Nature', gr: 'Φύση', icon: '🌿' },
  'family': { en: 'Family', gr: 'Οικογένεια', icon: '👨‍👩‍👧‍👦' },
  'romantic': { en: 'Romantic', gr: 'Ρομαντικό', icon: '💕' },
  'surprise': { en: 'Surprise Me', gr: 'Εκπλήξτε με', icon: '✨' },
};

const TourBookingPass = ({ booking }: TourBookingPassProps) => {
  const { language } = useLanguage();
  
  const vibeInfo = booking.tourVibe ? VIBE_LABELS[booking.tourVibe.toLowerCase()] : null;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header with tour badge */}
      <div className="px-4 py-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === 'gr' ? 'Ιδιωτική Εκδρομή' : 'Private Tour'}
              </p>
              <p className="font-semibold text-sm text-foreground">
                {booking.itineraryTitle || (language === 'gr' ? 'Προσαρμοσμένη Εκδρομή' : 'Custom Tour')}
              </p>
            </div>
          </div>
          {vibeInfo && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-xs">
              {vibeInfo.icon} {language === 'gr' ? vibeInfo.gr : vibeInfo.en}
            </span>
          )}
        </div>
      </div>
      
      {/* Details Grid */}
      <div className="p-4 space-y-3">
        {/* Date & Time */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
            <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {language === 'gr' ? 'Ημερομηνία' : 'Date'}
              </p>
              <p className="text-sm font-medium text-foreground">
                {booking.preferredDate || booking.date || '-'}
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {language === 'gr' ? 'Ώρα' : 'Time'}
              </p>
              <p className="text-sm font-medium text-foreground">
                {booking.preferredTime || booking.time || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Pickup Area */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {language === 'gr' ? 'Περιοχή Παραλαβής' : 'Pickup Area'}
            </p>
            <p className="text-sm font-medium text-foreground truncate">
              {booking.pickupArea || booking.pickup || '-'}
            </p>
          </div>
        </div>

        {/* Group & Duration */}
        <div className="flex gap-3">
          <div className="flex-1 flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
            <Users className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {language === 'gr' ? 'Άτομα' : 'Group'}
              </p>
              <p className="text-sm font-medium text-foreground">
                {booking.groupSize || booking.passengers || '-'}
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-2 p-3 bg-muted/50 rounded-xl">
            <Navigation className="w-4 h-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {language === 'gr' ? 'Διάρκεια' : 'Duration'}
              </p>
              <p className="text-sm font-medium text-foreground">
                {booking.duration || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Addons */}
        {booking.addons && booking.addons.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl">
            <Tag className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {language === 'gr' ? 'Πρόσθετα' : 'Add-ons'}
              </p>
              <div className="flex flex-wrap gap-1">
                {booking.addons.map((addon, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                  >
                    {addon}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
            <p className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
              {language === 'gr' ? 'Σημειώσεις' : 'Notes'}
            </p>
            <p className="text-sm text-amber-900 dark:text-amber-300">
              {booking.notes}
            </p>
          </div>
        )}

        {/* Price Info */}
        {(booking.finalPrice || booking.estimatedTotal) && (
          <div className="pt-3 mt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {booking.finalPrice 
                  ? (language === 'gr' ? 'Τελική Τιμή' : 'Final Price')
                  : (language === 'gr' ? 'Εκτιμώμενη Τιμή' : 'Estimated Price')
                }
              </span>
              <span className="text-lg font-bold text-primary">
                €{booking.finalPrice || booking.estimatedTotal}
              </span>
            </div>
            {booking.depositAmount && booking.paymentStatus !== 'paid' && (
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'gr' 
                  ? `Προκαταβολή: €${booking.depositAmount}` 
                  : `Deposit: €${booking.depositAmount}`
                }
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TourBookingPass;
