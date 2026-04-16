import { ArrowRight, Clock, MapPin, CheckCircle2, Sparkles, Apple, CloudSun, Umbrella, Wind, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourItinerary, TourVibe, getItinerariesByVibe, VIBE_OPTIONS, ITINERARIES } from "@/lib/tours";
import { cn } from "@/lib/utils";
import { DailyForecast } from "@/lib/weather";
import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/tracking";
import SmartAlternatives, { WeatherCondition } from "@/components/SmartAlternatives";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface ItinerarySelectorProps {
  vibe: TourVibe;
  selectedItinerary: TourItinerary | null;
  onSelect: (itinerary: TourItinerary) => void;
  onCustomize: (itinerary: TourItinerary) => void;
  weatherForecast?: DailyForecast | null;
}

type WeatherConditionType = 'beach' | 'culture' | 'any';

interface WeatherRecommendation {
  condition: WeatherConditionType;
  smartCondition: WeatherCondition;
  message: string;
  icon: React.ReactNode;
  suggestedVibes: TourVibe[];
}

const getWeatherRecommendation = (forecast: DailyForecast): WeatherRecommendation => {
  const { tempMax, precipitationProbability: rainProb, windSpeed: wind } = forecast;
  
  // Cold day - recommend culture/food
  if (tempMax <= 14) {
    return {
      condition: 'culture',
      smartCondition: 'cold',
      message: `${tempMax}°C today. Perfect for cozy culture tours, old town walks, and food experiences.`,
      icon: <Thermometer className="w-4 h-4" />,
      suggestedVibes: ['culture', 'food-wine']
    };
  }
  
  // Cool day - mixed
  if (tempMax >= 15 && tempMax <= 18) {
    return {
      condition: 'any',
      smartCondition: 'good',
      message: `${tempMax}°C. Great for sightseeing. Quick beach stops work, but bring a jacket.`,
      icon: <CloudSun className="w-4 h-4" />,
      suggestedVibes: ['culture', 'adventure', 'food-wine', 'beach']
    };
  }
  
  // Warm but rainy
  if (rainProb >= 60) {
    return {
      condition: 'culture',
      smartCondition: 'rainy',
      message: `${rainProb}% rain chance. Culture routes with indoor stops recommended.`,
      icon: <Umbrella className="w-4 h-4" />,
      suggestedVibes: ['culture', 'food-wine']
    };
  }
  
  // Warm but windy
  if (wind >= 30) {
    return {
      condition: 'culture',
      smartCondition: 'windy',
      message: `Wind ${wind} km/h. Choose sheltered spots or a culture route today.`,
      icon: <Wind className="w-4 h-4" />,
      suggestedVibes: ['culture', 'food-wine', 'adventure']
    };
  }
  
  // Perfect beach weather
  return {
    condition: 'beach',
    smartCondition: 'good',
    message: `${tempMax}°C, low wind, clear skies. Perfect beach day!`,
    icon: <CloudSun className="w-4 h-4" />,
    suggestedVibes: ['beach', 'sunset', 'family']
  };
};

const getWeatherOptimizedItineraries = (
  vibe: TourVibe, 
  forecast: DailyForecast | null | undefined
): { itineraries: TourItinerary[]; recommendation: WeatherRecommendation | null } => {
  const baseItineraries = getItinerariesByVibe(vibe);
  
  if (!forecast) {
    return { itineraries: baseItineraries, recommendation: null };
  }
  
  const recommendation = getWeatherRecommendation(forecast);
  
  // If weather is bad for beach and user selected beach vibe
  if (recommendation.condition === 'culture' && vibe === 'beach') {
    // Get culture/food alternatives and mix with one beach option
    const alternatives = ITINERARIES.filter(i => 
      i.vibes.some(v => recommendation.suggestedVibes.includes(v))
    ).slice(0, 1);
    
    // Keep one beach option for flexibility
    const beachOption = baseItineraries[0];
    
    return { 
      itineraries: [beachOption, ...alternatives], 
      recommendation 
    };
  }
  
  return { itineraries: baseItineraries, recommendation };
};

