import { useEffect, useState } from 'react';
import { Cloud, Droplets, Wind, Thermometer, Sun, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  WeatherLocation, 
  DailyForecast, 
  fetchWeatherForecast, 
  getForecastForDate, 
  getWeatherInfo,
  isDateInForecastRange 
} from '@/lib/weather';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/lib/tracking';
import { Button } from '@/components/ui/button';
import SmartAlternatives, { WeatherCondition } from '@/components/SmartAlternatives';
import { TourItinerary } from '@/lib/tours';

interface WeatherDetailsProps {
  location: WeatherLocation;
  date: string;
  className?: string;
  destinationType?: 'beach' | 'culture' | 'general';
  tourVibe?: string;
  currentItinerary?: TourItinerary;
  onSwitchItinerary?: (itinerary: TourItinerary) => void;
  variant?: 'default' | 'hero'; // New variant for hero section styling
}

// Weather insight thresholds
const WIND_HIGH_THRESHOLD = 35; // km/h for general routes
const WIND_BEACH_THRESHOLD = 30; // km/h for beach destinations (more sensitive)
const RAIN_HIGH_THRESHOLD = 60; // %
const UV_HIGH_THRESHOLD = 6; // UV index requiring sun protection
const TEMP_HOT_THRESHOLD = 30; // °C requiring hydration reminder
const WIND_BEACH_WARNING = 40; // km/h - beaches not recommended

// Beach destination keywords
const BEACH_DESTINATIONS = ['balos', 'falassarna', 'elafonisi', 'beach', 'παραλία', 'stavros', 'seitan', 'kedrodasos', 'matala'];

const isBeachDestination = (locationName: string): boolean => {
  const lowerName = locationName.toLowerCase();
  return BEACH_DESTINATIONS.some(beach => lowerName.includes(beach));
};

// UV Index helper
const getUVLevel = (uvIndex: number, language: string): { label: string; color: string } => {
  if (uvIndex <= 2) {
    return { 
      label: language === 'gr' ? 'Χαμηλό' : 'Low', 
      color: 'text-green-600 dark:text-green-400' 
    };
  }
  if (uvIndex <= 5) {
    return { 
      label: language === 'gr' ? 'Μέτριο' : 'Moderate', 
      color: 'text-yellow-600 dark:text-yellow-400' 
    };
  }
  if (uvIndex <= 7) {
    return { 
      label: language === 'gr' ? 'Υψηλό' : 'High', 
      color: 'text-orange-600 dark:text-orange-400' 
    };
  }
  if (uvIndex <= 10) {
    return { 
      label: language === 'gr' ? 'Πολύ υψηλό' : 'Very High', 
      color: 'text-red-600 dark:text-red-400' 
    };
  }
  return { 
    label: language === 'gr' ? 'Ακραίο' : 'Extreme', 
    color: 'text-purple-600 dark:text-purple-400' 
  };
};

type InsightType = 'cold' | 'cool' | 'rain' | 'wind' | 'beach' | 'vibe_mismatch';

// Map insight type to weather condition for SmartAlternatives
const mapInsightToWeatherCondition = (type: InsightType): WeatherCondition => {
  switch (type) {
    case 'cold':
    case 'cool':
      return 'cold';
    case 'wind':
      return 'windy';
    case 'rain':
      return 'rainy';
    default:
      return 'good';
  }
};

interface WeatherInsight {
  message: string;
  whyLine: string;
  icon: string;
  type: InsightType;
  showSwitchButton?: boolean;
}

