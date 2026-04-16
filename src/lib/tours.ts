// Tour Builder types and utilities
import balosImg from "@/assets/tours/balos-gramvousa-cover.webp";
import elafonisiImg from "@/assets/tours/elafonisi-1.webp";
import hiddenBeachesImg from "@/assets/tours/seitan-cover.webp";
import knossosImg from "@/assets/tours/knossos-cover.webp";
import monasteriesImg from "@/assets/tours/rethymno-cover.webp";
import westHeritageImg from "@/assets/tours/chania-old-town-cover.webp";
import wineImg from "@/assets/tours/wine-olive-cover.webp";
import foodieImg from "@/assets/tours/village-food-1.webp";
import cookingImg from "@/assets/tours/village-food-cover.webp";
import sunsetWestImg from "@/assets/tours/falassarna-sunset-cover.webp";
import sunsetMtImg from "@/assets/tours/west-crete-cover.webp";
import familyImg from "@/assets/tours/lake-kournas-cover.webp";
import samariaImg from "@/assets/tours/samaria-cover.webp";
import lasithiImg from "@/assets/tours/lasithi-windmills-cover.webp";


export type TourVibe = 
  | 'beach'
  | 'culture'
  | 'food-wine'
  | 'sunset'
  | 'family'
  | 'adventure'
  | 'romantic'
  | 'custom';

export type TourDuration = '4h' | '6h' | '8h' | 'custom';
export type TourTimeSlot = 'morning' | 'afternoon' | 'sunset';

export interface TourItinerary {
  id: string;
  title: string;
  summary: string;
  stops: string[];
  drivingTime: string;
  bestFor: string;
  recommendedDuration: TourDuration;
  vibes: TourVibe[];
  weatherLocation?: { name: string; lat?: number; lon?: number };
  image?: string;
}

export interface TourAddon {
  id: string;
  label: string;
  description: string;
  priceNote?: string;
}

