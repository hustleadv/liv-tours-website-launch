// Centralized reviews data for contextual display across the site

export type ReviewCategory = 'airport' | 'transfer' | 'tour' | 'minibus';

export interface Review {
  id: string;
  name: string;
  country: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  category: ReviewCategory;
  routeTag?: string; // e.g., "Chania Airport → Platanias"
  date: string;
}

export const reviews: Review[] = [
  // Airport Transfer Reviews
  {
    id: 'rev-1',
    name: 'Sarah M.',
    country: 'UK',
    rating: 5,
    text: 'Flight was 2 hours late. Driver was still there, tracked it automatically. No extra charge. That is what you pay for.',
    category: 'airport',
    routeTag: 'Chania Airport → Chania Old Town',
    date: 'December 2025',
  },
  {
    id: 'rev-2',
    name: 'James T.',
    country: 'UK',
    rating: 5,
    text: 'Our flight was 2 hours late but driver was there waiting when we arrived. Tracked the flight and adjusted. Brilliant service!',
    category: 'airport',
    routeTag: 'Heraklion Airport → Heraklion City',
    date: 'December 2025',
  },
  {
    id: 'rev-3',
    name: 'Anna K.',
    country: 'Germany',
    rating: 5,
    text: 'Easy booking, clear communication, spotless car. Driver helped with all our bags and had cold water ready. Perfect start to our holiday.',
    category: 'airport',
    routeTag: 'Chania Airport → Platanias',
    date: 'November 2025',
  },
  {
    id: 'rev-4',
    name: 'Marco P.',
    country: 'Italy',
    rating: 5,
    text: 'Third time using LIV Tours for airport transfer. Always reliable, always professional. Why would I use anyone else?',
    category: 'airport',
    routeTag: 'Heraklion Airport → Elounda',
    date: 'October 2025',
  },
  {
    id: 'rev-5',
    name: 'Helena S.',
    country: 'Netherlands',
    rating: 5,
    text: 'Booked last minute and they confirmed within 30 minutes. Driver was waiting with our name sign. Stress-free from landing to hotel.',
    category: 'airport',
    routeTag: 'Chania Airport → Agia Marina',
    date: 'September 2025',
  },
  
  // Tour Reviews
  {
    id: 'rev-6',
    name: 'Thomas K.',
    country: 'Germany',
    rating: 5,
    text: 'Asked for a tour to Spinalonga. Driver knew exactly where to stop for photos and which taverna had the best fish. Worth every euro.',
    category: 'tour',
    date: 'November 2025',
  },
  {
    id: 'rev-7',
    name: 'Emma & James',
    country: 'UK',
    rating: 5,
    text: 'Our driver Nikos created the most magical day. Hidden beaches, a tiny taverna for lunch, and the most stunning sunset. Felt like we had a friend showing us around.',
    category: 'tour',
    date: 'October 2025',
  },
  {
    id: 'rev-8',
    name: 'Sophie Laurent',
    country: 'France',
    rating: 5,
    text: 'As a photographer, I needed time at each location. My driver understood completely and even suggested angles I wouldn\'t have found alone.',
    category: 'tour',
    date: 'September 2025',
  },
  {
    id: 'rev-9',
    name: 'The Martinez Family',
    country: 'USA',
    rating: 5,
    text: 'Traveling with three kids under 10, we were worried about keeping everyone happy. The tour was perfectly paced with stops that entertained the kids.',
    category: 'tour',
    date: 'August 2025',
  },
  {
    id: 'rev-10',
    name: 'Lisa & David',
    country: 'Australia',
    rating: 5,
    text: 'Elafonisi beach tour was incredible. Driver took us early to avoid crowds, then to a secret swimming spot on the way back. Local knowledge makes all the difference.',
    category: 'tour',
    date: 'July 2025',
  },
  
  // Transfer Reviews
  {
    id: 'rev-11',
    name: 'Maria S.',
    country: 'Italy',
    rating: 5,
    text: '6 of us, 6 suitcases, 2 car seats needed. V-Class fit everything. Kids loved the WiFi. Parents loved the peace.',
    category: 'transfer',
    routeTag: 'Chania → Rethymno',
    date: 'October 2025',
  },
  {
    id: 'rev-12',
    name: 'Peter H.',
    country: 'Switzerland',
    rating: 5,
    text: 'Needed a last-minute transfer to catch a ferry. Driver got us there with time to spare. Professional and courteous.',
    category: 'transfer',
    date: 'September 2025',
  },
  {
    id: 'rev-13',
    name: 'Charlotte B.',
    country: 'Belgium',
    rating: 5,
    text: 'Transferred from Chania to Balos port. Beautiful scenic drive and driver recommended the best boat times. Great local tips!',
    category: 'transfer',
    routeTag: 'Chania → Balos Beach',
    date: 'August 2025',
  },
  
  // Minibus Reviews
  {
    id: 'rev-14',
    name: 'Wedding Party UK',
    country: 'UK',
    rating: 5,
    text: '14 of us for a wedding. Sprinter was immaculate, driver was in a suit, everything was perfect. Made our special day even better.',
    category: 'minibus',
    date: 'October 2025',
  },
  {
    id: 'rev-15',
    name: 'Corporate Team DE',
    country: 'Germany',
    rating: 5,
    text: 'Company retreat transfer for 12 people. Punctual, professional, and the vehicle was spotless. Highly recommend for business groups.',
    category: 'minibus',
    date: 'September 2025',
  },
  {
    id: 'rev-16',
    name: 'Family Reunion',
    country: 'USA',
    rating: 5,
    text: 'Three generations, one big minibus. Everyone comfortable, even grandma. Driver was patient with all our photo stops.',
    category: 'minibus',
    date: 'August 2025',
  },
];