const getWeatherInsight = (
  forecast: DailyForecast, 
  language: string, 
  isBeach: boolean,
  tourVibe?: string
): WeatherInsight => {
  const { tempMax, precipitationProbability: rainProb, windSpeed: wind } = forecast;
  
  // Determine effective wind threshold based on destination
  const windThreshold = isBeach ? WIND_BEACH_THRESHOLD : WIND_HIGH_THRESHOLD;
  
  const whyLine = language === 'gr'
    ? `Βασισμένο σε ${tempMax}°C, βροχή ${rainProb}%, άνεμος ${wind} km/h.`
    : `Based on ${tempMax}°C, rain ${rainProb}%, wind ${wind} km/h.`;

  // Tour vibe mismatch check - Beach Day selected but cold weather
  if (tourVibe?.toLowerCase().includes('beach') && tempMax <= 14) {
    return {
      message: language === 'gr'
        ? 'Δεν είναι μέρα για παραλία. Θέλετε ένα γαστρονομικό ή πολιτιστικό πρόγραμμα;'
        : 'Not a beach day. Want a food and culture itinerary instead?',
      whyLine,
      icon: '🍷',
      type: 'vibe_mismatch',
      showSwitchButton: true
    };
  }

  // Temperature Gate: Cold day (tMax <= 14)
  if (tempMax <= 14) {
    return {
      message: language === 'gr'
        ? 'Κρύα μέρα. Ιδανική για παλιά πόλη, πολιτισμό, φαγητό και γραφικές διαδρομές.'
        : 'Cold day. Better for old town, culture, food, and scenic drives.',
      whyLine,
      icon: '🧥',
      type: 'cold'
    };
  }

  // Temperature Gate: Cool day (tMax 15-18)
  if (tempMax >= 15 && tempMax <= 18) {
    return {
      message: language === 'gr'
        ? 'Δροσερή μέρα. Καλή για αξιοθέατα και μια σύντομη στάση στην ακτή. Πάρτε ένα ελαφρύ μπουφάν.'
        : 'Cool day. Good for sightseeing and a short coastal stop. Bring a light jacket.',
      whyLine,
      icon: '🧥',
      type: 'cool'
    };
  }

  // Temperature Gate: Warm day (tMax >= 19) - check wind and rain
  if (tempMax >= 19) {
    // High rain probability
    if (rainProb >= RAIN_HIGH_THRESHOLD) {
      return {
        message: language === 'gr'
          ? 'Υψηλή πιθανότητα βροχής. Σκεφτείτε πολιτιστικές διαδρομές και ευέλικτες στάσεις.'
          : 'High chance of rain. Consider culture routes and flexible stops.',
        whyLine,
        icon: '🌧️',
        type: 'rain'
      };
    }

    // High wind (use stricter threshold for beach destinations)
    if (wind >= windThreshold) {
      return {
        message: language === 'gr'
          ? 'Αέρας σήμερα. Επιλέξτε προστατευμένα σημεία ή πολιτιστική διαδρομή.'
          : 'Windy day. Choose sheltered spots or a culture route.',
        whyLine,
        icon: '💨',
        type: 'wind'
      };
    }

    // Good beach weather
    return {
      message: language === 'gr'
        ? 'Τέλεια μέρα για παραλία!'
        : 'Great day for a beach tour.',
      whyLine,
      icon: '☀️',
      type: 'beach'
    };
  }

  // Fallback (shouldn't reach here)
  return {
    message: language === 'gr'
      ? 'Καλή μέρα για εξερεύνηση.'
      : 'Good day for exploring.',
    whyLine,
    icon: '🌤️',
    type: 'beach'
  };
};