const ItinerarySelector = ({ vibe, selectedItinerary, onSelect, onCustomize, weatherForecast }: ItinerarySelectorProps) => {
  const { t } = useLanguage();
  const { itineraries, recommendation } = getWeatherOptimizedItineraries(vibe, weatherForecast);
  const vibeLabel = VIBE_OPTIONS.find(v => v.id === vibe)?.label || vibe;
  const [showWeatherAlert, setShowWeatherAlert] = useState(false);

  useEffect(() => {
    if (recommendation && recommendation.condition === 'culture' && vibe === 'beach') {
      setShowWeatherAlert(true);
      trackEvent('weather_insight_shown' as any, { insightType: 'itinerary_suggestion' });
    }
  }, [recommendation, vibe]);

  const isWeatherSuggested = (itinerary: TourItinerary) => {
    if (!recommendation) return false;
    return itinerary.vibes.some(v => recommendation.suggestedVibes.includes(v));
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-2 md:mb-4 text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 bg-accent/10 text-accent rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
            {t.tourBuilder.recommendedForYou}
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">{t.tourBuilder.chooseItinerary}</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {t.tourBuilder.basedOnVibe.replace('{vibe}', vibeLabel)}
          </p>
        </div>
      </div>

      {/* Weather Alert Banner */}
      {showWeatherAlert && recommendation && (
        <div className={cn(
          "flex items-start gap-3 p-4 rounded-xl border",
          recommendation.condition === 'culture' 
            ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800" 
            : "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-800"
        )}>
          <div className={cn(
            "p-2 rounded-lg",
            recommendation.condition === 'culture' 
              ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600" 
              : "bg-green-100 dark:bg-green-500/20 text-green-600"
          )}>
            {recommendation.icon}
          </div>
          <div className="flex-1">
            <p className={cn(
              "text-sm font-medium",
              recommendation.condition === 'culture' 
                ? "text-amber-800 dark:text-amber-300" 
                : "text-green-800 dark:text-green-300"
            )}>
              {t.tourBuilder.weatherUpdate}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {recommendation.message}
            </p>
            {recommendation.condition === 'culture' && vibe === 'beach' && (
              <p className="text-xs text-muted-foreground mt-2">
                {t.tourBuilder.weatherAlternatives}
              </p>
            )}
          </div>
          <button 
            onClick={() => setShowWeatherAlert(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        </div>
      )}

      {/* Smart Alternatives - shown when weather is bad for beach vibe */}
      {recommendation && recommendation.smartCondition !== 'good' && vibe === 'beach' && selectedItinerary && (
        <SmartAlternatives
          weatherCondition={recommendation.smartCondition}
          currentItinerary={selectedItinerary}
          onSwitchItinerary={(itinerary) => {
            onSelect(itinerary);
            trackEvent('smart_alternative_switch' as any, { 
              ctaType: `${selectedItinerary?.id}_to_${itinerary.id}` 
            });
          }}
        />
      )}

      <div className="space-y-4 md:space-y-6 mt-6">
        {itineraries.map((itinerary, index) => {
          const isWeatherFriendly = isWeatherSuggested(itinerary);
          const isSelected = selectedItinerary?.id === itinerary.id;
          const isAlternative = recommendation?.condition === 'culture' && 
            vibe === 'beach' && 
            !itinerary.vibes.includes('beach');
          
          return (
            <motion.div
              key={itinerary.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative group glass-card flex flex-col md:flex-row transition-all duration-300 cursor-pointer overflow-hidden rounded-[2rem] p-3 gap-4 md:gap-6",
                isSelected
                  ? "ring-2 ring-accent bg-accent/[0.03] shadow-2xl shadow-accent/10"
                  : "hover:bg-muted/30 hover:shadow-xl hover:-translate-y-1",
                isAlternative && "border-l-4 border-l-amber-400"
              )}
              onClick={() => onSelect(itinerary)}
            >
              {/* Animated Background on Selection */}
              {isSelected && (
                <motion.div 
                  layoutId="itinerary-bg"
                  className="absolute inset-0 bg-gradient-to-br from-accent/[0.05] to-transparent pointer-events-none"
                />
              )}

              {/* Image Section */}
              <div className="w-full md:w-[260px] h-48 md:h-auto shrink-0 relative rounded-2xl md:rounded-[1.5rem] overflow-hidden">
                {itinerary.image ? (
                  <img 
                    src={itinerary.image} 
                    alt={itinerary.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              </div>

              <div className="flex flex-col flex-1 py-1 pr-3 pb-3 md:pb-1 relative z-10 w-full min-w-0">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {index === 0 && !isAlternative && (
                      <Badge variant="default" className="bg-accent text-accent-foreground text-[10px] uppercase tracking-wider px-2 py-0.5">
                        {t.tourBuilder.mostPopular}
                      </Badge>
                    )}
                    {isAlternative && (
                      <Badge variant="default" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 uppercase tracking-wider px-2 py-0.5">
                        <CloudSun className="w-3 h-3 mr-1" />
                        {t.tourBuilder.weatherPick}
                      </Badge>
                    )}
                    {isWeatherFriendly && !isAlternative && weatherForecast && (
                      <Badge variant="outline" className="text-[10px] border-green-500/50 text-green-600 dark:text-green-400 uppercase tracking-wider px-2 py-0.5">
                        ✓ {t.tourBuilder.goodForToday}
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                    {itinerary.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6">
                    {itinerary.summary}
                  </p>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {itinerary.stops.slice(1, -1).map((stop, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center gap-1.5 text-xs bg-muted/50 border border-border/50 px-3 py-1 rounded-full group-hover:border-accent/30 transition-colors"
                        >
                          <MapPin className="w-3 h-3 text-accent" />
                          {stop}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm font-medium">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4 text-accent" />
                        {itinerary.drivingTime}
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Sparkles className="w-4 h-4 text-accent" />
                        {t.tourBuilder.bestFor} {itinerary.bestFor}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:justify-end gap-3 mt-4 pt-4 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sm:w-auto text-xs font-semibold text-muted-foreground hover:text-primary order-2 sm:order-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCustomize(itinerary);
                    }}
                  >
                    {t.tourBuilder.customize}
                  </Button>
                  <Button
                    variant={isSelected ? "hero" : "outline"}
                    className={cn(
                      "w-full h-12 text-sm font-bold shadow-lg shadow-black/5 group",
                      isSelected && "shadow-accent/20"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(itinerary);
                    }}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {t.tourBuilder.selected}
                      </>
                    ) : (
                      <>
                        {t.tourBuilder.select}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Can't find what you want */}
      <div className="text-center pt-3 md:pt-4">
        <p className="text-xs md:text-sm text-muted-foreground">
          {t.tourBuilder.dontSeeWant}{" "}
          <button 
            type="button"
            className="text-accent font-medium hover:underline"
            onClick={() => onCustomize(itineraries[0])}
          >
            {t.tourBuilder.tellUsIdea}
          </button>
        </p>
      </div>
    </div>
  );
};

export default ItinerarySelector;
