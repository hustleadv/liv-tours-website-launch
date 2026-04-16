// Tours system types and constants

export type TourStatus = 'draft' | 'published';
export type TourRegion = 'Chania' | 'Rethymno' | 'Heraklion' | 'Lasithi';
export type TourCategory = 'Beach' | 'Nature' | 'Culture' | 'Food' | 'Family' | 'Adventure';
export type TourTimeType = 'Half day' | 'Full day';
export type TourDifficulty = 'Easy' | 'Moderate';
export type TourWalkingLevel = 'Low' | 'Medium';
export type TourBestFor = 'Couples' | 'Families' | 'Solo' | 'Groups';
export type TourWeatherFit = 'windy_safe' | 'rainy_safe' | 'cold_day_friendly' | 'hot_day_friendly';
export type TourSeasonality = 'all_year' | 'Apr_to_Oct' | 'Nov_to_Mar';
export type TourType = 'private' | 'shared';

export interface TourStop {
  name: string;
  lat?: number | null;
  lon?: number | null;
  stop_minutes: number;
  note?: string;
}

export interface TourImageMeta {
  url: string;
  alt: string;
  source: 'unsplash' | 'pexels' | 'wikimedia' | 'placeholder';
  source_url: string;
  license: string;
  author?: string;
  search_query?: string;
}

export interface TourImages {
  cover_url: string | null;
  gallery_urls: string[];
  cover?: TourImageMeta | null;
  gallery?: TourImageMeta[];
}

export interface Tour {
  id: string;
  status: TourStatus;
  title: string;
  slug: string;
  region: TourRegion;
  category: TourCategory;
  duration_hours: number;
  time_type: TourTimeType;
  difficulty: TourDifficulty;
  walking_level: TourWalkingLevel;
  best_for: TourBestFor[];
  price_from_eur: number | null;
  includes: string[];
  highlights: string[];
  short_teaser: string | null;
  description: string | null;
  tags: string[];
  weather_fit: TourWeatherFit[];
  seasonality: TourSeasonality[];
  pickup_options: string[];
  stops: TourStop[];
  images: TourImages;
  popular_score: number;
  source_summary: string | null;
  tour_type: TourType;
  created_at: string;
  updated_at: string;
}

// Tag Bible - standard tags for consistency
export const TAG_BIBLE = [
  'beach',
  'nature',
  'culture',
  'food',
  'family',
  'couples',
  'adventure',
  'instagram',
  'relax',
  'authentic',
  'comfort',
  'halfday',
  'fullday',
  'easy',
  'moderate',
  'westcrete',
  'eastcrete',
  'oldtown',
  'village',
  'gorge',
  'lagoon',
  'boat',
  'sunset',
  'rainy_safe',
  'windy_safe',
  'cold_day_friendly',
  'hot_day_friendly',
] as const;

export const REGION_OPTIONS: TourRegion[] = ['Chania', 'Rethymno', 'Heraklion', 'Lasithi'];
export const CATEGORY_OPTIONS: TourCategory[] = ['Beach', 'Nature', 'Culture', 'Food', 'Family', 'Adventure'];
export const TIME_TYPE_OPTIONS: TourTimeType[] = ['Half day', 'Full day'];
export const DIFFICULTY_OPTIONS: TourDifficulty[] = ['Easy', 'Moderate'];
export const WALKING_LEVEL_OPTIONS: TourWalkingLevel[] = ['Low', 'Medium'];
export const BEST_FOR_OPTIONS: TourBestFor[] = ['Couples', 'Families', 'Solo', 'Groups'];
export const WEATHER_FIT_OPTIONS: TourWeatherFit[] = ['windy_safe', 'rainy_safe', 'cold_day_friendly', 'hot_day_friendly'];
export const SEASONALITY_OPTIONS: TourSeasonality[] = ['all_year', 'Apr_to_Oct', 'Nov_to_Mar'];

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Quiz types
export interface QuizProfile {
  preferred_region?: TourRegion;
  time_available: TourTimeType;
  group_type: TourBestFor;
  vibe: TourCategory;
  walking_level: TourWalkingLevel;
  priority: 'relaxation' | 'instagram' | 'authentic' | 'comfort';
  weather_preference: 'flexible' | 'avoid_wind' | 'avoid_rain' | 'prefer_cool';
  budget_sensitivity?: 'low' | 'medium' | 'high';
}