const WeatherDetails = ({ location, date, className = '', destinationType, tourVibe, currentItinerary, onSwitchItinerary, variant = 'default' }: WeatherDetailsProps) => {
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { language } = useLanguage();
  
  const isHero = variant === 'hero';

  useEffect(() => {
    if (!date || !location?.name) return;

    if (!isDateInForecastRange(date)) {
      setForecast(null);
      return;
    }

    const loadWeather = async () => {
      setLoading(true);
      setError(false);

      try {
        const weatherData = await fetchWeatherForecast(location);

        if (weatherData) {
          const dayForecast = getForecastForDate(weatherData, date);
          setForecast(dayForecast);

          // Track insight shown (analytics only) without breaking Hooks order
          if (dayForecast) {
            const isBeach = destinationType === 'beach' || isBeachDestination(location.name);
            const insight = getWeatherInsight(dayForecast, language, isBeach, tourVibe);
            trackEvent('weather_insight_shown' as any, { insightType: insight.type, location: location.name });
          }
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadWeather();
  }, [location, date, destinationType, tourVibe, language]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'gr' ? 'el-GR' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className={`p-4 rounded-xl ${isHero ? 'bg-white/10 border-white/20' : 'bg-white dark:bg-card border-border'} border shadow-sm ${className}`}>
        <div className={`flex items-center gap-3 ${isHero ? 'text-white/70' : 'text-muted-foreground'}`}>
          <div className={`p-2.5 rounded-xl ${isHero ? 'bg-white/10' : 'bg-muted'} animate-pulse`}>
            <Cloud className="w-5 h-5" />
          </div>
          <span className="text-sm">{language === 'gr' ? 'Φόρτωση πρόβλεψης...' : 'Loading forecast...'}</span>
        </div>
      </div>
    );
  }

  if (!date || !isDateInForecastRange(date)) {
    return (
      <div className={`p-4 rounded-xl ${isHero ? 'bg-white/10 border-white/20' : 'bg-primary/5 border-primary/10'} border ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isHero ? 'bg-white/10' : 'bg-primary/10'}`}>
            <Sun className={`w-5 h-5 ${isHero ? 'text-accent' : 'text-primary'}`} />
          </div>
          <div>
            <p className={`font-medium ${isHero ? 'text-white' : 'text-primary'}`}>
              {language === 'gr' ? 'Πρόβλεψη Καιρού' : 'Weather Forecast'}
            </p>
            <p className={`text-sm ${isHero ? 'text-white/70' : 'text-muted-foreground'}`}>
              {language === 'gr' 
                ? 'Επιλέξτε ημερομηνία για να δείτε την πρόβλεψη καιρού.' 
                : 'Select a date to see the weather forecast.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const weatherInfo = forecast ? getWeatherInfo(forecast.weatherCode) : null;
  const isBeach = destinationType === 'beach' || isBeachDestination(location.name);
  const insight = forecast ? getWeatherInsight(forecast, language, isBeach, tourVibe) : null;


  // Early return for error/no forecast AFTER all hooks
  if (error || !forecast || !weatherInfo || !insight) {
    return (
      <div className={`p-4 rounded-xl ${isHero ? 'bg-white/10 border-white/20' : 'bg-muted/50 border-border'} border ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isHero ? 'bg-white/10' : 'bg-muted'}`}>
            <Cloud className={`w-5 h-5 ${isHero ? 'text-white/70' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className={`font-medium ${isHero ? 'text-white' : 'text-foreground'}`}>
              {language === 'gr' ? 'Πρόβλεψη Καιρού' : 'Weather Forecast'}
            </p>
            <p className={`text-sm ${isHero ? 'text-white/70' : 'text-muted-foreground'}`}>
              {language === 'gr' 
                ? 'Ο καιρός δεν είναι διαθέσιμος αυτή τη στιγμή.' 
                : 'Weather unavailable right now.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getInsightStyles = (type: InsightType) => {
    if (isHero) {
      // Hero variant uses subtle white-based styling
      switch (type) {
        case 'beach':
          return { bg: 'bg-green-500/20 border border-green-400/30', text: 'text-green-300' };
        case 'rain':
          return { bg: 'bg-blue-500/20 border border-blue-400/30', text: 'text-blue-300' };
        case 'cold':
        case 'cool':
          return { bg: 'bg-sky-500/20 border border-sky-400/30', text: 'text-sky-300' };
        case 'wind':
          return { bg: 'bg-amber-500/20 border border-amber-400/30', text: 'text-amber-300' };
        case 'vibe_mismatch':
          return { bg: 'bg-rose-500/20 border border-rose-400/30', text: 'text-rose-300' };
        default:
          return { bg: 'bg-white/10 border border-white/20', text: 'text-white' };
      }
    }
    
    switch (type) {
      case 'beach':
        return {
          bg: 'bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-300'
        };
      case 'rain':
        return {
          bg: 'bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800',
          text: 'text-blue-700 dark:text-blue-300'
        };
      case 'cold':
      case 'cool':
        return {
          bg: 'bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-800',
          text: 'text-sky-700 dark:text-sky-300'
        };
      case 'wind':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-300'
        };
      case 'vibe_mismatch':
        return {
          bg: 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-800',
          text: 'text-rose-700 dark:text-rose-300'
        };
      default:
        return {
          bg: 'bg-muted/50 border border-border',
          text: 'text-foreground'
        };
    }
  };

  const insightStyles = getInsightStyles(insight.type);

  return (
    <div className={`p-3 sm:p-4 rounded-xl ${isHero ? 'bg-white/10 border-white/20' : 'bg-white dark:bg-card border-border'} border shadow-sm ${className}`}>
      {/* Header with minimize toggle */}
      <div 
        className="flex items-center justify-between gap-3 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
          <div className="text-2xl sm:text-3xl shrink-0">{weatherInfo.icon}</div>
          <div className="min-w-0 overflow-hidden">
            <p className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-0.5 truncate ${isHero ? 'text-white/60' : 'text-muted-foreground'}`}>
              {language === 'gr' ? 'Πρόβλεψη' : 'Forecast'} · {location.name}
            </p>
            <p className={`text-sm sm:text-base font-semibold truncate ${isHero ? 'text-white' : 'text-primary'}`}>{formatDate(date)}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMinimized(!isMinimized);
          }}
          className={`p-1 sm:p-1.5 rounded-lg transition-colors shrink-0 ${isHero ? 'hover:bg-white/10' : 'hover:bg-muted'}`}
          aria-label={isMinimized ? 'Expand' : 'Minimize'}
        >
          {isMinimized ? (
            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isHero ? 'text-white/70' : 'text-muted-foreground'}`} />
          ) : (
            <ChevronUp className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isHero ? 'text-white/70' : 'text-muted-foreground'}`} />
          )}
        </button>
      </div>

      {/* Minimized - no extra text, header already shows icon and date */}

      {/* Expanded content */}
      {!isMinimized && (
        <>
          <p className={`text-xs sm:text-sm mt-2 sm:mt-3 mb-2 sm:mb-3 ${isHero ? 'text-white/70' : 'text-muted-foreground'}`}>{weatherInfo.description}</p>
      
          {/* Weather Insight Microcopy */}
          <div className={`p-2.5 sm:p-3 rounded-lg mb-3 sm:mb-4 ${insightStyles.bg}`}>
            <div className="flex items-start gap-2">
              <span className="text-base sm:text-lg shrink-0">{insight.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${insightStyles.text}`}>
                  {insight.message}
                </p>
                <p className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 ${isHero ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {insight.whyLine}
                </p>
              </div>
            </div>
            {insight.showSwitchButton && currentItinerary && onSwitchItinerary && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 sm:mt-3 w-full text-xs sm:text-sm"
                onClick={() => {
                  // This will be handled by SmartAlternatives below
                }}
              >
                <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                {language === 'gr' ? 'Δείτε εναλλακτικές παρακάτω' : 'See alternatives below'}
              </Button>
            )}
          </div>
      
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t ${isHero ? 'border-white/20' : 'border-border'}`}>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isHero ? 'bg-orange-500/20' : 'bg-orange-50 dark:bg-orange-500/10'}`}>
                <Thermometer className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div>
                <p className={`text-xs ${isHero ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {language === 'gr' ? 'Θερμ.' : 'Temp'}
                </p>
                <p className={`font-semibold text-sm ${isHero ? 'text-white' : 'text-foreground'}`}>{forecast.tempMin}°–{forecast.tempMax}°</p>
              </div>
            </div>
        
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isHero ? 'bg-blue-500/20' : 'bg-blue-50 dark:bg-blue-500/10'}`}>
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div>
                <p className={`text-xs ${isHero ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {language === 'gr' ? 'Βροχή' : 'Rain'}
                </p>
                <p className={`font-semibold text-sm ${isHero ? 'text-white' : 'text-foreground'}`}>{forecast.precipitationProbability}%</p>
              </div>
            </div>
        
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isHero ? 'bg-teal-500/20' : 'bg-teal-50 dark:bg-teal-500/10'}`}>
                <Wind className="w-3.5 h-3.5 text-teal-500" />
              </div>
              <div>
                <p className={`text-xs ${isHero ? 'text-white/60' : 'text-muted-foreground'}`}>
                  {language === 'gr' ? 'Άνεμος' : 'Wind'}
                </p>
                <p className={`font-semibold text-sm ${isHero ? 'text-white' : 'text-foreground'}`}>{forecast.windSpeed} km/h</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${isHero ? 'bg-amber-500/20' : 'bg-amber-50 dark:bg-amber-500/10'}`}>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div>
                <p className={`text-xs ${isHero ? 'text-white/60' : 'text-muted-foreground'}`}>UV</p>
                <p className={`font-semibold text-sm ${getUVLevel(forecast.uvIndexMax, language).color}`}>
                  {Math.round(forecast.uvIndexMax)} · {getUVLevel(forecast.uvIndexMax, language).label}
                </p>
              </div>
            </div>
          </div>

          {/* Weather Tips */}
          {(forecast.uvIndexMax >= UV_HIGH_THRESHOLD || forecast.tempMax >= TEMP_HOT_THRESHOLD || forecast.windSpeed >= WIND_BEACH_WARNING) && (
            <div className="space-y-2 mt-4">
              {/* Wind Warning for Beaches */}
              {forecast.windSpeed >= WIND_BEACH_WARNING && (
                <div className={`flex items-center gap-2.5 p-3 rounded-lg ${isHero ? 'bg-rose-500/20 border-rose-400/30' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-800'} border`}>
                  <span className="text-lg">🌊</span>
                  <p className={`text-sm font-medium ${isHero ? 'text-rose-300' : 'text-rose-700 dark:text-rose-300'}`}>
                    {language === 'gr' 
                      ? `Άνεμος ${forecast.windSpeed} km/h — Οι παραλίες ίσως έχουν κύματα. Προτιμήστε προστατευμένες.`
                      : `Wind ${forecast.windSpeed} km/h — Beaches may be rough. Consider sheltered spots.`}
                  </p>
                </div>
              )}
              
              {/* Sunscreen Recommendation */}
              {forecast.uvIndexMax >= UV_HIGH_THRESHOLD && (
                <div className={`flex items-center gap-2.5 p-3 rounded-lg ${isHero ? 'bg-amber-500/20 border-amber-400/30' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800'} border`}>
                  <span className="text-lg">🧴</span>
                  <p className={`text-sm font-medium ${isHero ? 'text-amber-300' : 'text-amber-700 dark:text-amber-300'}`}>
                    {language === 'gr' 
                      ? `UV ${Math.round(forecast.uvIndexMax)} — Συνιστάται αντηλιακό SPF 30+ και καπέλο.`
                      : `UV ${Math.round(forecast.uvIndexMax)} — Sunscreen SPF 30+ and a hat recommended.`}
                  </p>
                </div>
              )}
              
              {/* Hydration Reminder */}
              {forecast.tempMax >= TEMP_HOT_THRESHOLD && (
                <div className={`flex items-center gap-2.5 p-3 rounded-lg ${isHero ? 'bg-sky-500/20 border-sky-400/30' : 'bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-800'} border`}>
                  <span className="text-lg">💧</span>
                  <p className={`text-sm font-medium ${isHero ? 'text-sky-300' : 'text-sky-700 dark:text-sky-300'}`}>
                    {language === 'gr' 
                      ? `${forecast.tempMax}°C — Πάρτε μπουκάλι νερό μαζί σας!`
                      : `${forecast.tempMax}°C — Bring a water bottle and stay hydrated!`}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Smart Alternatives Section */}
          {currentItinerary && onSwitchItinerary && (
            <SmartAlternatives
              weatherCondition={mapInsightToWeatherCondition(insight.type)}
              currentItinerary={currentItinerary}
              onSwitchItinerary={onSwitchItinerary}
              className="mt-4"
            />
          )}
        </>
      )}
    </div>
  );
};

export default WeatherDetails;
