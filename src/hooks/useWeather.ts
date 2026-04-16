import { useState, useEffect, useCallback } from 'react';
import { WeatherLocation, DailyForecast, WeatherData, fetchWeatherForecast, getForecastForDate, isDateInForecastRange } from '@/lib/weather';
import { getWeatherLocation } from '@/lib/weatherLocations';

interface UseWeatherOptions {
  location?: WeatherLocation | string;
  date?: string;
  enabled?: boolean;
}

interface UseWeatherResult {
  forecast: DailyForecast | null;
  weatherData: WeatherData | null;
  loading: boolean;
  error: boolean;
  isInRange: boolean;
  refetch: () => void;
}

export function useWeather({ location, date, enabled = true }: UseWeatherOptions): UseWeatherResult {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const weatherLocation = typeof location === 'string' 
    ? getWeatherLocation(location) 
    : location;

  const isInRange = date ? isDateInForecastRange(date) : false;

  const fetchData = useCallback(async () => {
    if (!enabled || !weatherLocation?.name || !date) {
      setForecast(null);
      return;
    }

    if (!isInRange) {
      setForecast(null);
      return;
    }

    setLoading(true);
    setError(false);

    const data = await fetchWeatherForecast(weatherLocation);
    
    if (data) {
      setWeatherData(data);
      const dayForecast = getForecastForDate(data, date);
      setForecast(dayForecast);
    } else {
      setError(true);
      setWeatherData(null);
      setForecast(null);
    }

    setLoading(false);
  }, [enabled, weatherLocation?.name, date, isInRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    forecast,
    weatherData,
    loading,
    error,
    isInRange,
    refetch: fetchData,
  };
}
