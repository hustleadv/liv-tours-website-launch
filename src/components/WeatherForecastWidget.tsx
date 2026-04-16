import { useEffect, useState } from 'react';
import { Cloud, Sun, Droplets, MapPin, Thermometer } from 'lucide-react';
import { 
  WeatherLocation, 
  DailyForecast, 
  fetchWeatherForecast, 
  getWeatherInfo,
  WeatherData
} from '@/lib/weather';
import { useLanguage } from '@/contexts/LanguageContext';
import { trackEvent } from '@/lib/tracking';

const POPULAR_DESTINATIONS: WeatherLocation[] = [
  { name: 'Chania', lat: 35.5138, lon: 24.0180 },
  { name: 'Heraklion', lat: 35.3387, lon: 25.1442 },
  { name: 'Rethymno', lat: 35.3693, lon: 24.4739 },
  { name: 'Elounda', lat: 35.2578, lon: 25.7314 },
];

interface WeatherForecastWidgetProps {
  className?: string;
}

const WeatherForecastWidget = ({ className = '' }: WeatherForecastWidgetProps) => {
  const [forecasts, setForecasts] = useState<Map<string, DailyForecast[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState(POPULAR_DESTINATIONS[0].name);
  const { language } = useLanguage();

  useEffect(() => {
    const loadForecasts = async () => {
      setLoading(true);
      trackEvent('weather_fetch_start', { location: 'homepage_widget' });

      const allForecasts = new Map<string, DailyForecast[]>();

      await Promise.all(
        POPULAR_DESTINATIONS.map(async (location) => {
          const data = await fetchWeatherForecast(location);
          if (data) {
            const fiveDays = data.forecasts.slice(1, 6);
            allForecasts.set(location.name, fiveDays);
          }
        })
      );

      setForecasts(allForecasts);
      setLoading(false);
      trackEvent('weather_fetch_success', { location: 'homepage_widget' });
    };

    loadForecasts();
  }, []);

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === tomorrow.toDateString()) {
      return language === 'gr' ? 'Αύριο' : 'Tomorrow';
    }

    return date.toLocaleDateString(language === 'gr' ? 'el-GR' : 'en-US', {
      weekday: 'short',
    });
  };

  const activeForecast = forecasts.get(activeLocation) || [];

  if (loading) {
    return (
      <div className={`relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 ${className}`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Sun className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">
              {language === 'gr' ? 'Πρόβλεψη 5 Ημερών' : '5-Day Forecast'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'gr' ? 'Φόρτωση...' : 'Loading...'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-muted/40 p-4">
              <div className="h-3 bg-muted rounded w-10 mx-auto mb-3" />
              <div className="h-8 bg-muted rounded-lg w-8 mx-auto mb-3" />
              <div className="h-3 bg-muted rounded w-12 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-3xl md:rounded-[3rem] border border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl shadow-blue-500/5 ${className}`}>
      {/* Decorative pulse */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-blue-500 rounded-full animate-ping m-6 md:m-10 opacity-50" />

      <div className="relative p-6 md:p-12">
        {/* Location Selector - Premium Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 mb-8 md:mb-12">
          <div className="flex overflow-x-auto pb-4 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0 gap-2 md:gap-3 no-scrollbar scrollbar-hide">
            {POPULAR_DESTINATIONS.map((location) => (
              <button
                key={location.name}
                onClick={() => {
                  setActiveLocation(location.name);
                  (trackEvent as any)('weather_location_change', { destination: location.name });
                }}
                className={`group flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base font-bold whitespace-nowrap transition-all duration-300 ${
                  activeLocation === location.name
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 translate-y-[-2px]'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 md:w-4 h-4 transition-transform ${activeLocation === location.name ? 'scale-110' : 'group-hover:scale-110'}`} />
                {location.name}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/5 rounded-2xl border border-blue-500/10 w-fit">
            <Thermometer className="w-4 h-4 text-blue-500" />
            <span className="text-[10px] md:text-sm font-bold text-blue-500 uppercase tracking-widest">Temperature in °C</span>
          </div>
        </div>

        {/* 5-Day Forecast Grid - Enhanced Cards */}
        {activeForecast.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {activeForecast.map((day, index) => {
              const weather = getWeatherInfo(day.weatherCode);
              return (
                <div
                  key={day.date}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-fade-in group flex flex-col items-center text-center p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500"
                >
                  <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 md:mb-6">
                    {formatDay(day.date)}
                  </p>
                  
                  <div className="relative mb-4 md:mb-6">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative text-4xl md:text-6xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 animate-float" style={{ animationDelay: `${index * 200}ms` }}>
                      {weather.icon}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 md:gap-3 text-xl md:text-2xl font-black mb-3 md:mb-4">
                    <span className="text-orange-500 drop-shadow-sm">{day.tempMax}°</span>
                    <span className="text-slate-200 dark:text-slate-700">|</span>
                    <span className="text-blue-400 drop-shadow-sm">{day.tempMin}°</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-blue-50/50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/30">
                    <Droplets className="w-3 md:w-3.5 h-3 md:h-3.5 text-blue-400" />
                    <span className="text-xs md:text-sm font-bold text-blue-500">{day.precipitationProbability}%</span>
                  </div>
                  
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4 md:mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    {weather.description}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
            <Cloud className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700 animate-pulse" />
            <p className="text-lg font-bold text-slate-400">
              {language === 'gr' ? 'Δεν υπάρχει διαθέσιμη πρόβλεψη' : 'Forecast data currently unavailable'}
            </p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live from Open-Meteo API
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {language === 'gr'
              ? 'Ενημέρωση καθημερινά • Θερμοκρασίες σε °C'
              : 'Updated daily • Temperatures in °C'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeatherForecastWidget;
