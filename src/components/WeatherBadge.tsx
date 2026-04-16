import { useEffect, useState } from 'react';
import { fetchWeatherForecast, getForecastForDate, getWeatherInfo, DailyForecast } from '@/lib/weather';
import { format } from 'date-fns';

const WeatherBadge = () => {
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeather = async () => {
      // Default to Chania
      const data = await fetchWeatherForecast({ name: 'Chania', lat: 35.5138, lon: 24.0180 });
      if (data) {
        const today = format(new Date(), 'yyyy-MM-dd');
        setForecast(getForecastForDate(data, today));
      }
      setLoading(false);
    };

    loadWeather();
  }, []);

  if (loading) return (
    <div className="h-8 w-20 bg-muted/20 animate-pulse rounded-full hidden md:block" />
  );

  if (!forecast) return null;

  const weather = getWeatherInfo(forecast.weatherCode);

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-background/40 backdrop-blur-md rounded-full border border-border/40 hover:bg-background/60 transition-all group shrink-0">
      <span className="text-lg leading-none" title={weather.description}>{weather.icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none tracking-tighter">Chania</span>
        <span className="text-xs font-bold leading-none">{forecast.tempMax}°C</span>
      </div>
    </div>
  );
};

export default WeatherBadge;
