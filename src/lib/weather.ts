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
const CACHE_KEY = "liv_weather_cache";
let weatherCache = new Map<string, WeatherData>();
const CACHE_DURATION = 60 * 60 * 1000; // 60 minutes

// Load from localStorage on init
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Filter out stale entries
      const now = Date.now();
      const validEntries = Object.entries(parsed).filter(
        ([_, data]) => now - (data as WeatherData).fetchedAt < CACHE_DURATION
      );
      weatherCache = new Map(validEntries as any);
    }
  } catch (e) {
    console.error("Failed to load weather cache", e);
  }
}

const saveCache = () => {
  if (typeof window !== 'undefined') {
    const obj = Object.fromEntries(weatherCache.entries());
    localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
  }
};

export const weatherCodeMap: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Foggy', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌦️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  71: { description: 'Slight snow fall', icon: '🌨️' },
  73: { description: 'Moderate snow fall', icon: '🌨️' },
  75: { description: 'Heavy snow fall', icon: '🌨️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌧️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

export function getWeatherInfo(code: number) {
  return weatherCodeMap[code] || { description: 'Unknown', icon: '❓' };
}

/**
 * Geocode a location name to coordinates
 * Prioritizes results in Crete, Greece
 */
export async function geocodeLocation(name: string): Promise<{ lat: number; lon: number } | null> {
  // Use a simple local geocoding cache too
  const GEO_CACHE_KEY = `geo_${name.toLowerCase()}`;
  if (typeof window !== 'undefined') {
    const cached = sessionStorage.getItem(GEO_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  }

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

      const coords = { lat: result.latitude, lon: result.longitude };
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(coords));
      }
      return coords;
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
  // trackEvent('weather_fetch_start' as any, { location: location.name });

  try {
    let lat = location.lat;
    let lon = location.lon;

    // Geocode if coordinates not provided
    if (lat === undefined || lon === undefined) {
      const coords = await geocodeLocation(location.name);
      if (!coords) {
        // Safe fallback
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
      return cached;
    }

    // Fetch from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,uv_index_max&timezone=Europe/Athens&forecast_days=16`;

    const response = await fetch(url);
    if (!response.ok) return null;

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
    saveCache();

    return weatherData;
  } catch (error) {
    console.error('Weather fetch error:', error);
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
