import { AlertTriangle, Wind, Droplets, CloudLightning, X } from 'lucide-react';
import { useState } from 'react';
import { DailyForecast, getWeatherInfo } from '@/lib/weather';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeatherAlertBannerProps {
  forecast: DailyForecast | null;
  location: string;
  className?: string;
}

// Severe weather codes that warrant an alert
const SEVERE_WEATHER_CODES = [
  65, // Heavy rain
  75, // Heavy snow
  82, // Violent showers
  95, // Thunderstorm
  96, // Thunderstorm with hail
  99, // Thunderstorm with heavy hail
];

// Moderate weather codes that warrant a warning
const MODERATE_WEATHER_CODES = [
  55, // Dense drizzle
  63, // Moderate rain
  73, // Moderate snow
  81, // Moderate showers
];

interface AlertInfo {
  type: 'severe' | 'moderate' | 'wind' | 'rain';
  title: string;
  titleGr: string;
  message: string;
  messageGr: string;
  icon: typeof AlertTriangle;
}

const WeatherAlertBanner = ({ forecast, location, className = '' }: WeatherAlertBannerProps) => {
  const [dismissed, setDismissed] = useState(false);
  const { language } = useLanguage();

  if (!forecast || dismissed) return null;

  const alerts: AlertInfo[] = [];

  // Check for severe weather codes
  if (SEVERE_WEATHER_CODES.includes(forecast.weatherCode)) {
    const weatherInfo = getWeatherInfo(forecast.weatherCode);
    alerts.push({
      type: 'severe',
      title: 'Severe Weather Warning',
      titleGr: 'Προειδοποίηση Έντονων Καιρικών Φαινομένων',
      message: `${weatherInfo.description} expected in ${location}. Consider flexible booking options.`,
      messageGr: `${weatherInfo.description} αναμένεται στο ${location}. Εξετάστε ευέλικτες επιλογές κράτησης.`,
      icon: CloudLightning,
    });
  } else if (MODERATE_WEATHER_CODES.includes(forecast.weatherCode)) {
    const weatherInfo = getWeatherInfo(forecast.weatherCode);
    alerts.push({
      type: 'moderate',
      title: 'Weather Advisory',
      titleGr: 'Ενημέρωση Καιρού',
      message: `${weatherInfo.description} possible in ${location}. Pack accordingly.`,
      messageGr: `${weatherInfo.description} πιθανό στο ${location}. Προετοιμαστείτε κατάλληλα.`,
      icon: AlertTriangle,
    });
  }

  // Check for high wind (>45 km/h)
  if (forecast.windSpeed >= 45) {
    alerts.push({
      type: 'wind',
      title: 'Strong Wind Alert',
      titleGr: 'Προειδοποίηση Ισχυρών Ανέμων',
      message: `Winds up to ${forecast.windSpeed} km/h expected. Ferry services to islands may be affected.`,
      messageGr: `Άνεμοι έως ${forecast.windSpeed} km/h αναμένονται. Οι πλοϊκές συγκοινωνίες μπορεί να επηρεαστούν.`,
      icon: Wind,
    });
  } else if (forecast.windSpeed >= 35) {
    // Moderate wind warning
    if (!alerts.some(a => a.type === 'wind')) {
      alerts.push({
        type: 'wind',
        title: 'Windy Conditions',
        titleGr: 'Ανεμώδεις Συνθήκες',
        message: `Expect winds around ${forecast.windSpeed} km/h. Bring a windbreaker.`,
        messageGr: `Αναμένονται άνεμοι περίπου ${forecast.windSpeed} km/h. Πάρτε ένα αντιανεμικό.`,
        icon: Wind,
      });
    }
  }

  // Check for high precipitation probability (>70%)
  if (forecast.precipitationProbability >= 70) {
    alerts.push({
      type: 'rain',
      title: 'High Rain Probability',
      titleGr: 'Υψηλή Πιθανότητα Βροχής',
      message: `${forecast.precipitationProbability}% chance of rain. Bring waterproof clothing and plan indoor alternatives.`,
      messageGr: `${forecast.precipitationProbability}% πιθανότητα βροχής. Πάρτε αδιάβροχα ρούχα και σχεδιάστε εναλλακτικές.`,
      icon: Droplets,
    });
  }

  if (alerts.length === 0) return null;

  // Get the most severe alert to display
  const primaryAlert = alerts.sort((a, b) => {
    const priority = { severe: 0, wind: 1, rain: 2, moderate: 3 };
    return priority[a.type] - priority[b.type];
  })[0];

  const isSevere = primaryAlert.type === 'severe';
  const AlertIcon = primaryAlert.icon;

  return (
    <div 
      className={`
        relative flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs
        ${isSevere 
          ? 'bg-destructive/5 text-destructive/90' 
          : 'bg-muted/50 text-muted-foreground'
        }
        ${className}
      `}
    >
      <AlertIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isSevere ? 'text-destructive/70' : 'text-muted-foreground/70'}`} />
      
      <p className="flex-1 leading-snug">
        <span className="font-medium">
          {language === 'gr' ? primaryAlert.titleGr : primaryAlert.title}
        </span>
        <span className="mx-1 opacity-40">·</span>
        <span className="opacity-80">{language === 'gr' ? primaryAlert.messageGr : primaryAlert.message}</span>
      </p>

      <button
        className="p-1 -mr-0.5 rounded opacity-40 hover:opacity-70 transition-opacity"
        onClick={() => setDismissed(true)}
        aria-label={language === 'gr' ? 'Απόκρυψη' : 'Dismiss'}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default WeatherAlertBanner;