// Centralized route data for SEO landing pages and route listings
import type { WeatherLocation } from '@/lib/weather';

export interface RouteData {
  id: string;
  from: string;
  to: string;
  duration: string;
  distance: string;
  price: string;
  category: "airport" | "city" | "resort" | "long-distance";
  airport?: "heraklion" | "chania";
  isAirportRoute: boolean;
  hasFixedPrice: boolean;
  fixedPriceFrom?: number;
  badge?: "Most booked" | "Airport" | "Beach" | "Popular";
  tag?: "port" | "ferry"; // For port/ferry routes
  description: string;
  whatsIncluded: string[];
  faqs: { question: string; answer: string }[];
  relatedRoutes: string[];
  weatherLocation?: WeatherLocation;
  image?: string;
}

// Common FAQ answer for vehicle capacity
const vehicleCapacityAnswer = "All prices are per vehicle, not per person. An E-Class fits 1-4 passengers, Sprinter fits 5-11, and Sprinter Maxi fits 12-20. For groups of 20+, contact us for custom arrangements.";
const vehicleCapacityAnswerShort = "All prices are per vehicle, not per person. An E-Class fits 1-4 passengers, Sprinter fits 5-11, and Sprinter Maxi fits 12-20. For groups of 20+, contact us.";

export const routes: RouteData[] = [
  // Chania Airport Routes (Prioritized for homepage)
  {
    id: "chania-airport-to-chania-old-town",
    from: "Chania Airport",
    to: "Chania Old Town",
    duration: "~20 min",
    distance: "14 km",
    price: "€30",
    category: "airport",
    airport: "chania",
    isAirportRoute: true,
    hasFixedPrice: true,
    fixedPriceFrom: 30,
    badge: "Most booked",
    description: "Quick transfer from Chania Airport (CHQ) to the historic old town and Venetian harbor. Start your Chania adventure without the hassle of finding a taxi.",
    whatsIncluded: [
      "Meet & Greet at arrivals",
      "Flight monitoring for delays",
      "Fixed price, no hidden fees",
      "Door-to-door service",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my flight is delayed?", answer: "We track all incoming flights automatically. Your driver adjusts to your actual arrival time—no calls needed, no extra charge." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswer },
      { question: "Can I add an extra stop?", answer: "Yes! One short stop (supermarket, ATM) is included free. Additional stops or detours can be arranged for a small fee." },
      { question: "Do you provide child seats?", answer: "Yes, we provide baby seats, toddler seats, and boosters free of charge. Just let us know what you need when booking." },
      { question: "How do I find the driver?", answer: "Your driver will be waiting at the arrivals exit with a sign showing your name. You'll also receive their contact details beforehand." },
      { question: "Can I cancel or change my booking?", answer: "Free cancellation up to 24h before pickup. Changes can be made anytime by contacting us via WhatsApp or email." },
    ],
    relatedRoutes: ["chania-airport-to-platanias", "chania-airport-to-agia-marina", "chania-airport-to-rethymno"],
  },
  {
    id: "chania-airport-to-platanias",
    from: "Chania Airport",
    to: "Platanias",
    duration: "~25 min",
    distance: "22 km",
    price: "€35",
    category: "resort",
    airport: "chania",
    isAirportRoute: true,
    hasFixedPrice: true,
    fixedPriceFrom: 35,
    badge: "Airport",
    description: "Easy transfer from Chania Airport to the popular beach resort of Platanias. Get to your hotel quickly and start enjoying the famous Platanias beach.",
    whatsIncluded: [
      "Meet & Greet at arrivals",
      "Flight monitoring for delays",
      "Fixed price, no hidden fees",
      "Door-to-door service",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my flight is delayed?", answer: "We track all incoming flights automatically. Your driver adjusts to your actual arrival time—no calls needed, no extra charge." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswer },
      { question: "Can I add an extra stop?", answer: "Yes! One short stop (supermarket, ATM) is included free. Additional stops or detours can be arranged for a small fee." },
      { question: "Do you provide child seats?", answer: "Yes, we provide baby seats, toddler seats, and boosters free of charge. Just let us know what you need when booking." },
      { question: "How do I find the driver?", answer: "Your driver will be waiting at the arrivals exit with a sign showing your name. You'll also receive their contact details beforehand." },
      { question: "Can I cancel or change my booking?", answer: "Free cancellation up to 24h before pickup. Changes can be made anytime by contacting us via WhatsApp or email." },
    ],
    relatedRoutes: ["chania-airport-to-chania-old-town", "chania-airport-to-agia-marina", "chania-airport-to-georgioupolis"],
  },
  {
    id: "chania-airport-to-agia-marina",
    from: "Chania Airport",
    to: "Agia Marina",
    duration: "~30 min",
    distance: "25 km",
    price: "€38",
    category: "resort",
    airport: "chania",
    isAirportRoute: true,
    hasFixedPrice: true,
    fixedPriceFrom: 38,
    badge: "Beach",
    description: "Comfortable transfer from Chania Airport to the beautiful sandy beach resort of Agia Marina. Perfect for families and beach lovers.",
    whatsIncluded: [
      "Meet & Greet at arrivals",
      "Flight monitoring for delays",
      "Fixed price, no hidden fees",
      "Door-to-door service",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my flight is delayed?", answer: "We track all incoming flights automatically. Your driver adjusts to your actual arrival time—no calls needed, no extra charge." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswer },
      { question: "Can I add an extra stop?", answer: "Yes! One short stop (supermarket, ATM) is included free. Additional stops or detours can be arranged for a small fee." },
      { question: "Do you provide child seats?", answer: "Yes, we provide baby seats, toddler seats, and boosters free of charge. Just let us know what you need when booking." },
      { question: "How do I find the driver?", answer: "Your driver will be waiting at the arrivals exit with a sign showing your name. You'll also receive their contact details beforehand." },
      { question: "Can I cancel or change my booking?", answer: "Free cancellation up to 24h before pickup. Changes can be made anytime by contacting us via WhatsApp or email." },
    ],
    relatedRoutes: ["chania-airport-to-platanias", "chania-airport-to-chania-old-town", "chania-airport-to-rethymno"],
  },
  {
    id: "heraklion-airport-to-chania-city",
    from: "Heraklion Airport",
    to: "Chania",
    duration: "~2h 15min",
    distance: "140 km",
    price: "€145",
    category: "long-distance",
    airport: "heraklion",
    isAirportRoute: true,
    hasFixedPrice: true,
    fixedPriceFrom: 145,
    badge: "Airport",
    description: "Long-distance transfer from Heraklion Airport (HER) to Chania. Perfect when flights to Chania Airport aren't available. Relax and enjoy the scenic drive across Crete.",
    whatsIncluded: [
      "Meet & Greet at arrivals",
      "Flight monitoring for delays",
      "Fixed price, no hidden fees",
      "Comfort stops on request",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my flight is delayed?", answer: "We track all incoming flights automatically. Your driver adjusts to your actual arrival time—no calls needed, no extra charge." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswer },
      { question: "Can I add an extra stop?", answer: "Yes! We can stop in Rethymno for lunch or photos. Let us know your preferences when booking." },
      { question: "Do you provide child seats?", answer: "Yes, we provide baby seats, toddler seats, and boosters free of charge. Just let us know what you need when booking." },
      { question: "How do I find the driver?", answer: "Your driver will be waiting at the arrivals exit with a sign showing your name. You'll also receive their contact details beforehand." },
      { question: "Can I cancel or change my booking?", answer: "Free cancellation up to 24h before pickup. Changes can be made anytime by contacting us via WhatsApp or email." },
    ],
    relatedRoutes: ["chania-airport-to-chania-old-town", "chania-airport-to-rethymno", "chania-airport-to-georgioupolis"],
  },
  {
    id: "chania-airport-to-rethymno",
    from: "Chania Airport",
    to: "Rethymno",
    duration: "~45 min",
    distance: "60 km",
    price: "€55",
    category: "city",
    airport: "chania",
    isAirportRoute: true,
    hasFixedPrice: true,
    fixedPriceFrom: 55,
    badge: "Popular",
    description: "Direct transfer from Chania Airport to Rethymno's charming old town. Avoid the bus connections and arrive at your hotel in comfort.",
    whatsIncluded: [
      "Meet & Greet at arrivals",
      "Flight monitoring for delays",
      "Fixed price, no hidden fees",
      "Scenic coastal route",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my flight is delayed?", answer: "We track all incoming flights automatically. Your driver adjusts to your actual arrival time—no calls needed, no extra charge." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswer },
      { question: "Can I add an extra stop?", answer: "Yes! One short stop is included free. Additional stops or detours can be arranged for a small fee." },
      { question: "Do you provide child seats?", answer: "Yes, we provide baby seats, toddler seats, and boosters free of charge. Just let us know what you need when booking." },
      { question: "How do I find the driver?", answer: "Your driver will be waiting at the arrivals exit with a sign showing your name. You'll also receive their contact details beforehand." },
      { question: "Can I cancel or change my booking?", answer: "Free cancellation up to 24h before pickup. Changes can be made anytime by contacting us via WhatsApp or email." },
    ],
    relatedRoutes: ["chania-airport-to-rethymno", "chania-airport-to-chania-old-town", "chania-airport-to-georgioupolis"],
  },
  {
    id: "chania-airport-to-georgioupolis",
    from: "Chania Airport",
    to: "Georgioupolis",
    duration: "~35 min",
    distance: "42 km",
    price: "€45",
    category: "resort",
    airport: "chania",
    isAirportRoute: true,
    hasFixedPrice: true,
    fixedPriceFrom: 45,
    badge: "Beach",
    description: "Transfer from Chania Airport to the family-friendly resort of Georgioupolis, known for its beautiful beach and freshwater lake.",
    whatsIncluded: [
      "Meet & Greet at arrivals",
      "Flight monitoring for delays",
      "Fixed price, no hidden fees",
      "Door-to-door service",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my flight is delayed?", answer: "We track all incoming flights automatically. Your driver adjusts to your actual arrival time—no calls needed, no extra charge." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswer },
      { question: "Can I add an extra stop?", answer: "Yes! We can stop at Lake Kournas for photos if you'd like." },
      { question: "Do you provide child seats?", answer: "Yes, we provide baby seats, toddler seats, and boosters free of charge. Just let us know what you need when booking." },
      { question: "How do I find the driver?", answer: "Your driver will be waiting at the arrivals exit with a sign showing your name. You'll also receive their contact details beforehand." },
      { question: "Can I cancel or change my booking?", answer: "Free cancellation up to 24h before pickup. Changes can be made anytime by contacting us via WhatsApp or email." },
    ],
    relatedRoutes: ["chania-airport-to-rethymno", "chania-airport-to-platanias", "chania-airport-to-chania-old-town"],
  },
  // Port Routes
  {
    id: "souda-port-to-chania",
    from: "Souda Port",
    to: "Chania Old Town",
    duration: "~15 min",
    distance: "7 km",
    price: "€20",
    category: "city",
    airport: "chania",
    isAirportRoute: false,
    hasFixedPrice: true,
    fixedPriceFrom: 20,
    badge: "Popular",
    tag: "port",
    description: "Quick transfer from Souda Port ferry terminal to Chania Old Town. Perfect for travelers arriving by ferry from Piraeus or other Greek islands.",
    whatsIncluded: [
      "Meet & Greet at port exit",
      "Ferry schedule monitoring",
      "Fixed price, no hidden fees",
      "Door-to-door service",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my ferry is delayed?", answer: "We monitor ferry schedules and adjust pickup time accordingly. No extra charge for delays." },
      { question: "Where will the driver meet me?", answer: "Your driver will wait at the main port exit with a sign showing your name." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswerShort },
      { question: "Can I book a return transfer to the port?", answer: "Yes! We offer return transfers to Souda Port for your departure ferry." },
    ],
    relatedRoutes: ["souda-port-to-platanias", "souda-port-to-rethymno", "chania-airport-to-chania-old-town"],
  },
  {
    id: "souda-port-to-platanias",
    from: "Souda Port",
    to: "Platanias",
    duration: "~25 min",
    distance: "20 km",
    price: "€30",
    category: "resort",
    airport: "chania",
    isAirportRoute: false,
    hasFixedPrice: true,
    fixedPriceFrom: 30,
    tag: "port",
    description: "Comfortable transfer from Souda Port to the beach resort of Platanias. Arrive relaxed at your hotel after your ferry journey.",
    whatsIncluded: [
      "Meet & Greet at port exit",
      "Ferry schedule monitoring",
      "Fixed price, no hidden fees",
      "Door-to-door service",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my ferry is delayed?", answer: "We monitor ferry schedules and adjust pickup time accordingly. No extra charge for delays." },
      { question: "Where will the driver meet me?", answer: "Your driver will wait at the main port exit with a sign showing your name." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswerShort },
      { question: "Can I book a return transfer to the port?", answer: "Yes! We offer return transfers to Souda Port for your departure ferry." },
    ],
    relatedRoutes: ["souda-port-to-chania", "souda-port-to-rethymno", "chania-airport-to-platanias"],
  },
  {
    id: "souda-port-to-rethymno",
    from: "Souda Port",
    to: "Rethymno",
    duration: "~50 min",
    distance: "45 km",
    price: "€55",
    category: "city",
    airport: "chania",
    isAirportRoute: false,
    hasFixedPrice: true,
    fixedPriceFrom: 55,
    tag: "port",
    description: "Direct transfer from Souda Port to the historic city of Rethymno. Skip the buses and enjoy a comfortable private ride.",
    whatsIncluded: [
      "Meet & Greet at port exit",
      "Ferry schedule monitoring",
      "Fixed price, no hidden fees",
      "Scenic coastal route",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my ferry is delayed?", answer: "We monitor ferry schedules and adjust pickup time accordingly. No extra charge for delays." },
      { question: "Where will the driver meet me?", answer: "Your driver will wait at the main port exit with a sign showing your name." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswerShort },
      { question: "Can we stop along the way?", answer: "Yes! One short stop is included free. Additional stops can be arranged." },
    ],
    relatedRoutes: ["souda-port-to-chania", "souda-port-to-platanias", "souda-port-to-heraklion"],
  },
  {
    id: "souda-port-to-heraklion",
    from: "Souda Port",
    to: "Heraklion",
    duration: "~2h 30min",
    distance: "145 km",
    price: "€150",
    category: "long-distance",
    airport: "chania",
    isAirportRoute: false,
    hasFixedPrice: true,
    fixedPriceFrom: 150,
    tag: "port",
    description: "Long-distance transfer from Souda Port to Heraklion city or airport. Perfect for travelers connecting from ferry to eastern Crete destinations.",
    whatsIncluded: [
      "Meet & Greet at port exit",
      "Ferry schedule monitoring",
      "Fixed price, no hidden fees",
      "Comfort stops on request",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my ferry is delayed?", answer: "We monitor ferry schedules and adjust pickup time accordingly. No extra charge for delays." },
      { question: "Where will the driver meet me?", answer: "Your driver will wait at the main port exit with a sign showing your name." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswerShort },
      { question: "Can we stop along the way?", answer: "Yes! We can stop in Rethymno for lunch or photos. Just let us know your preferences." },
      { question: "Can you drop me at Heraklion Airport?", answer: "Absolutely! We can drop you at Heraklion Airport (HER) for the same price." },
    ],
    relatedRoutes: ["souda-port-to-chania", "souda-port-to-rethymno", "heraklion-airport-to-chania-city"],
  },
  // Kissamos Port Routes
  {
    id: "kissamos-port-to-chania",
    from: "Kissamos Port",
    to: "Chania Old Town",
    duration: "~45 min",
    distance: "38 km",
    price: "€45",
    category: "city",
    airport: "chania",
    isAirportRoute: false,
    hasFixedPrice: true,
    fixedPriceFrom: 45,
    badge: "Popular",
    tag: "port",
    description: "Comfortable transfer from Kissamos Port to Chania Old Town. Perfect for travelers arriving by ferry from Kythira or returning from a Balos boat trip.",
    whatsIncluded: [
      "Meet & Greet at port",
      "Ferry/boat schedule monitoring",
      "Fixed price, no hidden fees",
      "Door-to-door service",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my ferry is delayed?", answer: "We monitor ferry schedules and adjust pickup time accordingly. No extra charge for delays." },
      { question: "Where will the driver meet me?", answer: "Your driver will wait at the port exit with a sign showing your name." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswerShort },
      { question: "Can I book a return transfer?", answer: "Yes! We offer return transfers to Kissamos Port for your departure or Balos boat trip." },
    ],
    relatedRoutes: ["chania-airport-to-rethymno", "kissamos-port-to-platanias", "chania-airport-to-chania-old-town"],
  },
  {
    id: "kissamos-port-to-platanias",
    from: "Kissamos Port",
    to: "Platanias",
    duration: "~30 min",
    distance: "22 km",
    price: "€35",
    category: "resort",
    airport: "chania",
    isAirportRoute: false,
    hasFixedPrice: true,
    fixedPriceFrom: 35,
    tag: "port",
    description: "Direct transfer from Kissamos Port to the beach resort of Platanias. Ideal after a Balos Beach boat trip or ferry arrival from Kythira.",
    whatsIncluded: [
      "Meet & Greet at port",
      "Ferry/boat schedule monitoring",
      "Fixed price, no hidden fees",
      "Door-to-door service",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my boat is delayed?", answer: "We monitor boat schedules and adjust pickup time accordingly. No extra charge for delays." },
      { question: "Where will the driver meet me?", answer: "Your driver will wait at the port exit with a sign showing your name." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswerShort },
      { question: "Can I book a morning transfer to catch the Balos boat?", answer: "Yes! We offer early morning transfers to Kissamos Port for the Balos boat trips." },
    ],
    relatedRoutes: ["chania-airport-to-rethymno", "kissamos-port-to-chania", "chania-airport-to-platanias"],
  },
  {
    id: "chania-airport-to-kissamos-port",
    from: "Chania Airport",
    to: "Kissamos Port",
    duration: "~50 min",
    distance: "45 km",
    price: "€55",
    category: "airport",
    airport: "chania",
    isAirportRoute: true,
    hasFixedPrice: true,
    fixedPriceFrom: 55,
    tag: "port",
    description: "Direct transfer from Chania Airport to Kissamos Port. Perfect timing for the Balos Beach boat trip or ferry connections to Kythira and Peloponnese.",
    whatsIncluded: [
      "Meet & Greet at arrivals",
      "Flight monitoring for delays",
      "Fixed price, no hidden fees",
      "Door-to-door service",
      "Free cancellation 24h before",
    ],
    faqs: [
      { question: "What happens if my flight is delayed?", answer: "We track all incoming flights automatically. Your driver adjusts to your actual arrival time—no calls needed, no extra charge." },
      { question: "Can I make the morning Balos boat?", answer: "With early flights, yes! We'll calculate the best pickup time to catch your boat." },
      { question: "Is the price per person or per vehicle?", answer: vehicleCapacityAnswerShort },
      { question: "How do I find the driver?", answer: "Your driver will be waiting at the arrivals exit with a sign showing your name." },
    ],
    relatedRoutes: ["chania-airport-to-rethymno", "kissamos-port-to-chania", "chania-airport-to-chania-old-town"],
  },
];

export const getFeaturedRoutes = (): RouteData[] => {
  const featuredIds = [
    "chania-airport-to-chania-old-town",
    "chania-airport-to-platanias",
    "chania-airport-to-agia-marina",
    "chania-airport-to-rethymno",
    "chania-airport-to-georgioupolis",
    "heraklion-airport-to-chania-city",
  ];
  return featuredIds.map(id => routes.find(r => r.id === id)!).filter(Boolean);
};

export const getRouteById = (id: string): RouteData | undefined => {
  return routes.find(route => route.id === id);
};

export const getRelatedRoutes = (routeIds: string[]): RouteData[] => {
  return routes.filter(route => routeIds.includes(route.id));
};

export const filterRoutes = (
  category?: string,
  airport?: string,
  searchTerm?: string
): RouteData[] => {
  return routes.filter(route => {
    if (category && category !== "all" && route.category !== category) return false;
    if (airport && airport !== "all" && route.airport !== airport) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        route.from.toLowerCase().includes(term) ||
        route.to.toLowerCase().includes(term)
      );
    }
    return true;
  });
};
