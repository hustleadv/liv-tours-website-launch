// Crete Badges System - 8 authentic badges with local tips

export interface Badge {
  id: string;
  title: string;
  description: string;
  localTip: string;
  icon: string;
  unlockCondition: {
    type: 'bookingsCount' | 'destinationTag' | 'uniqueDestinations' | 'action' | 'combined';
    value: number;
    tag?: string;
    actions?: string[];
  };
}

export const CRETE_BADGES: Badge[] = [
  {
    id: 'kalimera-crew',
    title: 'Kalimera Crew',
    description: 'Your first ride in Crete. You are officially in.',
    localTip: 'Say kalimera in the morning and kalispera after sunset. Locals notice.',
    icon: '👋',
    unlockCondition: { type: 'bookingsCount', value: 1 },
  },
  {
    id: 'raki-ready',
    title: 'Raki Ready',
    description: 'Two rides in. You are getting the local treatment.',
    localTip: 'If someone offers raki, you smile, say efharisto, and take a small sip. That is the ritual.',
    icon: '🥃',
    unlockCondition: { type: 'bookingsCount', value: 2 },
  },
  {
    id: 'old-town-drifter',
    title: 'Old Town Drifter',
    description: 'You got lost in the right streets.',
    localTip: 'In old towns, skip the main street once. The best spots are one turn away.',
    icon: '🏛️',
    unlockCondition: { type: 'destinationTag', value: 1, tag: 'oldtown' },
  },
  {
    id: 'beach-mood',
    title: 'Beach Mood Activated',
    description: 'Two beaches down. You are learning the coastline.',
    localTip: 'Go early, bring water, and keep one small bag for trash. Respect the place.',
    icon: '🏖️',
    unlockCondition: { type: 'uniqueDestinations', value: 2, tag: 'beach' },
  },
  {
    id: 'west-side-wanderer',
    title: 'West Side Wanderer',
    description: 'West Crete hits different. You know.',
    localTip: 'West Crete loves wind. Pack a light layer even on sunny days.',
    icon: '🌅',
    unlockCondition: { type: 'destinationTag', value: 3, tag: 'westcrete' },
  },
  {
    id: 'mountain-soul',
    title: 'Mountain Soul',
    description: 'You went uphill. That is the real Crete.',
    localTip: 'In the mountains, you greet everyone. A simple yassas is enough.',
    icon: '⛰️',
    unlockCondition: { type: 'destinationTag', value: 1, tag: 'mountain' },
  },
  {
    id: 'smooth-operator',
    title: 'Smooth Operator',
    description: 'No stress. No confusion. Clean planning.',
    localTip: 'Save the WhatsApp chat. It is the local way to move fast without stress.',
    icon: '✨',
    unlockCondition: { type: 'action', value: 1, actions: ['addedToCalendar', 'usedWhatsApp'] },
  },
  {
    id: 'crete-insider',
    title: 'Crete Insider',
    description: 'You did the full local move. Respect.',
    localTip: 'When you find a place you love, tell one good person. That is how locals share gems.',
    icon: '🏆',
    unlockCondition: { type: 'combined', value: 2, actions: ['leftReview', 'bookedReturnTrip'] },
  },
];

// Traveller Levels
export interface TravellerLevel {
  level: number;
  name: string;
  badgesRequired: number;
  gemsUnlocked: number;
}

export const TRAVELLER_LEVELS: TravellerLevel[] = [
  { level: 1, name: 'Explorer', badgesRequired: 1, gemsUnlocked: 0 },
  { level: 2, name: 'Regular', badgesRequired: 4, gemsUnlocked: 3 },
  { level: 3, name: 'Local Soul', badgesRequired: 8, gemsUnlocked: 6 },
];

// Local Gems - curated hidden spots
export interface LocalGem {
  id: string;
  title: string;
  areaTag: string;
  shortDescription: string;
  type: 'food' | 'view' | 'walk' | 'beach' | 'culture';
  bestTime: 'morning' | 'afternoon' | 'sunset';
  mapUrl: string;
  levelRequired: 2 | 3;
  isHidden?: boolean;
}

export const LOCAL_GEMS: LocalGem[] = [
  {
    id: 'koules-sunset',
    title: 'Koules Fortress Sunset',
    areaTag: 'heraklion',
    shortDescription: 'Walk the old harbor wall at golden hour. Locals bring wine.',
    type: 'view',
    bestTime: 'sunset',
    mapUrl: 'https://maps.google.com/?q=Koules+Fortress+Heraklion',
    levelRequired: 2,
  },
  {
    id: 'splantzia-square',
    title: 'Splantzia Morning Coffee',
    areaTag: 'chania',
    shortDescription: 'Quiet square with plane trees. Best freddo in old town.',
    type: 'food',
    bestTime: 'morning',
    mapUrl: 'https://maps.google.com/?q=Splantzia+Square+Chania',
    levelRequired: 2,
  },
  {
    id: 'seitan-limania',
    title: 'Seitan Limania Cove',
    areaTag: 'akrotiri',
    shortDescription: 'Hidden cove with turquoise water. Go before 10am or after 5pm.',
    type: 'beach',
    bestTime: 'morning',
    mapUrl: 'https://maps.google.com/?q=Seitan+Limania',
    levelRequired: 2,
  },
  {
    id: 'anogia-village',
    title: 'Anogia Village Walk',
    areaTag: 'rethymno',
    shortDescription: 'Mountain village with weavers and shepherds. Real Crete.',
    type: 'culture',
    bestTime: 'afternoon',
    mapUrl: 'https://maps.google.com/?q=Anogia+Village+Crete',
    levelRequired: 3,
  },
  {
    id: 'falassarna-north',
    title: 'Falassarna North End',
    areaTag: 'kissamos',
    shortDescription: 'Walk past the main beach. Empty sand dunes await.',
    type: 'walk',
    bestTime: 'afternoon',
    mapUrl: 'https://maps.google.com/?q=Falassarna+Beach+Crete',
    levelRequired: 3,
  },
  {
    id: 'agios-nikolaos-lake',
    title: 'Lake Voulismeni at Night',
    areaTag: 'agios-nikolaos',
    shortDescription: 'Dinner by the lake. Order fish mezze and watch the lights.',
    type: 'food',
    bestTime: 'sunset',
    mapUrl: 'https://maps.google.com/?q=Lake+Voulismeni+Agios+Nikolaos',
    levelRequired: 3,
  },
  {
    id: 'hidden-gem',
    title: 'The Hidden Olive Grove',
    areaTag: 'apokoronas',
    shortDescription: 'A family taverna with no sign. Ask your driver.',
    type: 'food',
    bestTime: 'afternoon',
    mapUrl: 'https://maps.google.com/?q=Apokoronas+Crete',
    levelRequired: 3,
    isHidden: true,
  },
];