// Score a tour against a quiz profile
export const scoreTour = (tour: Tour, profile: QuizProfile): number => {
  let score = 0;
  
  // Time type match (strong - 30 points)
  if (tour.time_type === profile.time_available) score += 30;
  
  // Category/vibe match (strong - 25 points)
  if (tour.category === profile.vibe) score += 25;
  
  // Region match (medium - 15 points)
  if (profile.preferred_region && tour.region === profile.preferred_region) score += 15;
  
  // Best for match (medium - 15 points)
  if (tour.best_for.includes(profile.group_type)) score += 15;
  
  // Walking level match (strong - 20 points)
  if (tour.walking_level === profile.walking_level) score += 20;
  
  // Priority tags match (medium - 10 points)
  if (tour.tags.includes(profile.priority)) score += 10;
  
  // Weather preference match (strong - 20 points)
  if (profile.weather_preference !== 'flexible') {
    const weatherMap: Record<string, TourWeatherFit> = {
      'avoid_wind': 'windy_safe',
      'avoid_rain': 'rainy_safe',
      'prefer_cool': 'hot_day_friendly',
    };
    if (tour.weather_fit.includes(weatherMap[profile.weather_preference])) score += 20;
  }
  
  // Popular score bonus (up to 10 points)
  score += Math.min(tour.popular_score || 0, 10);
  
  return score;
};

// Get matching reasons for display - ALWAYS returns exactly 2 reasons
// Uses only structured fields (category, time_type, best_for, walking_level, weather_fit, tags, region)
export const getMatchReasons = (tour: Tour, profile: QuizProfile): string[] => {
  const matchedReasons: { reason: string; priority: number }[] = [];
  
  // Priority 1: Category/vibe match
  if (tour.category === profile.vibe) {
    matchedReasons.push({ reason: `Matches your ${profile.vibe.toLowerCase()} vibe`, priority: 1 });
  }
  
  // Priority 2: Time type match
  if (tour.time_type === profile.time_available) {
    matchedReasons.push({ reason: `Perfect ${tour.time_type.toLowerCase()} duration`, priority: 2 });
  }
  
  // Priority 3: Best for/group type match
  if (tour.best_for.includes(profile.group_type)) {
    matchedReasons.push({ reason: `Great for ${profile.group_type.toLowerCase()}`, priority: 3 });
  }
  
  // Priority 4: Walking level match
  if (tour.walking_level === profile.walking_level) {
    matchedReasons.push({ reason: `${profile.walking_level} walking level as requested`, priority: 4 });
  }
  
  // Priority 5: Weather preference match
  if (profile.weather_preference !== 'flexible') {
    const weatherLabels: Record<string, string> = {
      'avoid_wind': 'Wind-protected location',
      'avoid_rain': 'Rain-friendly activities',
      'prefer_cool': 'Cool weather suitable',
    };
    const weatherMap: Record<string, TourWeatherFit> = {
      'avoid_wind': 'windy_safe',
      'avoid_rain': 'rainy_safe',
      'prefer_cool': 'hot_day_friendly',
    };
    if (tour.weather_fit.includes(weatherMap[profile.weather_preference])) {
      matchedReasons.push({ reason: weatherLabels[profile.weather_preference], priority: 5 });
    }
  }
  
  // Priority 6: Region match
  if (profile.preferred_region && tour.region === profile.preferred_region) {
    matchedReasons.push({ reason: `Located in ${tour.region}`, priority: 6 });
  }
  
  // Priority 7: Priority tag match (relaxation, instagram, authentic, comfort)
  if (tour.tags.includes(profile.priority)) {
    const priorityLabels: Record<string, string> = {
      'relaxation': 'Perfect for relaxation',
      'instagram': 'Great photo opportunities',
      'authentic': 'Authentic local experience',
      'comfort': 'Premium comfort',
    };
    matchedReasons.push({ reason: priorityLabels[profile.priority] || `Matches your ${profile.priority} priority`, priority: 7 });
  }
  
  // Sort by priority and take top 2
  matchedReasons.sort((a, b) => a.priority - b.priority);
  const topReasons = matchedReasons.slice(0, 2).map(r => r.reason);
  
  // If we have fewer than 2 reasons, add fallback reasons based on tour attributes
  const fallbackReasons = [
    tour.highlights.length > 0 ? `Includes ${tour.highlights.length} highlights` : null,
    tour.includes.length > 0 ? 'All-inclusive experience' : null,
    tour.difficulty === 'Easy' ? 'Easy difficulty level' : null,
    tour.stops.length > 0 ? `${tour.stops.length} scenic stops` : null,
    `Explore ${tour.region}`,
    `${tour.duration_hours}-hour adventure`,
  ].filter(Boolean) as string[];
  
  while (topReasons.length < 2 && fallbackReasons.length > 0) {
    const fallback = fallbackReasons.shift();
    if (fallback && !topReasons.includes(fallback)) {
      topReasons.push(fallback);
    }
  }
  
  return topReasons.slice(0, 2);
};

export const TOUR_TYPE_OPTIONS: TourType[] = ['private', 'shared'];
