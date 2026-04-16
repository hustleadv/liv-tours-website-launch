import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowRight, Plane, MapIcon, Users, Star, MessageCircle, Check, Crown, Gift, Sparkles, Car, Cloud, Palmtree, Waves, Calendar, ShieldCheck, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import QuoteWidget from "@/components/QuoteWidget";
import FleetCard from "@/components/FleetCard";
import FAQAccordion from "@/components/FAQAccordion";
import SEOHead from "@/components/SEOHead";
import PopularRoutesSection from "@/components/PopularRoutesSection";
import FinalCTABlock from "@/components/FinalCTABlock";
import WeatherForecastWidget from "@/components/WeatherForecastWidget";
import ContextualReviews from "@/components/ContextualReviews";
import WhyChooseLIV from "@/components/WhyChooseLIV";
import SavedQuotes from "@/components/SavedQuotes";
import WeatherAlertBanner from "@/components/WeatherAlertBanner";
import { useLoyaltyStatus } from "@/components/LoyaltyBadge";
import heroImage from "@/assets/IMG_7837.jpg";
import fleetSedan from "@/assets/fleet-sedan-new.webp";
import fleetMinivan from "@/assets/fleet-vclass-exterior.webp";
import fleetMinibus from "@/assets/minibusmaxi4.jpg";
import toursHero from "@/assets/tours/balos-gramvousa-cover.webp";
import heroAirport from "@/assets/hero-transfer.webp";
import eventsHero from "@/assets/events_weddings_vclass.png";
import { useState, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SavedQuote, useSavedQuotes } from "@/hooks/useSmartBooking";
import { fetchWeatherForecast, DailyForecast } from "@/lib/weather";
import { trackEvent } from "@/lib/tracking";
import { motion } from "framer-motion";

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { savedQuotes } = useSavedQuotes();
  const loyaltyStatus = useLoyaltyStatus();
  const [quotePickup, setQuotePickup] = useState("");
  const [quoteDropoff, setQuoteDropoff] = useState("");
  const [quoteKey, setQuoteKey] = useState(0);
  const [todayForecast, setTodayForecast] = useState<DailyForecast | null>(null);
  const [dismissedVipBanner, setDismissedVipBanner] = useState(() => {
    return sessionStorage.getItem('vip_banner_dismissed') === 'true';
  });
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  // Parallax effect with RAF throttling for better performance
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (heroRef.current) {
            const scrolled = window.scrollY;
            const heroHeight = heroRef.current.offsetHeight;
            if (scrolled <= heroHeight) {
              setParallaxOffset(scrolled * 0.4);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle URL params for pre-filling quote form
  useEffect(() => {
    const pickup = searchParams.get('pickup');
    const dropoff = searchParams.get('dropoff');
    
    if (pickup || dropoff) {
      setQuotePickup(pickup || '');
      setQuoteDropoff(dropoff || '');
      setQuoteKey(prev => prev + 1);
    }
  }, [searchParams]);

  // Handle hash scroll (e.g., #quote-section)
  useEffect(() => {
    if (location.hash === '#quote-section' || location.hash === '#quote') {
      setTimeout(() => {
        // Try mobile section first, then hero section for desktop
        const mobileSection = document.getElementById('quote-section');
        const heroSection = document.getElementById('hero-quote');
        const target = mobileSection || heroSection;
        
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Fallback: scroll to top where hero quote widget is
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash, quoteKey]);

  // Fetch weather for homepage alert
  useEffect(() => {
    const loadWeatherAlert = async () => {
      const weatherData = await fetchWeatherForecast({ 
        name: 'Chania', 
        lat: 35.5138, 
        lon: 24.0180 
      });
      
      if (weatherData && weatherData.forecasts.length > 0) {
        // Get today's forecast
        const today = new Date().toISOString().split('T')[0];
        const todayData = weatherData.forecasts.find(f => f.date === today) || weatherData.forecasts[0];
        
        // Check if there's an extreme condition worth alerting
        const hasExtreme = 
          todayData.windSpeed >= 35 || 
          todayData.precipitationProbability >= 70 ||
          [55, 63, 65, 73, 75, 81, 82, 95, 96, 99].includes(todayData.weatherCode);
        
        if (hasExtreme) {
          setTodayForecast(todayData);
          trackEvent('weather_insight_shown' as any, { insightType: 'homepage_alert' });
        }
      }
    };
    
    loadWeatherAlert();
  }, []);

  const handlePrefillQuote = useCallback((pickup: string, dropoff: string) => {
    setQuotePickup(pickup);
    setQuoteDropoff(dropoff);
    setQuoteKey(prev => prev + 1);
    
    const quoteSection = document.getElementById('quote-section');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleResumeQuote = useCallback((quote: SavedQuote) => {
    // Prefill with saved quote data and scroll to widget
    setQuotePickup(quote.pickup);
    setQuoteDropoff(quote.dropoff);
    setQuoteKey(prev => prev + 1);
    
    const quoteSection = document.getElementById('quote-section');
    if (quoteSection) {
      quoteSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const services = [
    {
      icon: Plane,
      title: t.services.airportTransfers.title,
      description: t.services.airportTransfers.description,
      link: "/transfers",
      image: heroImage,
    },
    {
      icon: MapIcon,
      title: t.services.privateTours.title,
      description: t.services.privateTours.description,
      link: "/tours",
      image: toursHero,
    },
    {
      icon: Users,
      title: t.services.groupMinibus.title,
      description: t.services.groupMinibus.description,
      link: "/fleet",
      image: fleetMinibus,
    },
  ];

  const fleetVehicles = [
    {
      name: "Mercedes E-Class",
      category: "Sedan",
      passengers: 4,
      luggage: 3,
      image: fleetSedan,
      features: ["wifi", "ac", "leather"],
    },
    {
      name: "Mercedes Sprinter",
      category: "Minivan",
      passengers: 11,
      luggage: 6,
      image: fleetMinivan,
      features: ["wifi", "ac", "usb"],
    },
    {
      name: "Mercedes Sprinter Maxi",
      category: "Group Minibus",
      image: fleetMinibus,
      passengers: 20,
      luggage: 20,
      features: ["ac", "premium sound", "large windows"],
      imageClassName: "object-[center_70%]",
    },
  ];

  const faqs = [
    {
      question: t.faqs.howDoIBook.question,
      answer: t.faqs.howDoIBook.answer,
    },
    {
      question: t.faqs.flightDelayed.question,
      answer: t.faqs.flightDelayed.answer,
    },
    {
      question: t.faqs.pricesFixed.question,
      answer: t.faqs.pricesFixed.answer,
    },
    {
      question: t.faqs.childSeats.question,
      answer: t.faqs.childSeats.answer,
    },
    {
      question: t.faqs.canICancel.question,
      answer: t.faqs.canICancel.answer,
    },
    {
      question: t.faqs.howDoIPay.question,
      answer: t.faqs.howDoIPay.answer,
    },
  ];

  return (
    <Layout>
      <SEOHead
        title="Μεταφορές Αεροδρομίου Χανίων & Ηρακλείου | Ταξί Κρήτη - LIV Tours"
        description="Κορυφαία υπηρεσία μεταφορών αεροδρομίου στα Χανιά και την Κρήτη. Σταθερές τιμές, παρακολούθηση πτήσης, Mercedes στόλος, 5★ στο Google. Κρατήστε online τώρα!"
        keywords="μεταφορά αεροδρόμιο Χανιά, ταξί Χανιά, transfer Chania airport, taxi Crete, μεταφορές Κρήτη, airport transfer Heraklion, ταξί αεροδρόμιο Ηράκλειο, private transfer Crete"
        canonicalUrl="https://livtours.gr/"
      />

      {/* Weather Alert Banner - shows only for extreme conditions, positioned inside hero */}

      {/* VIP Welcome Banner */}
      {loyaltyStatus.level === 'vip' && !dismissedVipBanner && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
          <div className="container-wide py-3 relative">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {language === 'gr' ? 'Καλώς ήρθες πίσω, VIP!' : 'Welcome back, VIP!'}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <p className="text-sm text-white/90">
                    {language === 'gr' 
                      ? 'Η έκπτωση 10% σου εφαρμόζεται αυτόματα σε όλες τις κρατήσεις'
                      : 'Your 10% discount is auto-applied to all bookings'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <Gift className="w-4 h-4" />
                  <span className="text-sm font-semibold">-10%</span>
                </div>
                <button 
                  onClick={() => {
                    setDismissedVipBanner(true);
                    sessionStorage.setItem('vip_banner_dismissed', 'true');
                  }}
                  className="text-white/70 hover:text-white text-sm underline underline-offset-2"
                >
                  {language === 'gr' ? 'Απόκρυψη' : 'Dismiss'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loyal Customer Banner */}
      {loyaltyStatus.level === 'loyal' && !dismissedVipBanner && (
        <div className="relative overflow-hidden bg-gradient-to-r from-olive via-olive/90 to-olive text-white">
          <div className="container-wide py-3 relative">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">
                      {language === 'gr' ? 'Πιστός Πελάτης' : 'Loyal Customer'}
                    </span>
                  </div>
                  <p className="text-sm text-white/90">
                    {language === 'gr' 
                      ? 'Απολαύστε 5% έκπτωση σε όλες τις κρατήσεις!'
                      : 'Enjoy 5% off on all bookings!'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                  <Gift className="w-4 h-4" />
                  <span className="text-sm font-semibold">-5%</span>
                </div>
                <button 
                  onClick={() => {
                    setDismissedVipBanner(true);
                    sessionStorage.setItem('vip_banner_dismissed', 'true');
                  }}
                  className="text-white/70 hover:text-white text-sm underline underline-offset-2"
                >
                  {language === 'gr' ? 'Απόκρυψη' : 'Dismiss'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== HERO SECTION - QUIET LUXURY RELOADED ========== */}
      <section ref={heroRef} className="relative min-h-[65vh] md:min-h-screen flex items-center justify-center overflow-hidden" aria-label="Welcome to LIV Tours">
        {/* Background Layer with Advanced Cinematic Overlay */}
        <div className="absolute inset-0 md:-top-20 md:-bottom-20 overflow-hidden">
          <img
            src={heroImage}
            alt=""
            role="presentation"
            className="w-full h-full md:h-[110%] object-cover object-[50%_center] md:object-[center_60%] will-change-transform scale-105"
            style={{ transform: typeof window !== 'undefined' && window.innerWidth > 768 ? `translateY(${parallaxOffset}px)` : 'none' }}
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          {/* Multi-layered cinematic overlays */}
          <div className="absolute inset-0 bg-slate-950/40" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-background" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/40 opacity-30" aria-hidden="true" />
        </div>

        <div className="container-wide relative z-10 pt-16 pb-20 md:pt-48 md:pb-40 text-center">
          <div className="max-w-5xl mx-auto">
            {/* Sophisticated Trust Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-4 px-6 py-2.5 bg-white/10 backdrop-blur-2xl rounded-full mb-10 border border-white/20 shadow-[0_0_30px_rgba(0,0,0,0.3)]"
            >

              <div className="flex items-center gap-1.5" role="img" aria-label="5 star rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" aria-hidden="true" />
                ))}
              </div>
              <div className="w-px h-5 bg-white/20" aria-hidden="true" />
              <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-white">5.0 on Google Chania</span>
            </motion.div>
            
            {/* Premium Subtitle Heading - SEO Optimized */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-xs md:text-sm font-black text-accent uppercase tracking-[0.4em] mb-6 drop-shadow-md"
            >
              Elite Chania Airport Transfers & Bespoke Crete Tours
            </motion.p>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-white leading-[1.1]"
            >
              Experience Chania in <span className="block text-accent italic font-serif mt-2 md:mt-4 underline decoration-accent/20 underline-offset-8">Absolute Luxury</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-base md:text-xl text-white/80 leading-relaxed mb-12 max-w-2xl mx-auto font-medium drop-shadow-md px-4"
            >
              The premier choice for Chania airport transfers and private taxi services across Crete. Arrive in style with our elite Mercedes fleet and professional local drivers.
            </motion.p>

            {/* Floating Quick Action Widget Container - Enhanced Glassmorphism */}
            <motion.div 
              id="hero-quote" 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
              className="hidden md:block relative max-w-5xl mx-auto scroll-mt-24 mb-20 group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 via-white/10 to-accent/30 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" aria-hidden="true" />
              <div className="relative border-4 border-white/5 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
                <QuoteWidget 
                  key={`hero-${quoteKey}`}
                  variant="hero" 
                  defaultPickup={quotePickup}
                  defaultDropoff={quoteDropoff}
                />
              </div>
            </motion.div>

            {/* Premium Features Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/60"
            >
              {[
                { icon: Check, label: t.home.instantConfirmation },
                { icon: Check, label: t.home.noHiddenFees },
                { icon: Check, label: t.home.flightMonitoring }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                    <feature.icon className="w-3.5 h-3.5 text-accent" strokeWidth={3} />
                  </div>
                  <span className="group-hover:text-white transition-colors">{feature.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Cinematic Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-30 hidden md:block">
          <div className="w-[1px] h-16 bg-gradient-to-b from-accent to-transparent" />
        </div>
      </section>

      {/* Saved Quotes Section - only show if there are saved quotes */}
      {savedQuotes.length > 0 && (
        <section className="py-6 bg-cream-warm/50">
          <div className="container-wide">
            <SavedQuotes 
              onResumeQuote={handleResumeQuote} 
              variant="compact"
            />
          </div>
        </section>
      )}
      {/* Mobile Quote Section - shown only on mobile below hero to let the hero image shine */}
      <section id="quote-section" className="md:hidden py-12 px-4 relative z-20 -mt-20 scroll-mt-24">
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100">
          <div className="mb-8 text-center">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-2"
            >
              Instant Booking
            </motion.p>
            <h2 className="text-2xl font-black text-primary leading-tight">
              Get Your <span className="text-accent italic font-serif">Fixed Quote</span>
            </h2>
          </div>
          <QuoteWidget 
            key={`mobile-${quoteKey}`}
            variant="hero" 
            defaultPickup={quotePickup}
            defaultDropoff={quoteDropoff}
          />
          
          <div className="mt-8 flex flex-col gap-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 italic text-center">
            <div className="flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-accent" /> Fixed Price</span>
              <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-accent" /> No Hidden Fees</span>
            </div>
          </div>
        </div>
      </section>



      <PopularRoutesSection onGetQuote={handlePrefillQuote} />

      {/* ========== SERVICES SECTION - REDESIGNED ========== */}
      <section className="section-padding content-auto bg-slate-50/50 relative overflow-hidden" aria-labelledby="services-heading">
        {/* Decorative Background - Subtle Luxury Sync */}
        <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-accent/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 pointer-events-none" />
        
        <div className="container-wide relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 md:mb-28">
            <div className="max-w-4xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full mb-8 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <Award className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Our Expertise</span>
              </motion.div>
              
            <h2 id="services-heading" className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                Elite Chania <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">Travel Services</span>
            </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                The leading provider for Chania airport transfers and bespoke private excursions. We elevate every mile of your Crete journey with luxury, privacy, and reliability.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link to="/tours">
                <Button variant="outline" size="xl" className="rounded-full px-12 group hover:bg-primary hover:text-primary-foreground transition-all duration-500 shadow-sm hover:shadow-xl border-primary text-primary">
                  Explore All Services
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[
              { 
                title: t.nav.airportTransfers, 
                desc: t.services.airportTransfers.description, 
                tagline: 'Reliable. Punctual. Professional.',
                icon: Plane, 
                link: "/services/airport-transfers",
                image: heroAirport
              },
              { 
                title: t.nav.privateTours, 
                desc: t.services.privateTours.description, 
                tagline: 'Personalized. Local. Immersive.',
                icon: MapIcon, 
                link: "/tours",
                image: toursHero
              },
              { 
                title: t.events.heroTitle, 
                desc: t.events.heroSubtitle, 
                tagline: 'Elegant. Grand. Coordinated.',
                icon: Gift, 
                link: "/services/weddings-events",
                image: eventsHero
              }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative overflow-hidden rounded-[3rem] aspect-[4/5] md:aspect-[3/4] shadow-sm hover:shadow-2xl transition-all duration-700"
              >
                <Link to={service.link} className="block w-full h-full">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                  <div className="absolute inset-0 border border-white/10 rounded-[3rem] m-4 pointer-events-none" />
                  <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:bg-accent group-hover:border-accent transition-all duration-500">
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2 opacity-80 group-hover:opacity-100 transition-opacity">{service.tagline}</p>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-white group-hover:translate-x-2 transition-transform duration-500">{service.title}</h3>
                    <p className="text-sm md:text-base text-white/70 line-clamp-2 mb-8 group-hover:opacity-100 transition-opacity">
                      {service.desc}
                    </p>
                    <div className="flex items-center gap-2 text-sm font-bold text-accent group-hover:gap-4 transition-all duration-300">
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SHARED TOURS SECTION - FEATURED ELAFONISI ========== */}
      <section className="section-padding content-auto bg-background relative overflow-hidden" aria-labelledby="shared-tours-heading">
        {/* Artistic Background - Coastal/Adventure vibe sync */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/2 pointer-events-none" />
        
        <div className="container-wide relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 xl:gap-24">
            {/* Left Column: Content */}
            <div className="w-full lg:w-1/2 order-2 lg:order-1">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full mb-8 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <Users className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Weekly Group Excursion</span>
              </motion.div>
              
              <h2 id="shared-tours-heading" className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                Elafonisi Pink Sand <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">Shared Experience</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mb-12">
                Join our most requested group tour to the legendary Elafonisi beach. Crystal lagoons, rose-tinted sands, and absolute comfort in our premium Mercedes fleet.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                {[
                  { icon: Calendar, label: 'Every Wednesday', desc: 'Secure departure' },
                  { icon: Check, label: 'Fixed Price', desc: '€38 per person' },
                  { icon: Car, label: 'Mercedes Minivan', desc: 'Air-conditioned comfort' },
                  { icon: Star, label: 'Best Seller', desc: 'Highly requested' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold text-primary leading-none mb-1">{item.label}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link to="/tours/shared" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto rounded-full px-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20">
                    Book Your Spot
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <div className="text-sm font-bold text-muted-foreground">
                  <span className="text-accent underline underline-offset-4 decoration-accent/30 mr-2">Limited Seats</span> 
                  available each week
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image Card */}
            <div className="w-full lg:w-1/2 order-1 lg:order-2">
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="group relative overflow-hidden rounded-[4rem] aspect-[4/5] shadow-2xl"
              >
                <img 
                  src="/src/assets/tours/elafonisi-pink-sand.png" 
                  alt="Elafonisi Pink Sand Beach Shared Tour" 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* Floating Info Badge */}
                <div className="absolute top-10 right-10 z-20">
                  <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-slate-800 shadow-2xl text-center">
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">Starts From</p>
                    <p className="text-4xl font-black text-primary mb-1">€38</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fixed Price</p>
                  </div>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-10 left-10 p-8 glass-card rounded-2xl border-white/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg">
                      <Palmtree className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-black text-2xl leading-none mb-1">Elafonisi West Crete</p>
                      <p className="text-white/70 text-sm font-medium">The most legendary group journey</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FLEET SECTION - REDESIGNED ========== */}
      <section className="section-padding bg-slate-50 dark:bg-slate-950/20 relative overflow-hidden" aria-labelledby="fleet-heading">
        {/* Artistic Background - Sleek mechanical/luxury vibe */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-8 h-64 bg-accent/20 blur-[60px] -translate-x-1/2 pointer-events-none" />
        
        <div className="container-wide relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 md:mb-28">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full mb-8 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <Car className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Mercedes Fleet</span>
              </motion.div>
              
              <h2 id="fleet-heading" className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                Chania’s Premier <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">Mercedes Fleet</span>
              </h2>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Experience the ultimate Chania taxi and transfer luxury with our meticulously maintained Mercedes vehicles. Perfect for airport pickups, group travel, and VIP tours across Crete.
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <Link to="/fleet">
                <Button variant="outline" size="xl" className="rounded-full px-12 group hover:bg-primary hover:text-primary-foreground transition-all duration-500 shadow-sm hover:shadow-xl border-primary text-primary">
                  Explore Full Fleet
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {[
              { 
                name: 'Mercedes E-Class', 
                tagline: 'Executive Sedan Luxury',
                pax: 4, 
                bags: 3, 
                image: fleetSedan 
              },
              { 
                name: 'Mercedes Sprinter', 
                tagline: 'Premium Minivan Space',
                pax: 11, 
                bags: 11, 
                image: fleetMinivan 
              },
              { 
                name: 'Mercedes Sprinter Maxi', 
                tagline: 'Luxury Minibus Excellence',
                pax: 20, 
                bags: 20, 
                image: fleetMinibus 
              }
            ].map((vehicle, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500"
              >
                <div className="aspect-[1.4] overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                  <div className="absolute top-6 right-6 z-20">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 rounded-2xl border border-white/50 dark:border-slate-800 shadow-xl">
                      <Crown className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                </div>

                <div className="p-10 md:p-12">
                  <p className="text-xs font-black text-accent uppercase tracking-widest mb-2">{vehicle.tagline}</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-primary mb-8 group-hover:text-accent transition-colors">{vehicle.name}</h3>
                  
                  <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-primary">
                        <Users className="w-4 h-4 text-accent" />
                        <span className="font-bold">{vehicle.pax} Guests</span>
                      </div>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">Capacity</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-primary">
                        <Check className="w-4 h-4 text-accent" />
                        <span className="font-bold">Premium</span>
                      </div>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">Class</span>
                    </div>
                  </div>

                  <div className="mt-10">
                    <Link to="/fleet" className="inline-flex items-center gap-2 text-sm font-black text-primary uppercase tracking-widest group-hover:gap-4 transition-all duration-300">
                      Learn More & View Details
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <WhyChooseLIV />

      {/* ========== REVIEWS SECTION - REDESIGNED ========== */}
      <section className="section-padding bg-background relative overflow-hidden" aria-labelledby="reviews-heading">
        {/* Artistic Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-olive/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full mb-6 border border-accent/20"
            >
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Verified Reviews</span>
            </motion.div>
            
            <h2 id="reviews-heading" className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
              What Travelers <span className="block text-accent underline decoration-accent/30 underline-offset-8 italic font-serif mt-2">Say About Us</span>
            </h2>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-accent border-2 border-background flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  ))}
                </div>
                <span className="ml-2">5.0 Recommendation Rate</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-border" />
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">850+</span> Genuine Stories
              </div>
            </div>
          </div>
          
          <ContextualReviews limit={6} title="" showCTA={false} />
          
          <div className="mt-16 text-center">
            <Link to="/reviews">
              <Button variant="outline" size="xl" className="rounded-full px-12 group hover:bg-primary hover:text-white transition-all duration-500">
                Read All Our 5-Star Stories
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== WEATHER FORECAST SECTION - REDESIGNED ========== */}
      <section className="section-padding bg-background relative overflow-hidden" aria-labelledby="weather-heading">
        {/* Artistic Background - Meteorological vibe */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 rounded-full mb-6 border border-blue-200/20"
            >
              <Cloud className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Live Weather Insights</span>
            </motion.div>
            
            <h2 id="weather-heading" className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 bg-gradient-to-r from-primary via-primary/90 to-blue-500 bg-clip-text text-transparent">
              Crete <span className="text-blue-500 italic font-serif mt-2 underline decoration-blue-500/20 underline-offset-8">Weather Forecast</span>
            </h2>
            
            <p className="text-lg md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-4">
              Plan your journey with live weather data across Crete's top destinations. Perfect for choosing the best day for your private tour.
            </p>
          </div>
          
          <WeatherForecastWidget className="w-full" />
        </div>
      </section>

      {/* ========== FAQ SECTION - REDESIGNED ========== */}
      <section className="section-padding content-auto bg-slate-50 dark:bg-slate-950/20 relative overflow-hidden" aria-labelledby="faq-heading">
        {/* Artistic Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container-wide max-w-5xl relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16 md:mb-24 px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full mb-8 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <MessageCircle className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{t.home.quickAnswers}</span>
            </motion.div>
            
            <h2 id="faq-heading" className="text-4xl md:text-5xl lg:text-7xl font-black text-primary tracking-tight mb-8 leading-[1.05]">
              Common <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">Questions</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Everything you need to know about our premium transfer services and tours in Crete. Our objective is to make your booking as simple as your journey.
            </p>
          </div>

          <div className="w-full">
            <FAQAccordion items={faqs} defaultOpen="item-0" />
          </div>

          <div className="text-center mt-16">
            <Link to="/faq">
              <Button variant="outline" size="xl" className="rounded-full px-12 group hover:bg-primary hover:text-white transition-all duration-500 shadow-sm hover:shadow-xl">
                Explore Full Help Center
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <FinalCTABlock 
        title="Ready for your journey?"
        subtitle="Tell us where and when. We send you a fixed price. No back-and-forth. Professional, private, and always on time."
        badge="Get Your Quote in 2 Minutes"
        primaryButtonText={t.cta.getQuote}
        primaryButtonLink="#hero-quote"
        whatsappMessage="Hi! I'm on your homepage and I'd like to ask about your services."
      />
    </Layout>
  );
};

export default Index;
