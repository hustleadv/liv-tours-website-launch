import { useParams, Link, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  Car, 
  Check, 
  MessageCircle,
  Users,
  Briefcase,
  Plane,
  Shield,
  Smartphone,
  UserCheck,
  Info,
  Luggage,
  Loader2
} from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import TrustBar from "@/components/TrustBar";
import QuoteWidget from "@/components/QuoteWidget";
import FAQAccordion from "@/components/FAQAccordion";
import ReviewCard from "@/components/ReviewCard";
import SEOHead from "@/components/SEOHead";
import WeatherDetails from "@/components/WeatherDetails";
import PackingTips from "@/components/PackingTips";

import LocalTip from "@/components/LocalTip";
import { getRouteById, getRelatedRoutes, RouteData } from "@/data/routes";
import { getWeatherLocation } from "@/lib/weatherLocations";
import { DailyForecast, fetchWeatherForecast, getForecastForDate, isDateInForecastRange } from "@/lib/weather";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAllRoutePrices } from "@/hooks/useAllRoutePrices";
import { useDatabaseRoute } from "@/hooks/useDatabaseRoute";

// Animation variants for scroll reveal
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const }
  }
};

// SEO-optimized Route Landing Page Template
const RouteDetail = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const staticRoute = routeId ? getRouteById(routeId) : undefined;
  const { data: dbRoute, isLoading: isLoadingDbRoute } = useDatabaseRoute(staticRoute ? undefined : routeId);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const { isAdmin } = useIsAdmin();

  // Use static route if available, otherwise use database route
  const route = staticRoute || dbRoute;

  // Fetch all route prices from database - MUST be called before any conditional returns
  const { prices: allRoutePrices, isLoading: isLoadingPrices } = useAllRoutePrices({
    pickup: route?.from || '',
    dropoff: route?.to || '',
  });
  
  // Get weather location for dropoff destination
  const weatherLocation = route?.weatherLocation || (route ? getWeatherLocation(route.to) : null);

  // ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS
  // Fetch forecast when date changes
  useEffect(() => {
    const loadForecast = async () => {
      if (!selectedDate || !weatherLocation || !isDateInForecastRange(selectedDate)) {
        setForecast(null);
        return;
      }
      
      const data = await fetchWeatherForecast(weatherLocation);
      if (data) {
        const dayForecast = getForecastForDate(data, selectedDate);
        setForecast(dayForecast);
      }
    };
    
    loadForecast();
  }, [selectedDate, weatherLocation]);

  // Track route view
  useEffect(() => {
    if (route) {
      trackEvent('route_view', { 
        routeId: route.id,
        pickup: route.from,
        dropoff: route.to 
      });
    }
  }, [route]);

  // Show loading while fetching from database
  if (!staticRoute && isLoadingDbRoute) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Redirect to contact if route not found anywhere
  if (!route) {
    const parts = routeId?.split('-to-') || [];
    const fromPart = parts[0]?.replace(/-/g, ' ') || '';
    const toPart = parts[1]?.replace(/-/g, ' ') || '';
    const message = fromPart && toPart 
      ? `?subject=${encodeURIComponent(`Quote Request: ${fromPart} to ${toPart}`)}`
      : '';
    return <Navigate to={`/contact${message}`} replace />;
  }

  const relatedRoutes = getRelatedRoutes(route.relatedRoutes);

  // Sample reviews - in production, these would be filtered by route
  const routeReviews = [
    {
      name: "Thomas & Sarah",
      location: "Manchester, UK",
      rating: 5,
      text: `Perfect transfer from ${route.from} to ${route.to}. Driver was waiting for us with a sign, helped with luggage, and the vehicle was spotless. Highly recommend!`,
      date: "November 2024",
    },
    {
      name: "Maria Gonzalez",
      location: "Madrid, Spain",
      rating: 5,
      text: "Excellent service! Our flight was delayed by 2 hours but the driver was still there waiting. Very professional and friendly.",
      date: "October 2024",
    },
  ];

  // Vehicle options with real prices from database - show all vehicles, with prices or loading/contact us
  const vehicleOptions = [
    { 
      name: "Mercedes E-Class", 
      passengers: "1-4", 
      price: allRoutePrices?.['1-4'] ? `€${Math.round(allRoutePrices['1-4'])}` : route.price,
      hasPrice: !!allRoutePrices?.['1-4'] || !!route.price
    },
    { 
      name: "Mercedes Sprinter", 
      passengers: "5-8", 
      price: allRoutePrices?.['5-8'] ? `€${Math.round(allRoutePrices['5-8'])}` : null,
      hasPrice: !!allRoutePrices?.['5-8']
    },
    { 
      name: "Mercedes Sprinter", 
      passengers: "9-11", 
      price: allRoutePrices?.['9-11'] ? `€${Math.round(allRoutePrices['9-11'])}` : null,
      hasPrice: !!allRoutePrices?.['9-11']
    },
    { 
      name: "Mercedes Sprinter Maxi", 
      passengers: "12-16", 
      price: allRoutePrices?.['12-16'] ? `€${Math.round(allRoutePrices['12-16'])}` : null,
      hasPrice: !!allRoutePrices?.['12-16']
    },
    { 
      name: "Mercedes Sprinter Maxi", 
      passengers: "17-20", 
      price: allRoutePrices?.['17+'] ? `€${Math.round(allRoutePrices['17+'])}` : null,
      hasPrice: !!allRoutePrices?.['17+']
    },
  ];

  // SEO data for structured schema
  const routeSchemaData = {
    from: route.from,
    to: route.to,
    price: route.price,
    duration: route.duration,
    description: route.description,
    routeUrl: `https://livtours.gr/routes/${route.id}`,
  };

  const breadcrumbs = [
    { name: "Home", url: "https://livtours.gr/" },
    { name: "Routes", url: "https://livtours.gr/routes" },
    { name: `${route.from} to ${route.to}`, url: `https://livtours.gr/routes/${route.id}` },
  ];

  const isChania = route.airport === "chania";
  const seoTitle = isChania 
    ? `Μεταφορά ${route.from} → ${route.to} | Από ${route.price} - LIV Tours`
    : `Transfer ${route.from} to ${route.to} | From ${route.price}`;
  const seoDescription = isChania
    ? `Μεταφορά από ${route.from} στο ${route.to} με ${route.price}. ${route.duration} διαδρομή, σταθερή τιμή, παρακολούθηση πτήσης. Κρατήστε τώρα!`
    : `Private transfer from ${route.from} to ${route.to} starting at ${route.price}. ${route.duration} journey, fixed price, flight tracking included.`;

  return (
    <Layout>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={`transfer ${route.from} ${route.to}, taxi ${route.to}, μεταφορά ${route.to}, airport transfer Crete`}
        canonicalUrl={`https://livtours.gr/routes/${route.id}`}
        routeData={routeSchemaData}
        faqItems={route.faqs}
        includeLocalBusiness={true}
        breadcrumbs={breadcrumbs}
      />
      {/* Hero Section */}
      <section className="bg-primary py-10 md:py-16 lg:py-20 relative overflow-hidden flex items-center min-h-[50vh]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-accent rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-olive rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container-wide px-4 sm:px-6 relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Content */}
            <div className="flex flex-col items-center">
              {/* Breadcrumb */}
              <nav className="text-sm text-primary-foreground/60 mb-6 w-full text-center">
                <span className="inline">
                  <Link to="/routes" className="hover:text-primary-foreground transition-colors">
                    Routes
                  </Link>
                  <span className="mx-2">/</span>
                  <span className="text-primary-foreground">{route.to}</span>
                </span>
              </nav>

              {/* H1 - SEO optimized */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight drop-shadow-lg text-center mx-auto"
              >
                <span className="block text-white/80 text-2xl sm:text-3xl font-medium mb-2">Private Transfer from</span>
                {route.from} <span className="text-accent italic font-medium">to</span> {route.to}
              </motion.h1>

              {/* Quick Facts Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8"
              >
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  <span className="text-xs sm:text-sm text-primary-foreground">{route.duration}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  <span className="text-xs sm:text-sm text-primary-foreground">{route.distance}</span>
                </div>
                <div className="hidden sm:flex items-center justify-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <Car className="w-4 h-4 text-accent" />
                  <span className="text-sm text-primary-foreground">Premium Fleet</span>
                </div>
              </motion.div>

              {/* Intro Paragraph */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-primary-foreground/90 mb-4 leading-relaxed font-light text-center max-w-2xl mx-auto"
              >
                {route.description}
              </motion.p>

              {/* AI-powered Local Tip */}
              <div className="mb-6 w-full flex justify-center text-left">
                <LocalTip 
                  locationId={route.id}
                  locationName={route.to}
                  locationType={route.tag === 'port' ? 'port' : route.isAirportRoute ? 'airport' : route.category === 'resort' ? 'resort' : route.category === 'city' ? 'city' : 'general'}
                  useAI={true}
                  isAdmin={isAdmin}
                  variant="hero"
                />
              </div>

              {/* All Prices Block - Full Width */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col gap-3 sm:gap-4 mb-6 w-full"
              >
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-primary-foreground/80">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  <span>Fixed prices • No hidden fees</span>
                </div>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  <div className="flex flex-col items-center justify-center px-2 sm:px-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10">
                    <p className="text-[10px] sm:text-xs text-white/70 mb-0.5 sm:mb-1">1-4 pax</p>
                    <p className="text-lg sm:text-2xl font-bold text-accent">
                      {allRoutePrices?.['1-4'] ? `€${Math.round(allRoutePrices['1-4'])}` : route.price}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">E-Class</p>
                  </div>
                  <div className="flex flex-col items-center justify-center px-2 sm:px-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10">
                    <p className="text-[10px] sm:text-xs text-white/70 mb-0.5 sm:mb-1">5-8 pax</p>
                    <p className="text-lg sm:text-2xl font-bold text-accent">
                      {allRoutePrices?.['5-8'] ? `€${Math.round(allRoutePrices['5-8'])}` : '—'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">Sprinter</p>
                  </div>
                  <div className="flex flex-col items-center justify-center px-2 sm:px-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10">
                    <p className="text-[10px] sm:text-xs text-white/70 mb-0.5 sm:mb-1">9-11 pax</p>
                    <p className="text-lg sm:text-2xl font-bold text-accent">
                      {allRoutePrices?.['9-11'] ? `€${Math.round(allRoutePrices['9-11'])}` : '—'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">Sprinter</p>
                  </div>
                  <div className="flex flex-col items-center justify-center px-2 sm:px-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10">
                    <p className="text-[10px] sm:text-xs text-white/70 mb-0.5 sm:mb-1">12-16 pax</p>
                    <p className="text-lg sm:text-2xl font-bold text-accent">
                      {allRoutePrices?.['12-16'] ? `€${Math.round(allRoutePrices['12-16'])}` : '—'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">Sprinter Maxi</p>
                  </div>
                  <div className="col-span-2 xs:col-span-1 flex flex-col items-center justify-center px-2 sm:px-4 py-3 sm:py-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/10">
                    <p className="text-[10px] sm:text-xs text-white/70 mb-0.5 sm:mb-1">17+ pax</p>
                    <p className="text-lg sm:text-2xl font-bold text-accent">
                      {allRoutePrices?.['17+'] ? `€${Math.round(allRoutePrices['17+'])}` : '—'}
                    </p>
                    <p className="text-[10px] sm:text-xs text-white/60 mt-0.5 sm:mt-1">Sprinter Maxi</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                  <Users className="w-4 h-4" />
                  <span>
                    20+ passengers? <a href="/contact" className="text-accent font-medium hover:underline transition-all">Contact us</a> for custom quotes.
                  </span>
                </div>
              </motion.div>

              {/* Mobile CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:hidden mb-2 justify-center">
                <a href="#quote-form" className="flex-1 w-full max-w-[200px]">
                  <Button variant="hero" size="xl" className="w-full">
                    Get Instant Quote
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </a>
                <a 
                  href={`https://wa.me/306944363525?text=Hi!%20I%20need%20a%20transfer%20from%20${encodeURIComponent(route.from)}%20to%20${encodeURIComponent(route.to)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 w-full max-w-[200px]"
                >
                  <Button variant="whatsapp" size="xl" className="w-full">
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Widget & Weather Layout Container */}
      <section className="bg-background pt-8 pb-4 relative z-20 -mt-10 mb-6">
        <div className="container-wide px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Quote Widget Section */}
            <div id="quote-form" className="scroll-mt-24">
              <QuoteWidget 
                defaultPickup={route.from}
                defaultDropoff={route.to}
                onDateChange={setSelectedDate}
              />
            </div>

            {/* Weather & Packing Section */}
            <div className="flex flex-col gap-6 w-full mt-0">
              {weatherLocation ? (
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col gap-0 h-full">
                  <div className="p-6 pb-2">
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center justify-between">
                      Destination Info
                    </h3>
                  </div>
                  
                  <div className="px-6 flex-1">
                    <WeatherDetails 
                      location={weatherLocation}
                      date={selectedDate}
                      variant="default"
                      className="bg-transparent shadow-none border-b rounded-none px-0"
                    />
                  </div>
                  
                  {forecast && (
                    <div className="px-6 pb-6 pt-2">
                      <PackingTips 
                        forecast={forecast}
                        location={weatherLocation.name}
                        variant="default"
                        className="bg-transparent shadow-none border-none p-0 mt-4 h-full"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-muted/30 border border-border/50 rounded-2xl p-8 flex items-center justify-center h-full min-h-[300px] text-center">
                  <div className="max-w-md">
                    <Car className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Select a travel date in the quote widget to see local weather and personalized packing tips for {route.to}.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* What's Included - Premium badges */}
      <motion.section 
        className="py-8 bg-gradient-to-b from-muted/50 to-background"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <div className="container-wide">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {route.whatsIncluded.slice(0, 6).map((item, index) => (
              <motion.div 
                key={index}
                variants={scaleIn}
                className="flex items-center gap-2 px-4 py-2 bg-background border border-border/50 rounded-full text-sm text-foreground shadow-sm"
              >
                <Check className="w-4 h-4 text-olive flex-shrink-0" />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>


      {/* Vehicle Options */}
      {vehicleOptions.length > 0 && (
        <motion.section 
          className="py-16 bg-background"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="container-wide">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="text-center mb-8"
                variants={fadeInUp}
              >
                <h2 className="text-2xl font-bold text-primary mb-2">
                  Available Vehicles
                </h2>
                <p className="text-muted-foreground">Choose the perfect vehicle for your group</p>
              </motion.div>

              {/* Mobile: horizontal scroll, Desktop: 5-column grid */}
              <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible">
                <motion.div 
                  className="flex gap-3 sm:gap-4 sm:grid sm:grid-cols-5 min-w-max sm:min-w-0"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {vehicleOptions.map((vehicle, index) => (
                    <motion.div 
                      key={`${vehicle.name}-${vehicle.passengers}`} 
                      variants={scaleIn}
                      className="relative w-36 sm:w-auto flex-shrink-0 sm:flex-shrink p-4 sm:p-6 bg-gradient-to-br from-background via-background to-muted/40 border border-border rounded-xl sm:rounded-2xl text-center hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group"
                    >
                      {index === 0 && vehicleOptions.length > 1 && (
                        <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 bg-olive text-white text-[10px] sm:text-xs font-medium rounded-full whitespace-nowrap">
                          Most Popular
                        </div>
                      )}
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-2 sm:mb-4 group-hover:scale-110 transition-transform">
                        <Car className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                      </div>
                      <h3 className="text-sm sm:text-lg font-bold text-primary mb-1 sm:mb-3">{vehicle.name}</h3>
                      <div className="space-y-0.5 sm:space-y-2 mb-2 sm:mb-5">
                        <div className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-muted-foreground">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 text-primary/60" />
                          <span>{vehicle.passengers} pax</span>
                        </div>
                        <div className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-sm text-muted-foreground">
                          <Luggage className="w-3 h-3 sm:w-4 sm:h-4 text-primary/60" />
                          <span>Flexible</span>
                        </div>
                      </div>
                      <div className="pt-2 sm:pt-4 border-t border-border/50">
                        {isLoadingPrices ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-accent" />
                          </div>
                        ) : vehicle.hasPrice && vehicle.price ? (
                          <>
                            <p className="text-xl sm:text-3xl font-bold text-accent">{vehicle.price}</p>
                            <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Fixed price</p>
                          </>
                        ) : (
                          <>
                            <p className="text-base sm:text-xl font-semibold text-muted-foreground">Contact us</p>
                            <p className="text-[9px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">For quote</p>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <motion.div 
                className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-8"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-olive/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-olive" />
                  </div>
                  Meet & Greet included
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-olive/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-olive" />
                  </div>
                  Flight tracking
                </span>
                <Link to="/fleet" className="text-sm text-accent hover:underline flex items-center gap-1.5 font-medium">
                  View all vehicles
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Route FAQs */}
      <motion.section 
        className="py-16 bg-muted/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUp}
      >
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              className="text-center mb-8"
              variants={fadeInUp}
            >
              <h2 className="text-2xl font-bold text-primary mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground">Everything you need to know about this transfer</p>
            </motion.div>
            <motion.div 
              className="bg-background rounded-2xl border border-border/50 p-6 shadow-sm"
              variants={scaleIn}
            >
              <FAQAccordion items={route.faqs} />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Reviews */}
      <motion.section 
        className="py-16 bg-background"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUp}
      >
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="flex items-center justify-between mb-8"
              variants={fadeInUp}
            >
              <div>
                <h2 className="text-2xl font-bold text-primary mb-1">
                  What Our Guests Say
                </h2>
                <p className="text-muted-foreground text-sm">Real reviews from real travelers</p>
              </div>
              <Link 
                to="/reviews" 
                className="text-sm text-accent hover:underline flex items-center gap-1.5 font-medium"
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-5"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {routeReviews.map((review, index) => (
                <motion.div 
                  key={index} 
                  variants={scaleIn}
                  className="bg-muted/30 rounded-2xl p-1"
                >
                  <ReviewCard {...review} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Related Routes */}
      {relatedRoutes.length > 0 && (
        <motion.section 
          className="py-16 bg-muted/30"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeInUp}
        >
          <div className="container-wide">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="flex items-center justify-between mb-8"
                variants={fadeInUp}
              >
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-1">
                    Related Routes
                  </h2>
                  <p className="text-muted-foreground text-sm">Other popular destinations</p>
                </div>
                <Link 
                  to="/routes" 
                  className="text-sm text-accent hover:underline flex items-center gap-1.5 font-medium"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div 
                className="grid sm:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {relatedRoutes.slice(0, 3).map((relRoute) => (
                  <motion.div key={relRoute.id} variants={scaleIn}>
                    <Link 
                      to={`/routes/${relRoute.id}`}
                      className="block p-5 bg-background border border-border/50 rounded-2xl hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Plane className="w-3 h-3 text-primary" />
                        </div>
                        <span className="font-medium">{relRoute.airport === "heraklion" ? "Heraklion" : "Chania"} Airport</span>
                      </div>
                      <h3 className="text-base font-semibold text-primary group-hover:text-accent transition-colors mb-3">
                        {relRoute.to}
                      </h3>
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {relRoute.duration}
                        </span>
                        <span className="text-lg font-bold text-accent">{relRoute.price}</span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* Final CTA */}
      <motion.section 
        className="section-padding bg-primary relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={fadeInUp}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-olive rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container-wide relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            variants={scaleIn}
          >
            <Shield className="w-12 h-12 text-accent mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Book Your {route.to} Transfer
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Fixed price {route.price} • Free cancellation 24h before • Meet & Greet included
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button variant="hero" size="xl">
                  Get Instant Quote
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a 
                href={`https://wa.me/306944363525?text=Hi!%20I%20need%20a%20transfer%20from%20${encodeURIComponent(route.from)}%20to%20${encodeURIComponent(route.to)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="whatsapp" size="xl">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </Layout>
  );
};

export default RouteDetail;
