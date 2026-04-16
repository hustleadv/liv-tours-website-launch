import { useEffect, useState } from 'react';
import { Cloud, Droplets, Wind } from 'lucide-react';
import { 
  WeatherLocation, 
  DailyForecast, 
  fetchWeatherForecast, 
  getForecastForDate, 
  getWeatherInfo,
  isDateInForecastRange 
} from '@/lib/weather';
import { trackEvent } from '@/lib/tracking';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeatherChipProps {
  location: WeatherLocation;
  date: string;
  className?: string;
}

const WeatherChip = ({ location, date, className = '' }: WeatherChipProps) => {
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    if (!date || !location?.name) return;

    // Check if date is in forecast range
    if (!isDateInForecastRange(date)) {
      setForecast(null);
      return;
    }

    const loadWeather = async () => {
      setLoading(true);
      setError(false);
      
      const weatherData = await fetchWeatherForecast(location);
      
      if (weatherData) {
        const dayForecast = getForecastForDate(weatherData, date);
        setForecast(dayForecast);
        if (dayForecast) {
          trackEvent('weather_chip_view' as any, { location: location.name, date });
        }
      } else {
        setError(true);
      }
      
      setLoading(false);
    };

    loadWeather();
  }, [location, date]);

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-sm animate-pulse ${className}`}>
        <Cloud className="w-4 h-4" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!date || !isDateInForecastRange(date)) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-xs ${className}`}>
        <Cloud className="w-3.5 h-3.5" />
        <span>{language === 'gr' ? 'Πρόβλεψη διαθέσιμη πιο κοντά στην ημερομηνία' : 'Forecast available closer to date'}</span>
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground text-xs ${className}`}>
        <Cloud className="w-3.5 h-3.5" />
        <span>{language === 'gr' ? 'Καιρός μη διαθέσιμος' : 'Weather unavailable'}</span>
      </div>
    );
  }

  const weatherInfo = getWeatherInfo(forecast.weatherCode);

  return (
    <div className={`inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-accent/10 text-foreground text-sm ${className}`}>
      <span className="text-lg" title={weatherInfo.description}>{weatherInfo.icon}</span>
      <span className="font-medium">{forecast.tempMin}°–{forecast.tempMax}°C</span>
      <span className="flex items-center gap-1 text-muted-foreground">
        <Droplets className="w-3.5 h-3.5" />
        {forecast.precipitationProbability}%
      </span>
      <span className="flex items-center gap-1 text-muted-foreground">
        <Wind className="w-3.5 h-3.5" />
        {forecast.windSpeed}km/h
      </span>
    </div>
  );
};

export default WeatherChip;
