import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Research-based tour templates derived from Viator, GetYourGuide, Tripadvisor signals
const ICONIC_TOURS = [
  {
    title: "Balos Lagoon and Gramvousa Island",
    slug: "balos-lagoon-gramvousa-island",
    region: "Chania",
    category: "Beach",
    duration_hours: 10,
    time_type: "Full day",
    difficulty: "Moderate",
    walking_level: "Medium",
    best_for: ["Couples", "Families"],
    tags: ["beach", "nature", "instagram", "lagoon", "boat", "westcrete"],
    weather_fit: ["hot_day_friendly"],
    seasonality: ["Apr_to_Oct"],
    stops: [
      { name: "Kissamos Port", lat: 35.4957, lon: 23.6589, stop_minutes: 20, note: "Departure point" },
      { name: "Gramvousa Island", lat: 35.6167, lon: 23.5833, stop_minutes: 90, note: "Venetian fortress exploration" },
      { name: "Balos Lagoon", lat: 35.5833, lon: 23.5667, stop_minutes: 180, note: "Swimming in turquoise waters" }
    ],
    highlights: [
      "Walk along the famous pink and white sand shores",
      "Swim in shallow turquoise waters perfect for all ages",
      "Explore the Venetian fortress ruins on Gramvousa",
      "Capture stunning panoramic views of the lagoon"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff"],
    short_teaser: "Discover the iconic Caribbean-like lagoon and historic island fortress on Crete's northwest coast",
    description: "Experience two of Crete's most photographed destinations in a single memorable day. Begin with a scenic drive through olive groves to Kissamos, then board a traditional boat to Gramvousa Island where you can climb to the Venetian fortress for sweeping sea views. Continue to Balos Lagoon, where shallow turquoise waters meet pink-tinged sand, creating a tropical paradise in the Mediterranean. Spend hours swimming, snorkeling, and soaking in the natural beauty before returning as the sun sets.",
    image_queries: ["Balos Lagoon Crete turquoise", "Gramvousa island fortress Crete", "Balos beach aerial view"],
    sources: [
      { source_name: "Viator", source_url: "https://www.viator.com/Crete-tours/Cruises-Sailing-and-Water-Tours/d960-g3", note: "Top selling Crete boat tour" },
      { source_name: "GetYourGuide", source_url: "https://www.getyourguide.com/chania-l1807/full-day-boat-cruise-to-balos-lagoon-and-gramvousa-island-t157110/", note: "Likely to sell out badge" }
    ]
  },
  {
    title: "Samaria Gorge Trek",
    slug: "samaria-gorge-trek",
    region: "Chania",
    category: "Adventure",
    duration_hours: 12,
    time_type: "Full day",
    difficulty: "Moderate",
    walking_level: "Medium",
    best_for: ["Solo", "Groups"],
    tags: ["nature", "adventure", "gorge", "westcrete", "authentic"],
    weather_fit: ["hot_day_friendly"],
    seasonality: ["Apr_to_Oct"],
    stops: [
      { name: "Omalos Plateau", lat: 35.3500, lon: 23.9000, stop_minutes: 30, note: "Trek starting point" },
      { name: "Samaria Gorge Entrance", lat: 35.3167, lon: 23.9500, stop_minutes: 15, note: "Begin descent" },
      { name: "Iron Gates", lat: 35.2333, lon: 23.9667, stop_minutes: 30, note: "Narrowest point of the gorge" },
      { name: "Agia Roumeli", lat: 35.2333, lon: 23.9833, stop_minutes: 60, note: "Coastal village and ferry point" }
    ],
    highlights: [
      "Walk through Europe's longest gorge at 16 kilometers",
      "Pass through the dramatic Iron Gates, only 3 meters wide",
      "Spot wild Cretan goats (kri-kri) in their natural habitat",
      "End at the charming seaside village of Agia Roumeli"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff", "Ferry ticket from Agia Roumeli"],
    short_teaser: "Conquer Europe's longest gorge through dramatic cliffs, ancient cypress trees and wild nature",
    description: "Challenge yourself with one of Europe's most rewarding hikes through the UNESCO protected Samaria Gorge. Starting from the Omalos Plateau at 1,250 meters, descend through a narrow ravine flanked by towering cliffs and fragrant cypress forests. The 16 kilometer trail offers constantly changing scenery, from shaded woodland paths to the famous Iron Gates where walls rise 300 meters on either side. Complete your adventure at Agia Roumeli village with a refreshing swim in the Libyan Sea.",
    image_queries: ["Samaria Gorge Crete hiking", "Iron Gates Samaria Crete", "Samaria Gorge trail nature"],
    sources: [
      { source_name: "Viator", source_url: "https://www.viator.com/Crete-tours/Sightseeing/d960-tag21725", note: "Best seller hiking tour" },
      { source_name: "Tripadvisor", source_url: "https://www.tripadvisor.com/Attractions-g189413-Activities-c47-Crete.html", note: "Top nature landmark" }
    ]
  },
  {
    title: "Knossos Palace and Heraklion Discovery",
    slug: "knossos-palace-heraklion-discovery",
    region: "Heraklion",
    category: "Culture",
    duration_hours: 6,
    time_type: "Half day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Couples", "Families", "Solo"],
    tags: ["culture", "comfort", "oldtown", "eastcrete", "halfday"],
    weather_fit: ["rainy_safe", "windy_safe"],
    seasonality: ["all_year"],
    stops: [
      { name: "Knossos Palace", lat: 35.2980, lon: 25.1631, stop_minutes: 120, note: "Europe's oldest city" },
      { name: "Heraklion Archaeological Museum", lat: 35.3387, lon: 25.1373, stop_minutes: 60, note: "Minoan artifacts collection" },
      { name: "Heraklion Old Town", lat: 35.3392, lon: 25.1334, stop_minutes: 60, note: "Venetian harbor and market" }
    ],
    highlights: [
      "Explore the legendary Palace of Knossos, center of Minoan civilization",
      "See the famous frescoes including the Bull Leaping scene",
      "Visit the Archaeological Museum with priceless Minoan treasures",
      "Stroll through Heraklion's atmospheric old town and harbor"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff"],
    short_teaser: "Step back 4,000 years into the mythical Minoan world at Europe's oldest city",
    description: "Journey into the heart of ancient civilization at the legendary Palace of Knossos, where the myth of the Minotaur was born. Walk through restored chambers adorned with vivid frescoes depicting dolphins, bulls, and palace life from 2000 BCE. Continue to Heraklion's world class Archaeological Museum to see the original artifacts discovered at Knossos, including the famous Snake Goddess figurines. End your morning exploring the atmospheric old town with its Venetian fortress, lion fountain, and bustling market streets.",
    image_queries: ["Knossos Palace Crete ruins", "Knossos fresco bull Crete", "Heraklion old town harbor"],
    sources: [
      { source_name: "GetYourGuide", source_url: "https://www.getyourguide.com/crete-l404/knossos-palace-skip-the-line-ticket-private-guided-tour-t127091/", note: "Top cultural experience" },
      { source_name: "Tripadvisor", source_url: "https://www.tripadvisor.com/Attraction_Review-g13124727-d195896-Reviews-The_Palace_of_Knossos-Knosos_Crete.html", note: "Top 1 attraction in Crete" }
    ]
  },
  {
    title: "Elafonisi Pink Beach Paradise",
    slug: "elafonisi-pink-beach-paradise",
    region: "Chania",
    category: "Beach",
    duration_hours: 8,
    time_type: "Full day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Couples", "Families"],
    tags: ["beach", "nature", "relax", "instagram", "westcrete", "fullday"],
    weather_fit: ["hot_day_friendly"],
    seasonality: ["Apr_to_Oct"],
    stops: [
      { name: "Topolia Gorge", lat: 35.4333, lon: 23.6833, stop_minutes: 15, note: "Scenic drive viewpoint" },
      { name: "Chrysoskalitissa Monastery", lat: 35.3167, lon: 23.5333, stop_minutes: 30, note: "Clifftop monastery visit" },
      { name: "Elafonisi Beach", lat: 35.2722, lon: 23.5417, stop_minutes: 240, note: "Pink sand beach time" }
    ],
    highlights: [
      "Walk on naturally pink tinted sand created by crushed coral",
      "Wade through shallow lagoon waters to the island peninsula",
      "Discover hidden coves and rock formations along the shore",
      "Visit the dramatic clifftop Chrysoskalitissa Monastery"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff"],
    short_teaser: "Relax on the legendary pink sand beach with crystal clear shallow waters on Crete's southwest tip",
    description: "Escape to one of Europe's most beautiful beaches at Elafonisi, where the sand takes on a delicate pink hue from thousands of tiny crushed shells. The shallow lagoon-like waters are warm and crystal clear, perfect for families and anyone seeking a tropical escape. Wade across the sandbar to explore the small island peninsula with its secluded coves and natural rock pools. Along the way, stop at the historic Chrysoskalitissa Monastery perched dramatically on a cliff overlooking the sea.",
    image_queries: ["Elafonisi beach pink sand Crete", "Elafonisi lagoon aerial", "Chrysoskalitissa monastery Crete"],
    sources: [
      { source_name: "Viator", source_url: "https://www.viator.com/Crete-tours/Day-Trips-and-Excursions/d960-g5", note: "Top day trip destination" },
      { source_name: "Tripadvisor", source_url: "https://www.tripadvisor.com/Attractions-g189413-Activities-Crete.html", note: "Top beach in Crete" }
    ]
  },
  {
    title: "Spinalonga Island and Elounda Bay",
    slug: "spinalonga-island-elounda-bay",
    region: "Lasithi",
    category: "Culture",
    duration_hours: 8,
    time_type: "Full day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Couples", "Families", "Groups"],
    tags: ["culture", "boat", "eastcrete", "authentic", "comfort", "fullday"],
    weather_fit: ["hot_day_friendly"],
    seasonality: ["Apr_to_Oct"],
    stops: [
      { name: "Elounda Village", lat: 35.2500, lon: 25.7333, stop_minutes: 30, note: "Charming fishing village" },
      { name: "Spinalonga Island", lat: 35.2667, lon: 25.7333, stop_minutes: 120, note: "Historic fortress and colony" },
      { name: "Kolokytha Beach", lat: 35.2583, lon: 25.7500, stop_minutes: 90, note: "Swimming and lunch stop" },
      { name: "Plaka Village", lat: 35.2667, lon: 25.7167, stop_minutes: 45, note: "Traditional coastal village" }
    ],
    highlights: [
      "Explore the atmospheric Venetian fortress on Spinalonga Island",
      "Learn the poignant history of Europe's last leper colony",
      "Swim in the crystal clear waters of Kolokytha Bay",
      "Wander through the charming streets of Elounda and Plaka"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff", "Boat transfer to Spinalonga"],
    short_teaser: "Discover the historic island fortress and swim in the stunning bays of Elounda",
    description: "Journey to the storied waters of Mirabello Bay to explore Spinalonga, a tiny island with a remarkable past. The Venetian fortress protected Crete for decades, later becoming a leper colony that operated until 1957. Walk through the abandoned streets where the novel 'The Island' was set, then cruise to secluded Kolokytha beach for swimming in turquoise waters. End your day in the upscale resort town of Elounda and the traditional fishing village of Plaka.",
    image_queries: ["Spinalonga island Crete aerial", "Elounda bay boats Crete", "Spinalonga fortress ruins"],
    sources: [
      { source_name: "GetYourGuide", source_url: "https://www.getyourguide.com/elounda-l145268/spinalonga-boat-trip-from-elounda-port-t155973/", note: "Popular island boat trip" },
      { source_name: "Viator", source_url: "https://www.viator.com/tours/Crete/Full-Day-Small-Group-Tour-in-Crete-the-cave-of-Zeus/d960-314419P2", note: "High rated east Crete tour" }
    ]
  },
  {
    title: "Lasithi Plateau and Zeus Cave",
    slug: "lasithi-plateau-zeus-cave",
    region: "Lasithi",
    category: "Nature",
    duration_hours: 8,
    time_type: "Full day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Families", "Couples"],
    tags: ["nature", "culture", "authentic", "village", "eastcrete", "comfort"],
    weather_fit: ["hot_day_friendly", "cold_day_friendly"],
    seasonality: ["all_year"],
    stops: [
      { name: "Lasithi Plateau", lat: 35.1833, lon: 25.4667, stop_minutes: 60, note: "Mountain plateau with windmills" },
      { name: "Psychro Village", lat: 35.1667, lon: 25.4500, stop_minutes: 30, note: "Traditional mountain village" },
      { name: "Dikteon Cave (Zeus Cave)", lat: 35.1639, lon: 25.4456, stop_minutes: 90, note: "Mythical birthplace of Zeus" },
      { name: "Krasi Village", lat: 35.2333, lon: 25.5167, stop_minutes: 30, note: "Ancient plane tree and fountain" }
    ],
    highlights: [
      "Descend into the mythical cave where Zeus was born",
      "See the dramatic stalactites and stalagmites inside Dikteon Cave",
      "Drive across the unique Lasithi Plateau surrounded by mountains",
      "Visit traditional villages untouched by mass tourism"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff"],
    short_teaser: "Enter the mythical birthplace of Zeus and explore Crete's most scenic mountain plateau",
    description: "Rise above the coastal crowds to discover the magical Lasithi Plateau, a fertile highland valley ringed by mountains and dotted with traditional windmills. The highlight is the Dikteon Cave, revered since ancient times as the birthplace of Zeus, king of the Greek gods. Descend into the illuminated cavern to see spectacular formations that inspired countless myths. Visit authentic mountain villages where locals still practice traditional crafts and enjoy the cooler mountain air.",
    image_queries: ["Lasithi Plateau windmills Crete", "Zeus Cave Dikteon Crete", "Lasithi mountain village"],
    sources: [
      { source_name: "Viator", source_url: "https://www.viator.com/tours/Crete/Cretan-Life-Lasithi-Plateau/d960-314419P2", note: "970+ reviews, 99% recommended" },
      { source_name: "Viator", source_url: "https://www.viator.com/tours/Heraklion/Day-trip-to-Lasithi-plateau-and-Cave-of-Zeus/d961-398065P3", note: "100% recommended" }
    ]
  },
  {
    title: "Chania Old Town Walking Experience",
    slug: "chania-old-town-walking",
    region: "Chania",
    category: "Culture",
    duration_hours: 5,
    time_type: "Half day",
    difficulty: "Easy",
    walking_level: "Medium",
    best_for: ["Couples", "Solo"],
    tags: ["culture", "oldtown", "authentic", "instagram", "westcrete", "halfday"],
    weather_fit: ["rainy_safe", "windy_safe", "cold_day_friendly"],
    seasonality: ["all_year"],
    stops: [
      { name: "Venetian Harbor", lat: 35.5183, lon: 24.0178, stop_minutes: 45, note: "Iconic lighthouse and waterfront" },
      { name: "Old Town Alleys", lat: 35.5167, lon: 24.0167, stop_minutes: 60, note: "Venetian and Ottoman architecture" },
      { name: "Municipal Market", lat: 35.5147, lon: 24.0203, stop_minutes: 45, note: "Local produce and flavors" },
      { name: "Maritime Museum", lat: 35.5192, lon: 24.0172, stop_minutes: 30, note: "Cretan naval history" }
    ],
    highlights: [
      "Photograph the iconic Venetian lighthouse and harbor",
      "Wander through centuries old alleyways with colorful buildings",
      "Explore the covered market filled with local delicacies",
      "Discover hidden courtyards and Ottoman era architecture"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff"],
    short_teaser: "Explore the most picturesque old town in Greece with its Venetian harbor and winding alleys",
    description: "Lose yourself in the enchanting streets of Chania, widely considered the most beautiful city in Crete. The old town is a living museum where Venetian mansions, Ottoman minarets, and Byzantine churches stand side by side. Begin at the iconic harbor with its Egyptian lighthouse, then venture into the labyrinth of narrow streets filled with artisan workshops, tavernas, and hidden gems. Browse the bustling covered market for local honey, herbs, and cheese before relaxing at a waterfront cafe.",
    image_queries: ["Chania old town harbor Crete", "Chania Venetian lighthouse", "Chania old town alley"],
    sources: [
      { source_name: "Tripadvisor", source_url: "https://www.tripadvisor.com/Attractions-g189413-Activities-Crete.html", note: "Top town to visit in Crete" }
    ]
  },
  {
    title: "Rethymno Old Town and Fortezza",
    slug: "rethymno-old-town-fortezza",
    region: "Rethymno",
    category: "Culture",
    duration_hours: 5,
    time_type: "Half day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Couples", "Families", "Solo"],
    tags: ["culture", "oldtown", "authentic", "comfort", "halfday"],
    weather_fit: ["rainy_safe", "windy_safe", "cold_day_friendly"],
    seasonality: ["all_year"],
    stops: [
      { name: "Fortezza Fortress", lat: 35.3750, lon: 24.4750, stop_minutes: 60, note: "Venetian hilltop citadel" },
      { name: "Rethymno Old Town", lat: 35.3667, lon: 24.4833, stop_minutes: 90, note: "Historic streets and architecture" },
      { name: "Rimondi Fountain", lat: 35.3667, lon: 24.4833, stop_minutes: 15, note: "Venetian era landmark" },
      { name: "Venetian Harbor", lat: 35.3650, lon: 24.4800, stop_minutes: 30, note: "Charming waterfront" }
    ],
    highlights: [
      "Climb to the Fortezza, one of the best preserved Venetian castles",
      "Walk through the largest surviving Renaissance old town in Greece",
      "See the ornate Rimondi Fountain dating from 1626",
      "Enjoy the blend of Venetian and Ottoman architecture"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff"],
    short_teaser: "Discover the Renaissance charm of Rethymno with its mighty Venetian fortress and atmospheric old town",
    description: "Step into a perfectly preserved Renaissance world in Rethymno, where every corner reveals architectural treasures from Venetian and Ottoman times. Begin at the imposing Fortezza, a star shaped fortress offering panoramic views over the city and sea. Descend into the old town to explore narrow streets lined with ornate doorways, wooden balconies, and minarets. Discover the historic Rimondi Fountain, still flowing after 400 years, and end at the picturesque harbor lined with traditional fishing boats.",
    image_queries: ["Rethymno Fortezza fortress Crete", "Rethymno old town streets", "Rethymno Venetian harbor"],
    sources: [
      { source_name: "Tripadvisor", source_url: "https://www.tripadvisor.com/Tourism-g189413-Crete-Vacations.html", note: "Major destination in Crete" }
    ]
  },
  {
    title: "Seitan Limania Hidden Cove",
    slug: "seitan-limania-hidden-cove",
    region: "Chania",
    category: "Beach",
    duration_hours: 6,
    time_type: "Half day",
    difficulty: "Moderate",
    walking_level: "Medium",
    best_for: ["Couples", "Solo", "Groups"],
    tags: ["beach", "adventure", "instagram", "westcrete", "halfday"],
    weather_fit: [],
    seasonality: ["Apr_to_Oct"],
    stops: [
      { name: "Seitan Limania Viewpoint", lat: 35.5500, lon: 24.1500, stop_minutes: 15, note: "Dramatic clifftop views" },
      { name: "Seitan Limania Beach", lat: 35.5500, lon: 24.1500, stop_minutes: 150, note: "Swimming in the hidden cove" },
      { name: "Akrotiri Peninsula", lat: 35.5333, lon: 24.1333, stop_minutes: 30, note: "Scenic coastal drive" }
    ],
    highlights: [
      "Descend the dramatic cliff path to the hidden turquoise cove",
      "Swim in one of Crete's most photographed natural pools",
      "Capture the iconic zig-zag shape of the beach from above",
      "Explore the wild Akrotiri Peninsula landscape"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff"],
    short_teaser: "Discover the dramatic hidden cove that Instagram made famous on the wild Akrotiri Peninsula",
    description: "Venture off the beaten path to Seitan Limania, a secret cove tucked between towering cliffs that has become an Instagram sensation. The beach is reached by a scenic path descending the clifface, rewarding you with electric blue waters sheltered from the wind. The unique zig-zag shape of the inlet creates a natural swimming pool perfect for a refreshing dip. Spend the morning swimming and exploring before returning along the rugged Akrotiri Peninsula.",
    image_queries: ["Seitan Limania beach Crete", "Seitan Limania aerial turquoise", "Seitan Limania cliff path"],
    sources: [
      { source_name: "Tripadvisor", source_url: "https://www.tripadvisor.com/Attractions-g189413-Activities-Crete.html", note: "Hidden gem beach" }
    ]
  },
  {
    title: "West Crete Grand Tour",
    slug: "west-crete-grand-tour",
    region: "Chania",
    category: "Nature",
    duration_hours: 10,
    time_type: "Full day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Couples", "Families", "Groups"],
    tags: ["nature", "culture", "village", "westcrete", "comfort", "fullday"],
    weather_fit: ["hot_day_friendly", "cold_day_friendly"],
    seasonality: ["all_year"],
    stops: [
      { name: "Lake Kournas", lat: 35.3333, lon: 24.2833, stop_minutes: 60, note: "Crete's only freshwater lake" },
      { name: "Argyroupoli Village", lat: 35.3167, lon: 24.3167, stop_minutes: 45, note: "Springs and waterfalls" },
      { name: "Rethymno Old Town", lat: 35.3667, lon: 24.4833, stop_minutes: 90, note: "Historic Venetian town" },
      { name: "Chania Old Town", lat: 35.5183, lon: 24.0178, stop_minutes: 90, note: "Venetian harbor exploration" }
    ],
    highlights: [
      "Swim or pedal boat on Crete's only natural freshwater lake",
      "Discover the hidden springs and waterfalls of Argyroupoli",
      "Explore both Rethymno and Chania old towns in one day",
      "Drive through scenic mountain and coastal landscapes"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff"],
    short_teaser: "Experience the highlights of western Crete from mountain lake to Venetian harbors in one epic day",
    description: "Discover the diverse beauty of western Crete on this comprehensive journey from mountains to sea. Begin at serene Lake Kournas, the island's only freshwater lake, where you can swim or explore by pedal boat. Continue to the springs village of Argyroupoli with its ancient Roman ruins and cascading waterfalls. Spend time in both Rethymno and Chania, the two most atmospheric old towns in Crete, each with distinctive Venetian architecture and charming harbors.",
    image_queries: ["Lake Kournas Crete aerial", "Argyroupoli springs Crete", "West Crete landscape"],
    sources: [
      { source_name: "Viator", source_url: "https://www.viator.com/en-CA/tours/Crete/West-Crete-Day-Tour-Chania-Rethymno-Lake-Kournas/d960-121353P2", note: "Popular west Crete day trip" },
      { source_name: "GetYourGuide", source_url: "https://www.getyourguide.com/crete-l404/", note: "Recommended day trip" }
    ]
  }
];

const HIGH_DEMAND_TOURS = [
  {
    title: "Cretan Wine and Olive Oil Trail",
    slug: "cretan-wine-olive-oil-trail",
    region: "Heraklion",
    category: "Food",
    duration_hours: 6,
    time_type: "Half day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Couples", "Groups"],
    tags: ["food", "authentic", "village", "eastcrete", "comfort", "halfday"],
    weather_fit: ["rainy_safe", "windy_safe", "cold_day_friendly"],
    seasonality: ["all_year"],
    stops: [
      { name: "Traditional Olive Mill", lat: 35.2500, lon: 25.1500, stop_minutes: 60, note: "Olive oil production tour" },
      { name: "Boutique Winery", lat: 35.2333, lon: 25.1333, stop_minutes: 90, note: "Vineyard tour and tasting" },
      { name: "Village Kafeneio", lat: 35.2167, lon: 25.1167, stop_minutes: 45, note: "Traditional coffee and meze" }
    ],
    highlights: [
      "Learn the art of olive oil production from grove to bottle",
      "Taste award winning Cretan wines at a family vineyard",
      "Sample local meze paired with regional specialties",
      "Experience authentic village hospitality"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff", "Olive oil and wine tastings included"],
    short_teaser: "Taste the essence of Crete through its legendary olive oil and indigenous wine varieties",
    description: "Immerse yourself in the flavors that have defined Cretan cuisine for millennia. Visit a working olive mill to learn how liquid gold is extracted from ancient trees, sampling different grades and styles. Continue to a boutique winery cultivating indigenous Vidiano and Kotsifali grapes, enjoying a guided tasting overlooking rolling vineyards. End at a traditional village kafeneio where locals gather, savoring mezedes and strong Greek coffee.",
    image_queries: ["Crete olive oil tasting", "Cretan winery vineyard", "Crete traditional village kafeneio"],
    sources: [
      { source_name: "Viator", source_url: "https://www.viator.com/Crete-tours/Olive-Oil-Tasting/d960-tag21484", note: "Top 20 olive oil experiences" },
      { source_name: "Vassilakis Estate", source_url: "https://vassilakisestate.gr/tours/", note: "Top rated wine and oil tours" }
    ]
  },
  {
    title: "Cretan Village Food Journey",
    slug: "cretan-village-food-journey",
    region: "Rethymno",
    category: "Food",
    duration_hours: 7,
    time_type: "Full day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Couples", "Families", "Groups"],
    tags: ["food", "authentic", "village", "comfort", "fullday"],
    weather_fit: ["rainy_safe", "cold_day_friendly"],
    seasonality: ["all_year"],
    stops: [
      { name: "Margarites Pottery Village", lat: 35.3333, lon: 24.6333, stop_minutes: 60, note: "Traditional ceramics workshop" },
      { name: "Axos Mountain Village", lat: 35.3000, lon: 24.8500, stop_minutes: 90, note: "Village cooking demonstration" },
      { name: "Anogia Village", lat: 35.2833, lon: 24.8833, stop_minutes: 60, note: "Shepherds culture and cheese" },
      { name: "Eleftherna Ancient Site", lat: 35.3167, lon: 24.6667, stop_minutes: 45, note: "Archaeological discovery" }
    ],
    highlights: [
      "Watch artisans create traditional Cretan pottery",
      "Learn village recipes from local grandmothers",
      "Taste fresh cheese made by mountain shepherds",
      "Explore the authentic mountain culture of Anogia"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff", "Village lunch included"],
    short_teaser: "Discover the soul of Cretan cooking in mountain villages where traditions remain alive",
    description: "Journey into the heart of authentic Crete where ancient traditions thrive in remote mountain villages. Begin in Margarites where potters craft ceramics using techniques unchanged for centuries. Visit a village home to learn traditional recipes handed down through generations, preparing and sharing a home cooked meal. Climb to proud Anogia, known for its fierce independence and shepherd culture, tasting fresh mizithra cheese and local honey.",
    image_queries: ["Margarites pottery Crete", "Cretan village cooking grandmother", "Anogia village Crete"],
    sources: [
      { source_name: "GetYourGuide", source_url: "https://www.getyourguide.com/crete-l404/", note: "Food and culture category" }
    ]
  },
  {
    title: "Mirabello Bay Sailing and Swimming",
    slug: "mirabello-bay-sailing-swimming",
    region: "Lasithi",
    category: "Beach",
    duration_hours: 7,
    time_type: "Full day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Couples", "Families"],
    tags: ["beach", "boat", "relax", "eastcrete", "instagram", "fullday"],
    weather_fit: [],
    seasonality: ["Apr_to_Oct"],
    stops: [
      { name: "Agios Nikolaos Marina", lat: 35.1917, lon: 25.7167, stop_minutes: 20, note: "Departure point" },
      { name: "Kolokytha Beach", lat: 35.2583, lon: 25.7500, stop_minutes: 90, note: "Swimming and snorkeling" },
      { name: "Spinalonga Waters", lat: 35.2667, lon: 25.7333, stop_minutes: 60, note: "Scenic cruise past the island" },
      { name: "Secret Cove", lat: 35.2200, lon: 25.7400, stop_minutes: 90, note: "Private beach stop" }
    ],
    highlights: [
      "Cruise the stunning Mirabello Bay by traditional boat",
      "Swim and snorkel in secluded bays inaccessible by land",
      "Enjoy a freshly prepared lunch on board",
      "Pass by historic Spinalonga Island"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff", "Boat trip with lunch included"],
    short_teaser: "Cruise the crystal waters of Mirabello Bay to hidden beaches and secluded swimming spots",
    description: "Experience the magic of eastern Crete from the water on a leisurely cruise through Mirabello Bay. Set sail from charming Agios Nikolaos past the historic silhouette of Spinalonga Island to reach beaches only accessible by boat. Drop anchor in turquoise waters to swim, snorkel, and explore underwater caves. Enjoy a fresh seafood lunch prepared on board as you drift between secluded coves, returning as the afternoon sun paints the cliffs golden.",
    image_queries: ["Mirabello Bay Crete sailing", "Agios Nikolaos boat cruise", "Kolokytha beach Crete"],
    sources: [
      { source_name: "GetYourGuide", source_url: "https://www.getyourguide.com/elounda-l145268/spinalonga-boat-trip-from-elounda-port-t155973/", note: "Alternative to Spinalonga only" }
    ]
  },
  {
    title: "Lake Kournas Nature Escape",
    slug: "lake-kournas-nature-escape",
    region: "Chania",
    category: "Nature",
    duration_hours: 6,
    time_type: "Half day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Families", "Couples"],
    tags: ["nature", "relax", "family", "westcrete", "comfort", "halfday"],
    weather_fit: ["hot_day_friendly"],
    seasonality: ["Apr_to_Oct"],
    stops: [
      { name: "Lake Kournas", lat: 35.3333, lon: 24.2833, stop_minutes: 150, note: "Swimming, pedal boats, terrapins" },
      { name: "Kournas Village", lat: 35.3167, lon: 24.2667, stop_minutes: 45, note: "Traditional village lunch" },
      { name: "Georgioupoli Beach", lat: 35.3667, lon: 24.2500, stop_minutes: 60, note: "Optional seaside time" }
    ],
    highlights: [
      "Swim in Crete's only natural freshwater lake",
      "Spot the friendly terrapins that inhabit the lake",
      "Explore by pedal boat or kayak at your own pace",
      "Enjoy lunch overlooking the tranquil waters"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff"],
    short_teaser: "Relax at Crete's only freshwater lake where mountains meet emerald waters",
    description: "Escape the coastal crowds for a tranquil day at Lake Kournas, a hidden gem nestled between mountains. The crystal clear freshwater lake is perfect for swimming, with a sandy bottom that slopes gently into deeper waters. Rent a pedal boat or kayak to explore the shores and spot the friendly terrapins that call the lake home. Enjoy a leisurely lunch at a waterside taverna before optional time at nearby Georgioupoli beach where the river meets the sea.",
    image_queries: ["Lake Kournas Crete swimming", "Lake Kournas pedal boats", "Lake Kournas nature"],
    sources: [
      { source_name: "Greeka", source_url: "https://www.greeka.com/crete/chania/sightseeing/lake-kournas/", note: "Top nature attraction" },
      { source_name: "Viator", source_url: "https://www.viator.com/Crete-attractions/Kournas-Lake/d960-a17212", note: "Popular day trip stop" }
    ]
  },
  {
    title: "Falassarna Sunset and Beach",
    slug: "falassarna-sunset-beach",
    region: "Chania",
    category: "Beach",
    duration_hours: 7,
    time_type: "Full day",
    difficulty: "Easy",
    walking_level: "Low",
    best_for: ["Couples", "Groups"],
    tags: ["beach", "sunset", "relax", "instagram", "westcrete", "fullday"],
    weather_fit: [],
    seasonality: ["Apr_to_Oct"],
    stops: [
      { name: "Falassarna Beach", lat: 35.5000, lon: 23.5667, stop_minutes: 240, note: "Wide sandy beach and swimming" },
      { name: "Ancient Falassarna", lat: 35.5000, lon: 23.5833, stop_minutes: 30, note: "Greco-Roman port ruins" },
      { name: "Sunset Viewpoint", lat: 35.4833, lon: 23.5500, stop_minutes: 45, note: "Famous sunset views" }
    ],
    highlights: [
      "Relax on one of Europe's widest golden sand beaches",
      "Swim in crystal clear waters with mountain backdrops",
      "Explore ancient Greco Roman harbor ruins",
      "Watch the legendary Falassarna sunset over the sea"
    ],
    includes: ["Complimentary water, soft drinks, local snacks and seasonal fruit", "Air conditioned vehicle transfer", "Professional English speaking driver", "Hotel pickup and dropoff"],
    short_teaser: "Spend a perfect day at Crete's most beloved beach and witness its legendary sunset",
    description: "Discover why Falassarna consistently ranks among Europe's best beaches on this relaxing full day escape. The wide expanse of golden sand stretches for over a kilometer, backed by dramatic mountains and lapped by clear turquoise waters. Spend hours swimming, sunbathing, and exploring the ancient port city ruins nearby. Stay as the sun begins its descent, painting the sky in brilliant oranges and pinks in what many call the most beautiful sunset in Greece.",
    image_queries: ["Falassarna beach Crete wide", "Falassarna sunset golden", "Falassarna ancient ruins"],
    sources: [
      { source_name: "Tripadvisor", source_url: "https://www.tripadvisor.com/Attractions-g189413-Activities-Crete.html", note: "Top beach for sunset" }
    ]
  }
];

// Unsplash API for open-license images
async function searchUnsplashImages(query: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=4&orientation=landscape`,
      {
        headers: {
          'Authorization': 'Client-ID YOUR_UNSPLASH_ACCESS_KEY'
        }
      }
    );
    
    if (!response.ok) {
      console.log('Unsplash API not available, using placeholders');
      return [];
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.log('Unsplash search failed:', error);
    return [];
  }
}

// Generate image metadata
function createImageMeta(query: string, index: number): any {
  // Since we may not have Unsplash API access, create placeholder metadata
  return {
    url: `https://images.unsplash.com/photo-placeholder?q=${encodeURIComponent(query)}`,
    alt: query.replace(/Crete/gi, '').trim(),
    source: 'placeholder',
    source_url: 'https://unsplash.com',
    license: 'Unsplash License (pending)',
    search_query: query
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type = 'all', regenerate_missing_only = false } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get existing auto-generated tours
    const { data: existingTours } = await supabase
      .from('tours')
      .select('slug, source_summary')
      .like('source_summary', '%auto_generated%');
    
    const existingSlugs = new Set((existingTours || []).map(t => t.slug));
    
    let toursToCreate: any[] = [];
    
    if (type === 'all' && !regenerate_missing_only) {
      // Delete existing auto-generated tours first
      if (existingTours && existingTours.length > 0) {
        await supabase
          .from('tours')
          .delete()
          .like('source_summary', '%auto_generated%');
      }
      toursToCreate = [...ICONIC_TOURS, ...HIGH_DEMAND_TOURS];
    } else if (type === 'iconic') {
      toursToCreate = ICONIC_TOURS.filter(t => !existingSlugs.has(t.slug));
    } else if (type === 'missing' || regenerate_missing_only) {
      // Only regenerate the 5 high-demand tours
      for (const tour of HIGH_DEMAND_TOURS) {
        if (existingSlugs.has(tour.slug)) {
          await supabase.from('tours').delete().eq('slug', tour.slug);
        }
      }
      toursToCreate = HIGH_DEMAND_TOURS;
    }
    
    const createdTours: any[] = [];
    
    for (const template of toursToCreate) {
      // Build images object with placeholders and search queries
      const images = {
        cover_url: null,
        gallery_urls: [],
        cover: createImageMeta(template.image_queries[0], 0),
        gallery: template.image_queries.slice(1, 4).map((q: string, i: number) => createImageMeta(q, i + 1))
      };
      
      // Build source summary with auto_generated flag
      const sourceSummary = JSON.stringify({
        auto_generated: true,
        generated_at: new Date().toISOString(),
        type: ICONIC_TOURS.includes(template) ? 'iconic' : 'high_demand',
        research_sources: template.sources
      });
      
      const tourData = {
        title: template.title,
        slug: template.slug,
        region: template.region,
        category: template.category,
        duration_hours: template.duration_hours,
        time_type: template.time_type,
        difficulty: template.difficulty,
        walking_level: template.walking_level,
        best_for: template.best_for,
        tags: template.tags,
        weather_fit: template.weather_fit,
        seasonality: template.seasonality,
        pickup_options: ['Chania', 'Rethymno', 'Heraklion'],
        stops: template.stops,
        highlights: template.highlights,
        includes: template.includes,
        short_teaser: template.short_teaser,
        description: template.description,
        images: images,
        source_summary: sourceSummary,
        status: 'published',
        popular_score: ICONIC_TOURS.includes(template) ? 85 : 70,
        price_from_eur: null
      };
      
      const { data, error } = await supabase
        .from('tours')
        .insert(tourData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating tour:', template.slug, error);
      } else {
        createdTours.push(data);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        created: createdTours.length,
        tours: createdTours.map(t => ({ title: t.title, slug: t.slug }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    console.error('Error in generate-auto-tours:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
