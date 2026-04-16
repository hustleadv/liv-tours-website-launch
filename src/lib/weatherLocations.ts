import type { WeatherLocation } from './weather';

// Common Cretan destinations with coordinates for faster weather lookups
export const creteWeatherLocations: Record<string, WeatherLocation> = {
  // Chania region
  'Chania': { name: 'Chania', lat: 35.5138, lon: 24.0180, type: 'city' },
  'Chania Old Town': { name: 'Chania', lat: 35.5167, lon: 24.0167, type: 'city' },
  'Chania Airport': { name: 'Chania Airport', lat: 35.5317, lon: 24.1497, type: 'airport' },
  'Platanias': { name: 'Platanias', lat: 35.5167, lon: 23.8667, type: 'resort' },
  'Agia Marina': { name: 'Agia Marina', lat: 35.5167, lon: 23.9333, type: 'resort' },
  'Georgioupolis': { name: 'Georgioupolis', lat: 35.3667, lon: 24.2500, type: 'resort' },
  'Kissamos': { name: 'Kissamos', lat: 35.4833, lon: 23.6500, type: 'town' },
  'Falasarna': { name: 'Falasarna', lat: 35.4833, lon: 23.5667, type: 'beach' },
  'Elafonisi': { name: 'Elafonisi', lat: 35.2667, lon: 23.5333, type: 'beach' },
  'Balos': { name: 'Balos', lat: 35.5833, lon: 23.5833, type: 'beach' },
  
  // Rethymno region
  'Rethymno': { name: 'Rethymno', lat: 35.3667, lon: 24.4833, type: 'city' },
  'Bali': { name: 'Bali', lat: 35.4167, lon: 24.7833, type: 'resort' },
  'Panormo': { name: 'Panormo', lat: 35.4167, lon: 24.7000, type: 'resort' },
  
  // Heraklion region
  'Heraklion': { name: 'Heraklion', lat: 35.3387, lon: 25.1442, type: 'city' },
  'Heraklion City': { name: 'Heraklion', lat: 35.3387, lon: 25.1442, type: 'city' },
  'Heraklion Airport': { name: 'Heraklion Airport', lat: 35.3397, lon: 25.1803, type: 'airport' },
  'Hersonissos': { name: 'Hersonissos', lat: 35.3167, lon: 25.3833, type: 'resort' },
  'Malia': { name: 'Malia', lat: 35.2833, lon: 25.4667, type: 'resort' },
  'Stalida': { name: 'Stalida', lat: 35.3000, lon: 25.4333, type: 'resort' },
  'Stalis': { name: 'Stalis', lat: 35.3000, lon: 25.4333, type: 'resort' },
  'Knossos': { name: 'Knossos', lat: 35.2981, lon: 25.1631, type: 'attraction' },
  'Matala': { name: 'Matala', lat: 34.9950, lon: 24.7500, type: 'beach' },
  
  // Lasithi region
  'Agios Nikolaos': { name: 'Agios Nikolaos', lat: 35.1833, lon: 25.7167, type: 'city' },
  'Elounda': { name: 'Elounda', lat: 35.2500, lon: 25.7333, type: 'resort' },
  'Sitia': { name: 'Sitia', lat: 35.2000, lon: 26.1000, type: 'town' },
  'Ierapetra': { name: 'Ierapetra', lat: 35.0000, lon: 25.7333, type: 'city' },
  'Vai': { name: 'Vai', lat: 35.2500, lon: 26.2667, type: 'beach' },
  'Spinalonga': { name: 'Spinalonga', lat: 35.3000, lon: 25.7333, type: 'attraction' },
};

/**
 * Get weather location for a destination name
 * Returns pre-configured coordinates if available, otherwise just the name for geocoding
 */
export function getWeatherLocation(destinationName: string): WeatherLocation {
  // Check exact match first
  if (creteWeatherLocations[destinationName]) {
    return creteWeatherLocations[destinationName];
  }
  
  // Check partial matches
  for (const [key, location] of Object.entries(creteWeatherLocations)) {
    if (destinationName.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(destinationName.toLowerCase())) {
      return location;
    }
  }
  
  // Return just the name for geocoding
  return { name: destinationName };
}

/**
 * Get weather location for a route (uses dropoff location)
 */
export function getRouteWeatherLocation(routeTo: string, routeWeatherLocation?: WeatherLocation): WeatherLocation {
  // Use route's specific weatherLocation if provided
  if (routeWeatherLocation) {
    return routeWeatherLocation;
  }
  
  // Otherwise derive from destination name
  return getWeatherLocation(routeTo);
}

/**
 * Get weather location for a tour region
 * Returns pre-configured coordinates for Cretan regions
 */
export function getTourRegionWeatherLocation(region: string): WeatherLocation {
  const regionCoordinates: Record<string, WeatherLocation> = {
    'Heraklion': { name: 'Heraklion', lat: 35.3387, lon: 25.1442, type: 'city' },
    'Chania': { name: 'Chania', lat: 35.5138, lon: 24.0180, type: 'city' },
    'Rethymno': { name: 'Rethymno', lat: 35.3667, lon: 24.4833, type: 'city' },
    'Lasithi': { name: 'Agios Nikolaos', lat: 35.1833, lon: 25.7167, type: 'city' },
  };
  
  return regionCoordinates[region] || { name: region };
}
