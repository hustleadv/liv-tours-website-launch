import { useState } from 'react';
import { Luggage, Sun, Camera, Footprints, Droplets, ShieldCheck, Sandwich, Umbrella, CreditCard, Smartphone, MapPin, Shirt, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface TripPackingTipsProps {
  bookingType?: 'transfer' | 'tour';
  isBeachDestination?: boolean;
  className?: string;
}

const TOUR_TIPS = [
  { icon: Camera, text: "Bring your camera for photo stops", textGr: "Πάρε την κάμερά σου για φωτογραφίες" },
  { icon: Footprints, text: "Comfortable walking shoes", textGr: "Άνετα παπούτσια για περπάτημα" },
  { icon: Sun, text: "Sunglasses and sunscreen", textGr: "Γυαλιά ηλίου και αντηλιακό" },
  { icon: Shirt, text: "Light layers for AC and outdoors", textGr: "Ελαφριά στρώματα ρούχων" },
  { icon: Smartphone, text: "Charged phone for maps and photos", textGr: "Φορτισμένο κινητό για χάρτες και φωτό" },
];

const TRANSFER_TIPS = [
  { icon: CreditCard, text: "Keep passport and documents handy", textGr: "Κράτα διαβατήριο και έγγραφα εύκαιρα" },
  { icon: Smartphone, text: "Have our WhatsApp number saved", textGr: "Κράτα τον αριθμό WhatsApp μας" },
  { icon: MapPin, text: "Know your hotel address", textGr: "Μάθε τη διεύθυνση του ξενοδοχείου σου" },
  { icon: ShieldCheck, text: "Keep valuables in carry-on", textGr: "Κράτα πολύτιμα στη χειραποσκευή" },
];

const BEACH_EXTRA_TIPS = [
  { icon: Droplets, text: "Pack swimsuit and towel", textGr: "Πάρε μαγιό και πετσέτα" },
  { icon: Umbrella, text: "Beach umbrella available on site", textGr: "Ομπρέλες διαθέσιμες στην παραλία" },
];

const TripPackingTips = ({ bookingType = 'transfer', isBeachDestination = false, className = '' }: TripPackingTipsProps) => {
  const { language } = useLanguage();
  const [isMinimized, setIsMinimized] = useState(false);
  
  const baseTips = bookingType === 'tour' ? TOUR_TIPS : TRANSFER_TIPS;
  const tips = isBeachDestination && bookingType === 'tour' 
    ? [...baseTips, ...BEACH_EXTRA_TIPS]
    : baseTips;

  return (
    <div className={`glass-card p-5 ${className}`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Luggage className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">
              {language === 'gr' ? 'Τι να Πάρεις Μαζί' : 'Quick Packing Tips'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {bookingType === 'tour'
                ? (language === 'gr' ? 'Για την εκδρομή σου' : 'For your tour day')
                : (language === 'gr' ? 'Για τη μεταφορά σου' : 'For your transfer')}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(!isMinimized);
          }}
        >
          {isMinimized ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>
      </div>

      {!isMinimized && (
        <>
          <div className="grid grid-cols-1 gap-2 mt-4">
            {tips.map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30"
              >
                <item.icon className="w-4 h-4 text-olive flex-shrink-0" />
                <p className="text-sm text-foreground">
                  {language === 'gr' ? item.textGr : item.text}
                </p>
              </div>
            ))}
          </div>

          {bookingType === 'tour' && (
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              💡 {language === 'gr' 
                ? 'Νερό, αναψυκτικά και σνακ παρέχονται δωρεάν!'
                : 'Water, soft drinks and snacks provided!'}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default TripPackingTips;