export interface TourRequest {
  vibe: TourVibe;
  pickupArea: string;
  duration: TourDuration;
  customDuration?: string;
  groupSize: string;
  date?: string;
  timeSlot?: TourTimeSlot;
  notes?: string;
  selectedItinerary?: TourItinerary;
  addons: string[];
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export const VIBE_OPTIONS: { id: TourVibe; label: string; emoji: string; description: string }[] = [
  { id: 'beach', label: 'Beach Day', emoji: '🏖️', description: 'Hidden coves & crystal waters' },
  { id: 'culture', label: 'Culture & History', emoji: '🏛️', description: 'Ancient palaces & monasteries' },
  { id: 'food-wine', label: 'Food & Wine', emoji: '🍷', description: 'Tastings & authentic cuisine' },
  { id: 'sunset', label: 'Sunset & Chill', emoji: '🌅', description: 'Golden hour viewpoints' },
  { id: 'family', label: 'Family Friendly', emoji: '👨‍👩‍👧‍👦', description: 'Kid-approved adventures' },
  { id: 'adventure', label: 'Adventure / Nature', emoji: '🥾', description: 'Mountains, gorges & trails' },
  { id: 'romantic', label: 'Romantic', emoji: '💕', description: 'Scenic spots for couples' },
  { id: 'custom', label: 'Custom', emoji: '✨', description: 'Mix & match your interests' },
];

export const DURATION_OPTIONS: { id: TourDuration; label: string; hours: number }[] = [
  { id: '4h', label: '4 hours (Half-day)', hours: 4 },
  { id: '6h', label: '6 hours', hours: 6 },
  { id: '8h', label: '8 hours (Full-day)', hours: 8 },
  { id: 'custom', label: 'Custom duration', hours: 0 },
];

export const ADDON_OPTIONS: TourAddon[] = [
  { id: 'child-seat', label: 'Child seat', description: 'Suitable for infants & toddlers' },
  { id: 'extra-hour', label: 'Extra hour (+1h)', description: 'More time to explore' },
  { id: 'sunset-addon', label: 'Sunset add-on', description: 'End your day at a viewpoint' },
  { id: 'extra-stop', label: 'Extra stop', description: 'Add another location' },
  { id: 'cooler', label: 'Cooler with water', description: 'Stay refreshed all day' },
  { id: 'photo-stop', label: 'Photographer stop', description: '10 min at scenic spots' },
];

// Pre-built itineraries by vibe
export const ITINERARIES: TourItinerary[] = [
  // Beach
  {
    id: 'balos-day',
    title: 'Balos Lagoon & Gramvousa',
    summary: 'The iconic turquoise lagoon with an island fortress. Pure paradise.',
    stops: ['Pickup from your hotel', 'Scenic coastal drive', 'Balos Lagoon (3h)', 'Gramvousa Island viewpoint', 'Traditional village lunch', 'Return'],
    drivingTime: '~2.5h total',
    bestFor: 'Beach lovers & photographers',
    recommendedDuration: '8h',
    vibes: ['beach', 'adventure'],
    image: balosImg
  },
  {
    id: 'elafonisi',
    title: 'Elafonisi Pink Beach',
    summary: 'Famous for pink sand and shallow waters. A tropical escape in Europe.',
    stops: ['Pickup', 'Mountain village coffee stop', 'Elafonisi Beach (4h)', 'Olive oil tasting', 'Coastal return route'],
    drivingTime: '~2h each way',
    bestFor: 'Families & relaxation seekers',
    recommendedDuration: '8h',
    vibes: ['beach', 'family'],
    image: elafonisiImg
  },
  {
    id: 'hidden-beaches',
    title: 'Secret Beaches of the South',
    summary: 'Skip the crowds. We know the spots only locals visit.',
    stops: ['Pickup', 'Preveli Palm Beach', 'Triopetra Beach', 'Local taverna lunch', 'Agia Galini optional', 'Return'],
    drivingTime: '~3h total',
    bestFor: 'Adventure seekers',
    recommendedDuration: '8h',
    vibes: ['beach', 'adventure'],
    image: hiddenBeachesImg
  },
  // Culture
  {
    id: 'knossos-day',
    title: 'Knossos & Heraklion Heritage',
    summary: 'Walk through 4,000 years of history at the legendary Minoan palace.',
    stops: ['Pickup', 'Knossos Palace (2h)', 'Heraklion Archaeological Museum', 'Old Town walk & lunch', 'Venetian Fortress', 'Return'],
    drivingTime: '~1.5h total',
    bestFor: 'History enthusiasts',
    recommendedDuration: '6h',
    vibes: ['culture'],
    image: knossosImg
  },
  {
    id: 'monasteries',
    title: 'Monasteries & Mountain Villages',
    summary: 'Byzantine heritage meets traditional Cretan life in the highlands.',
    stops: ['Pickup', 'Arkadi Monastery', 'Anogia village', 'Local mountain lunch', 'Margarites pottery village', 'Return'],
    drivingTime: '~2h total',
    bestFor: 'Culture & tradition lovers',
    recommendedDuration: '6h',
    vibes: ['culture', 'adventure'],
    image: monasteriesImg
  },
  {
    id: 'west-heritage',
    title: 'Chania Old Town & Beyond',
    summary: 'Venetian harbors, Ottoman mosques, and the heart of West Crete.',
    stops: ['Pickup', 'Chania Old Town walking tour', 'Venetian Lighthouse', 'Market visit', 'Traditional lunch', 'Aptera ancient city', 'Return'],
    drivingTime: '~1h total',
    bestFor: 'First-time visitors',
    recommendedDuration: '6h',
    vibes: ['culture'],
    image: westHeritageImg
  },
  // Food & Wine
  {
    id: 'wine-tour',
    title: 'Cretan Wine Trail',
    summary: 'Taste indigenous varietals at award-winning wineries.',
    stops: ['Pickup', 'Boutari Winery', 'Lyrarakis Winery', 'Traditional meze lunch', 'Olive oil mill tour', 'Return'],
    drivingTime: '~2h total',
    bestFor: 'Wine lovers',
    recommendedDuration: '6h',
    vibes: ['food-wine'],
    image: wineImg
  },
  {
    id: 'foodie-east',
    title: 'Eastern Crete Foodie Trail',
    summary: 'From farm to table: olive groves, cheese makers, and hidden tavernas.',
    stops: ['Pickup', 'Olive oil estate', 'Local cheese workshop', 'Village taverna lunch', 'Spinalonga views', 'Return'],
    drivingTime: '~2.5h total',
    bestFor: 'Food enthusiasts',
    recommendedDuration: '8h',
    vibes: ['food-wine', 'culture'],
    image: foodieImg
  },
  {
    id: 'cooking-day',
    title: 'Cooking Class & Market Tour',
    summary: 'Shop like a local and learn to cook Cretan dishes with a family.',
    stops: ['Pickup', 'Local market tour', 'Family home cooking class', 'Feast on your creations', 'Village walk', 'Return'],
    drivingTime: '~1h total',
    bestFor: 'Hands-on experiences',
    recommendedDuration: '6h',
    vibes: ['food-wine', 'family'],
    image: cookingImg
  },
  // Sunset
  {
    id: 'sunset-west',
    title: 'West Coast Sunset',
    summary: 'Chase the golden hour at Falasarna and dine by the sea.',
    stops: ['Afternoon pickup', 'Scenic drive', 'Falasarna Beach', 'Sunset viewpoint', 'Seaside dinner (optional)', 'Return'],
    drivingTime: '~2h total',
    bestFor: 'Romantics',
    recommendedDuration: '4h',
    vibes: ['sunset', 'beach'],
    image: sunsetWestImg
  },
  {
    id: 'sunset-mountains',
    title: 'Mountain Sunset & Stars',
    summary: 'Watch the sun set over the sea from the White Mountains.',
    stops: ['Afternoon pickup', 'Mountain village visit', 'Viewpoint photo stop', 'Sunset at altitude', 'Traditional dinner', 'Return'],
    drivingTime: '~2h total',
    bestFor: 'Nature lovers',
    recommendedDuration: '4h',
    vibes: ['sunset', 'adventure'],
    image: sunsetMtImg
  },
  // Family
  {
    id: 'family-fun',
    title: 'Family Adventure Day',
    summary: 'Kid-friendly beaches, a mini-train, and ice cream stops.',
    stops: ['Pickup', 'Calm beach with shallow waters', 'Train ride in Gouves', 'Lunch at family taverna', 'Ice cream break', 'Aquarium optional', 'Return'],
    drivingTime: '~1.5h total',
    bestFor: 'Families with young children',
    recommendedDuration: '6h',
    vibes: ['family', 'beach'],
    image: familyImg
  },
  // Adventure
  {
    id: 'samaria-transfer',
    title: 'Samaria Gorge Transfer',
    summary: 'We drop you at the start and pick you up at the finish.',
    stops: ['Early pickup', 'Omalos Plateau', 'Gorge entrance drop-off', 'Pick up at Agia Roumeli', 'Return via ferry or car', 'Return'],
    drivingTime: 'Variable',
    bestFor: 'Hikers',
    recommendedDuration: '8h',
    vibes: ['adventure'],
    image: samariaImg
  },
  {
    id: 'lasithi-plateau',
    title: 'Lasithi Plateau & Zeus Cave',
    summary: 'Windmills, mountain villages, and the birthplace of Zeus.',
    stops: ['Pickup', 'Dikteon Cave (Zeus birthplace)', 'Lasithi Plateau drive', 'Traditional lunch', 'Village walk', 'Return'],
    drivingTime: '~2.5h total',
    bestFor: 'Adventure & mythology fans',
    recommendedDuration: '6h',
    vibes: ['adventure', 'culture'],
    image: lasithiImg
  },
];

// Get itineraries matching a vibe
export const getItinerariesByVibe = (vibe: TourVibe): TourItinerary[] => {
  if (vibe === 'custom') {
    // Return a mix for custom
    return ITINERARIES.slice(0, 2);
  }
  return ITINERARIES.filter(i => i.vibes.includes(vibe)).slice(0, 2);
};

// Generate WhatsApp message for tour
export const generateTourWhatsAppMessage = (request: TourRequest): string => {
  const vibeLabel = VIBE_OPTIONS.find(v => v.id === request.vibe)?.label || request.vibe;
  const durationLabel = DURATION_OPTIONS.find(d => d.id === request.duration)?.label || request.duration;
  const addonsText = request.addons.length > 0 
    ? request.addons.map(a => ADDON_OPTIONS.find(ao => ao.id === a)?.label || a).join(', ')
    : 'None';

  return `Hi! I'd like to book a private tour:

Vibe: ${vibeLabel}
Itinerary: ${request.selectedItinerary?.title || 'Custom'}
Pickup area: ${request.pickupArea || 'TBD'}
Duration: ${durationLabel}
Group size: ${request.groupSize} people
Date: ${request.date || 'TBD'}
Add-ons: ${addonsText}
Notes: ${request.notes || 'None'}

Please confirm availability & final price. Thank you!`;
};

export const getTourWhatsAppLink = (request: TourRequest): string => {
  const phoneNumber = '306944363525';
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(generateTourWhatsAppMessage(request))}`;
};