// Helper functions
export const getReviewsByCategory = (category: ReviewCategory): Review[] => {
  return reviews.filter(r => r.category === category);
};

export const getReviewsByRouteTag = (routeTag: string): Review[] => {
  return reviews.filter(r => r.routeTag?.toLowerCase().includes(routeTag.toLowerCase()));
};

export const getContextualReviews = (
  category?: ReviewCategory,
  routeTag?: string,
  limit: number = 3
): Review[] => {
  let filtered = [...reviews];
  
  // First priority: match route tag
  if (routeTag) {
    const routeMatches = getReviewsByRouteTag(routeTag);
    if (routeMatches.length >= limit) {
      return routeMatches.slice(0, limit);
    }
    // Add category matches to fill remaining slots
    filtered = routeMatches;
  }
  
  // Second priority: match category
  if (category) {
    const categoryMatches = reviews.filter(r => 
      r.category === category && !filtered.find(f => f.id === r.id)
    );
    filtered = [...filtered, ...categoryMatches];
  }
  
  // Fall back to airport/transfer reviews for general cases
  if (filtered.length < limit) {
    const fallbacks = reviews.filter(r => 
      (r.category === 'airport' || r.category === 'transfer') && 
      !filtered.find(f => f.id === r.id)
    );
    filtered = [...filtered, ...fallbacks];
  }
  
  return filtered.slice(0, limit);
};

export const getMixedBestReviews = (limit: number = 6): Review[] => {
  // Get diverse mix for homepage
  const categories: ReviewCategory[] = ['airport', 'tour', 'transfer', 'minibus'];
  const result: Review[] = [];
  
  for (const cat of categories) {
    const catReviews = getReviewsByCategory(cat);
    if (catReviews.length > 0 && result.length < limit) {
      result.push(catReviews[0]);
    }
  }
  
  // Fill remaining with highest quality reviews
  const remaining = reviews.filter(r => !result.find(res => res.id === r.id));
  return [...result, ...remaining].slice(0, limit);
};

// Stats for summary chips
export const getReviewStats = () => ({
  averageRating: 5.0,
  totalReviews: 280,
  fiveStarPercentage: 100,
});
