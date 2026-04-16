import { addDays, startOfDay } from 'date-fns';
import { trackEvent } from './tracking';

export interface WeatherLocation {
  name: string;
  lat?: number;
  lon?: number;
  type?: string;
}

export interface DailyForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  windSpeed: number;
  uvIndexMax: number;
}

export interface WeatherData {
  location: string;
  forecasts: DailyForecast[];
  fetchedAt: number;
}

interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

// Cache storage: key = `${lat},${lon}` -> WeatherData
const weatherCache = new Map<string, WeatherData>();
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes

// Weather code to icon/description mapping
export const weatherCodeMap: Record<number, { icon: string; description: string }> = {
  0: { icon: '☀️', description: 'Clear sky' },
  1: { icon: '🌤️', description: 'Mainly clear' },
  2: { icon: '⛅', description: 'Partly cloudy' },
  3: { icon: '☁️', description: 'Overcast' },
  45: { icon: '🌫️', description: 'Foggy' },
  48: { icon: '🌫️', description: 'Depositing rime fog' },
  51: { icon: '🌧️', description: 'Light drizzle' },
  53: { icon: '🌧️', description: 'Moderate drizzle' },
  55: { icon: '🌧️', description: 'Dense drizzle' },
  61: { icon: '🌧️', description: 'Slight rain' },
  63: { icon: '🌧️', description: 'Moderate rain' },
  65: { icon: '🌧️', description: 'Heavy rain' },
  71: { icon: '🌨️', description: 'Slight snow' },
  73: { icon: '🌨️', description: 'Moderate snow' },
  75: { icon: '🌨️', description: 'Heavy snow' },
  80: { icon: '🌦️', description: 'Slight showers' },
  81: { icon: '🌦️', description: 'Moderate showers' },
  82: { icon: '🌦️', description: 'Violent showers' },
  95: { icon: '⛈️', description: 'Thunderstorm' },
  96: { icon: '⛈️', description: 'Thunderstorm with hail' },
  99: { icon: '⛈️', description: 'Thunderstorm with heavy hail' },
};

export function getWeatherInfo(code: number) {
  return weatherCodeMap[code] || { icon: '🌡️', description: 'Unknown' };
}

/**
 * Geocode a location name to coordinates
 * Prioritizes results in Crete, Greece
 */
export async function geocodeLocation(name: string): Promise<{ lat: number; lon: number } | null> {
  try {
    const candidates = [
      name,
      name.toLowerCase().includes('crete') ? name : `${name} Crete`,
      `${name}, Crete, Greece`,
      `${name}, Greece`,
    ];

    for (const query of candidates) {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`;
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      if (!data.results || data.results.length === 0) continue;

      // Prefer results in Greece/Crete
      const creteResult = data.results.find((r: GeocodingResult) =>
        r.country === 'Greece' && r.admin1?.toLowerCase().includes('crete')
      );
      const greeceResult = data.results.find((r: GeocodingResult) => r.country === 'Greece');
      const result = creteResult || greeceResult || data.results[0];

      return { lat: result.latitude, lon: result.longitude };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Fetch weather forecast for a location
 */
export async function fetchWeatherForecast(location: WeatherLocation): Promise<WeatherData | null> {
  trackEvent('weather_fetch_start' as any, { location: location.name });

  try {
    let lat = location.lat;
    let lon = location.lon;

    // Geocode if coordinates not provided
    if (lat === undefined || lon === undefined) {
      const coords = await geocodeLocation(location.name);
      if (!coords) {
        // Safe fallback: show forecast for Crete (Chania) instead of showing nothing
        trackEvent('weather_fetch_error' as any, { location: location.name, error: 'geocoding_failed_fallback_to_crete' });
        lat = 35.5138;
        lon = 24.0180;
      } else {
        lat = coords.lat;
        lon = coords.lon;
      }
    }

    const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

    // Check cache
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < CACHE_DURATION) {
      trackEvent('weather_fetch_success' as any, { location: location.name, source: 'cache' });
      return cached;
    }

    // Fetch from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=Europe/Athens&forecast_days=16`;

    const response = await fetch(url);
    if (!response.ok) {
      trackEvent('weather_fetch_error' as any, { location: location.name, error: 'api_error' });
      return null;
    }

    const data = await response.json();

    const forecasts: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
      date,
      weatherCode: data.daily.weather_code[i],
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      precipitationProbability: data.daily.precipitation_probability_max[i],
      windSpeed: Math.round(data.daily.wind_speed_10m_max[i]),
      uvIndexMax: data.daily.uv_index_max[i] ?? 0,
    }));

    const weatherData: WeatherData = {
      location: location.name,
      forecasts,
      fetchedAt: Date.now(),
    };

    // Update cache
    weatherCache.set(cacheKey, weatherData);

    trackEvent('weather_fetch_success' as any, { location: location.name, source: 'api' });
    return weatherData;
  } catch (error) {
    console.error('Weather fetch error:', error);
    trackEvent('weather_fetch_error' as any, { location: location.name, error: 'network_error' });
    return null;
  }
}

/**
 * Get forecast for a specific date
 */
export function getForecastForDate(weatherData: WeatherData | null, date: string): DailyForecast | null {
  if (!weatherData) return null;
  
  // Normalize date format (YYYY-MM-DD)
  const targetDate = date.split('T')[0];
  return weatherData.forecasts.find(f => f.date === targetDate) || null;
}

/**
 * Check if a date is within the forecast range (16 days)
 */
export function isDateInForecastRange(date: string): boolean {
  const target = startOfDay(new Date(date));
  const today = startOfDay(new Date());
  const maxForecastDate = addDays(today, 16);

  return target >= today && target <= maxForecastDate;
}
