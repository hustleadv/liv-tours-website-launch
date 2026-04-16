import { useState } from 'react';
import { RefreshCw, MapPin, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TourItinerary, ITINERARIES, TourVibe } from '@/lib/tours';
import { useLanguage } from '@/contexts/LanguageContext';

export type WeatherCondition = 'cold' | 'windy' | 'rainy' | 'good';

interface SmartAlternativesProps {
  weatherCondition: WeatherCondition;
  currentItinerary?: TourItinerary;
  onSwitchItinerary?: (itinerary: TourItinerary) => void;
  className?: string;
}

// Map beach vibes to indoor/protected alternatives
const ALTERNATIVE_VIBES: Record<TourVibe, TourVibe[]> = {
  'beach': ['culture', 'food-wine', 'adventure'],
  'sunset': ['food-wine', 'culture'],
  'family': ['culture', 'food-wine'],
  'adventure': ['culture', 'food-wine'],
  'culture': ['food-wine', 'adventure'],
  'food-wine': ['culture', 'adventure'],
  'romantic': ['food-wine', 'culture', 'sunset'],
  'custom': ['culture', 'food-wine', 'adventure'],
};

// Get weather-appropriate alternatives
const getAlternativeItineraries = (
  weatherCondition: WeatherCondition,
  currentItinerary?: TourItinerary
): TourItinerary[] => {
  // If good weather, no alternatives needed
  if (weatherCondition === 'good') return [];
  
  // For bad weather, suggest indoor/protected options
  const protectedVibes: TourVibe[] = ['culture', 'food-wine'];
  
  // Get current vibes to avoid suggesting same type
  const currentVibes = currentItinerary?.vibes || ['beach'];
  
  // Filter itineraries that are:
  // 1. Not the current one
  // 2. Have protected vibes (culture, food-wine)
  // 3. Different from current vibes
  const alternatives = ITINERARIES.filter(itinerary => {
    // Skip current itinerary
    if (currentItinerary && itinerary.id === currentItinerary.id) return false;
    
    // Must have at least one protected vibe
    const hasProtectedVibe = itinerary.vibes.some(v => protectedVibes.includes(v));
    
    // Prefer different vibes from current
    const isDifferent = !itinerary.vibes.some(v => currentVibes.includes(v));
    
    return hasProtectedVibe && isDifferent;
  });
  
  // Return top 2 alternatives
  return alternatives.slice(0, 2);
};

const SmartAlternatives = ({ 
  weatherCondition, 
  currentItinerary, 
  onSwitchItinerary,
  className = '' 
}: SmartAlternativesProps) => {
  const { language } = useLanguage();
  const [selectedAlt, setSelectedAlt] = useState<string | null>(null);
  
  const alternatives = getAlternativeItineraries(weatherCondition, currentItinerary);
  
  // Don't show if good weather or no alternatives
  if (weatherCondition === 'good' || alternatives.length === 0) return null;
  
  const getConditionLabel = () => {
    switch (weatherCondition) {
      case 'cold':
        return language === 'gr' ? 'Κρύα μέρα' : 'Cold day';
      case 'windy':
        return language === 'gr' ? 'Αέρας' : 'Windy day';
      case 'rainy':
        return language === 'gr' ? 'Πιθανή βροχή' : 'High chance of rain';
      default:
        return '';
    }
  };
  
  const getConditionIcon = () => {
    switch (weatherCondition) {
      case 'cold': return '🧥';
      case 'windy': return '💨';
      case 'rainy': return '🌧️';
      default: return '☀️';
    }
  };

  const handleSwitch = (itinerary: TourItinerary) => {
    setSelectedAlt(itinerary.id);
    onSwitchItinerary?.(itinerary);
  };

  return (
    <div className={`rounded-xl overflow-hidden border border-accent/20 bg-gradient-to-br from-accent/5 to-accent/10 ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-accent/10 border-b border-accent/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {language === 'gr' ? 'Έξυπνη Εναλλακτική' : 'Smart Alternative'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs">
                {getConditionIcon()} {getConditionLabel()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {language === 'gr' 
                ? 'Προτεινόμενα προγράμματα για τις καιρικές συνθήκες'
                : 'Suggested itineraries for the weather conditions'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Alternative Itineraries */}
      <div className="p-4 space-y-3">
        {alternatives.map((itinerary) => (
          <div 
            key={itinerary.id}
            className={`p-4 rounded-xl bg-card border transition-all ${
              selectedAlt === itinerary.id 
                ? 'border-accent shadow-md ring-2 ring-accent/20' 
                : 'border-border hover:border-accent/50 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Vibe Tags */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {itinerary.vibes.slice(0, 2).map((vibe) => (
                    <span 
                      key={vibe}
                      className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full"
                    >
                      {vibe === 'culture' ? '🏛️' : vibe === 'food-wine' ? '🍷' : '🥾'} {vibe}
                    </span>
                  ))}
                </div>
                
                {/* Title */}
                <h4 className="font-semibold text-primary text-sm mb-1 truncate">
                  {itinerary.title}
                </h4>
                
                {/* Summary */}
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {itinerary.summary}
                </p>
                
                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {itinerary.recommendedDuration}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {itinerary.stops.length - 2} stops
                  </span>
                </div>
              </div>
              
              {/* Switch Button */}
              <Button
                variant={selectedAlt === itinerary.id ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0"
                onClick={() => handleSwitch(itinerary)}
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${selectedAlt === itinerary.id ? 'text-primary-foreground' : ''}`} />
                {selectedAlt === itinerary.id 
                  ? (language === 'gr' ? 'Επιλέχθηκε' : 'Selected')
                  : (language === 'gr' ? 'Αλλαγή' : 'Switch')
                }
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer Tip */}
      <div className="px-4 py-3 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {language === 'gr' 
            ? '💡 Τα πολιτιστικά και γαστρονομικά προγράμματα είναι ιδανικά για κάθε καιρό'
            : '💡 Culture and food tours are perfect for any weather'}
        </p>
      </div>
    </div>
  );
};

export default SmartAlternatives;
