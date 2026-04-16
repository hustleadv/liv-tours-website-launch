import { useMemo } from 'react';
import { Baby, MapPinPlus, UserCheck, Clock, Droplets, Wind, Minus, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

type BookingType = 'airport' | 'standard' | 'tour';

interface AddonConfig {
  id: string;
  icon: React.ReactNode;
  label: string;
  labelGr: string;
  description: string;
  descriptionGr: string;
  price: string;
  priceLabel: 'free' | 'paid';
  highlight?: boolean;
}

interface ContextualAddonsProps {
  bookingType: BookingType;
  isBeachDestination?: boolean;
  hasWindWarning?: boolean;
  hasRainWarning?: boolean;
  values: {
    childSeat: number; // Now a number for quantity
    extraStop: boolean;
    meetGreet: boolean;
    extraHour: boolean;
    coolerWaters: boolean;
  };
  onChange: (field: string, value: boolean | number) => void;
}

const CHILD_SEAT_PRICE = 5; // €5 per seat for non-tour bookings

const ALL_ADDONS: AddonConfig[] = [
  {
    id: 'meetGreet',
    icon: <UserCheck className="w-4 h-4" />,
    label: 'Meet & Greet',
    labelGr: 'Υποδοχή με πινακίδα',
    description: 'Driver waits at arrivals with your name sign',
    descriptionGr: 'Ο οδηγός περιμένει στις αφίξεις με πινακίδα',
    price: 'Free',
    priceLabel: 'free',
  },
  {
    id: 'extraStop',
    icon: <MapPinPlus className="w-4 h-4" />,
    label: 'Extra Stop',
    labelGr: 'Επιπλέον στάση',
    description: 'Free for up to 10 min (supermarket, ATM, hotel)',
    descriptionGr: 'Δωρεάν για έως 10\' στάση (σούπερ μάρκετ, ΑΤΜ)',
    price: 'Free',
    priceLabel: 'free',
  },
  {
    id: 'extraHour',
    icon: <Clock className="w-4 h-4" />,
    label: 'Extra Hour',
    labelGr: 'Επιπλέον ώρα',
    description: 'Extend your tour with an additional hour',
    descriptionGr: 'Επέκταση της περιήγησης κατά 1 ώρα',
    price: '+€35',
    priceLabel: 'paid',
  },
  {
    id: 'coolerWaters',
    icon: <Droplets className="w-4 h-4" />,
    label: 'Cooler with Waters',
    labelGr: 'Ψυγειάκι με νερά',
    description: 'Ice-cold water bottles for hot beach days',
    descriptionGr: 'Παγωμένα μπουκάλια νερού για τη θάλασσα',
    price: '+€5',
    priceLabel: 'paid',
  },
];

const getAddonsForBookingType = (bookingType: BookingType): string[] => {
  switch (bookingType) {
    case 'airport':
      return ['meetGreet', 'childSeat', 'extraStop'];
    case 'tour':
      return ['extraHour', 'extraStop', 'coolerWaters', 'childSeat'];
    case 'standard':
    default:
      return ['childSeat', 'extraStop'];
  }
};

const ContextualAddons = ({
  bookingType,
  isBeachDestination = false,
  hasWindWarning = false,
  hasRainWarning = false,
  values,
  onChange,
}: ContextualAddonsProps) => {
  const { language } = useLanguage();

  // Child seats are always €5/seat (available on request)
  const childSeatPrice = `+€${CHILD_SEAT_PRICE}/seat`;

  const relevantAddons = useMemo(() => {
    const addonIds = getAddonsForBookingType(bookingType);
    
    // Filter out childSeat from regular addons (we'll handle it separately)
    return ALL_ADDONS
      .filter(addon => addonIds.includes(addon.id))
      .map(addon => ({
        ...addon,
        // Highlight cooler for beach destinations
        highlight: addon.id === 'coolerWaters' && isBeachDestination,
      }));
  }, [bookingType, isBeachDestination]);

  // Check if we should show childSeat
  const showChildSeat = getAddonsForBookingType(bookingType).includes('childSeat');

  // Show weather note for beach destinations
  const showWeatherNote = isBeachDestination && (hasWindWarning || hasRainWarning);

  const handleChildSeatChange = (delta: number) => {
    const newValue = Math.max(0, Math.min(5, values.childSeat + delta));
    onChange('childSeat', newValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {language === 'gr' ? 'Πρόσθετες υπηρεσίες' : 'Extras'}
        </span>
        <span className="text-xs text-muted-foreground">
          {language === 'gr' ? 'Προαιρετικά' : 'Optional'}
        </span>
      </div>

      {/* Weather note for beach destinations */}
      {showWeatherNote && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800 text-xs">
          <Wind className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <span className="text-amber-700 dark:text-amber-300">
            {hasWindWarning
              ? (language === 'gr' 
                  ? 'Αέρας αναμένεται. Οι παραλίες μπορεί να έχουν κύματα.' 
                  : 'Wind expected. Beaches may be rough.')
              : (language === 'gr'
                  ? 'Πιθανή βροχή. Σκεφτείτε ευέλικτο πρόγραμμα.'
                  : 'Rain possible. Consider a flexible schedule.')}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {/* Child Seat with quantity selector */}
        {showChildSeat && (
          <div
            className="flex items-start gap-3 p-3 rounded-xl transition-all bg-muted/50 hover:bg-muted"
          >
            <div className="text-muted-foreground mt-0.5">
              <Baby className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {language === 'gr' ? 'Παιδικά καθίσματα' : 'Child Seats'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === 'gr' 
                  ? 'Βρεφικό, παιδικό ή booster κάθισμα' 
                  : 'Baby, toddler, or booster seat'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {childSeatPrice}
              </span>
              <div className="flex items-center gap-1 bg-background rounded-lg border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleChildSeatChange(-1)}
                  disabled={values.childSeat === 0}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">
                  {values.childSeat}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleChildSeatChange(1)}
                  disabled={values.childSeat >= 5}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Other addons (excluding childSeat which is handled above) */}
        {relevantAddons.filter(addon => addon.id !== 'childSeat').map((addon) => (
          <label
            key={addon.id}
            htmlFor={addon.id}
            className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${
              addon.highlight
                ? 'bg-accent/10 border border-accent/30 hover:bg-accent/15'
                : 'bg-muted/50 hover:bg-muted'
            }`}
          >
            <Checkbox
              id={addon.id}
              checked={values[addon.id as keyof Omit<typeof values, 'childSeat'>] || false}
              onCheckedChange={(checked) => onChange(addon.id, !!checked)}
              className="mt-0.5"
            />
            <div className={`flex-shrink-0 ${addon.highlight ? 'text-accent' : 'text-muted-foreground'}`}>
              {addon.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {language === 'gr' ? addon.labelGr : addon.label}
                </span>
                {addon.highlight && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/20 text-accent">
                    {language === 'gr' ? 'Προτείνεται' : 'Recommended'}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === 'gr' ? addon.descriptionGr : addon.description}
              </p>
            </div>
            <span className={`text-xs font-medium flex-shrink-0 ${
              addon.priceLabel === 'free' ? 'text-accent' : 'text-muted-foreground'
            }`}>
              {addon.price}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ContextualAddons;

// Export the price constant for use in price calculations
export { CHILD_SEAT_PRICE };
