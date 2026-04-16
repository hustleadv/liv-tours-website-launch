import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  Users, 
  Compass,
  Palmtree,
  Landmark,
  Wine,
  Sunset,
  Heart,
  Sparkles,
  Car,
  MessageCircle,
  Check,
  Snowflake,
  Lightbulb,
  Apple,
  Wifi,
  Ticket,
  Award,
  Binoculars,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import FAQAccordion from "@/components/FAQAccordion";
import FinalCTABlock from "@/components/FinalCTABlock";
import FleetCard from "@/components/FleetCard";
import SEOHead from "@/components/SEOHead";
import ContextualReviews from "@/components/ContextualReviews";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import toursHero from "@/assets/tours-hero-new.jpg";
import fleetSedan from "@/assets/fleet-sedan-new.webp";
import fleetMinivan from "@/assets/fleet-vclass-exterior.webp";
import fleetMinibus from "@/assets/minibusmaxi4.jpg";
import elafonisiImg from "@/assets/tours/elafonisi-pink-sand.png";

const Tours = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    pickupArea: "",
    hours: "",
    interests: "",
    groupSize: "",
    notes: "",
  });

  // Fetch tour count for the badge
  const { data: tourCount } = useQuery({
    queryKey: ['toursCount'],
    queryFn: async () => {
      const { count } = await supabase
        .from('tours')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');
      return count || 0;
    },
  });

  // Handle category selection - scroll to form and set interest
  const handleCategorySelect = (categoryValue: string) => {
    setFormData(prev => ({ ...prev, interests: categoryValue }));
    
    // Scroll to form
    const formElement = document.getElementById('build-tour');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tourCategories = [
    {
      icon: Palmtree,
      title: t.tours.categories.beachDay.title,
      description: t.tours.categories.beachDay.description,
      color: "bg-sky-500/10 text-sky-600",
      value: "beaches",
    },
    {
      icon: Landmark,
      title: t.tours.categories.cultural.title,
      description: t.tours.categories.cultural.description,
      color: "bg-amber-500/10 text-amber-600",
      value: "history",
    },
    {
      icon: Wine,
      title: t.tours.categories.foodWine.title,
      description: t.tours.categories.foodWine.description,
      color: "bg-rose-500/10 text-rose-600",
      value: "food-wine",
    },
    {
      icon: Sunset,
      title: t.tours.categories.sunset.title,
      description: t.tours.categories.sunset.description,
      color: "bg-orange-500/10 text-orange-600",
      value: "sunset",
    },
    {
      icon: Heart,
      title: t.tours.categories.familyFriendly.title,
      description: t.tours.categories.familyFriendly.description,
      color: "bg-pink-500/10 text-pink-600",
      value: "family",
    },
    {
      icon: Sparkles,
      title: t.tours.categories.custom.title,
      description: t.tours.categories.custom.description,
      color: "bg-olive/10 text-olive",
      value: "custom",
    },
  ];


  const fleetData = [
    {
      name: "Mercedes E-Class",
      category: "Executive Sedan",
      image: fleetSedan,
      passengers: 4,
      luggage: 4,
      features: ["leather", "ac", "usb"],
    },
    {
      name: "Mercedes V-Class",
      category: "Premium Minivan",
      image: fleetMinivan,
      passengers: 11,
      luggage: 7,
      features: ["spacious", "ac", "reclining seats"],
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Tour request:", formData);
  };

  const toursServiceData = {
    name: "Private Tours Crete",
    description: "Customized private tours throughout Crete. Visit Elafonisi, Balos Lagoon, Samaria Gorge, wine regions, and hidden gems with your personal driver-guide.",
    serviceType: "Private Tour Service",
    areaServed: "Crete, Greece",
    url: "https://livtours.gr/tours",
    priceRange: "€€",
    offers: [
      { name: "Half-Day Tour", description: "4-hour private tour exploring local highlights", price: "€150" },
      { name: "Full-Day Tour", description: "8-hour comprehensive tour with multiple stops", price: "€280" },
      { name: "Beach Day Tour", description: "Visit stunning beaches like Elafonisi or Balos", price: "€200" },
      { name: "Cultural Tour", description: "Explore ancient sites, monasteries, and villages", price: "€180" },
    ]
  };

  return (
    <Layout>
      <SEOHead
        title="Ιδιωτικές Εκδρομές Χανιά & Κρήτη | Private Tours Crete"
        description="Εξατομικευμένες ιδιωτικές εκδρομές στα Χανιά και την Κρήτη. Ελαφονήσι, Μπάλος, Σαμαριά, κρασοπαραγωγή. Ο δικός σας οδηγός, το δικό σας πρόγραμμα!"
        keywords="private tours Chania, εκδρομές Χανιά, Elafonisi tour, Balos lagoon tour, Samaria gorge transfer, ιδιωτικές εκδρομές Κρήτη, day trips Crete"
        canonicalUrl="https://livtours.gr/tours"
        includeLocalBusiness={true}
        faqItems={faqs}
        serviceData={toursServiceData}
        breadcrumbs={[
          { name: "Home", url: "https://livtours.gr" },
          { name: "Private Tours", url: "https://livtours.gr/tours" }
        ]}
      />
      <PageHero
        label={t.tours.badge}
        title={t.tours.heroTitle}
        titleAccent={t.tours.heroSubtitle}
        subtitle={t.tours.heroDescription}
        image={toursHero}
        icon={Compass}
        align="left"
        sideContent={
          <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-lime/20 via-accent/20 to-olive/20 rounded-3xl blur-xl opacity-60" />
              
              <div className="relative glass-card p-8 backdrop-blur-xl bg-white/95 dark:bg-card/95 rounded-2xl border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-olive/20 to-lime/10">
                    <ShieldCheck className="w-5 h-5 text-olive" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-primary tracking-tight">
                    {t.tours.whyPrivateTour}
                  </h3>
                </div>
                
                <ul className="space-y-4">
                  {[
                    { title: t.tours.customRoutes, text: t.tours.customRoutesDesc },
                    { title: t.tours.localKnowledge, text: t.tours.localKnowledgeDesc },
                    { title: t.tours.totalComfort, text: t.tours.totalComfortDesc },
                    { title: t.tours.doorToDoor, text: t.tours.doorToDoorDesc },
                  ].map((item, index) => (
                    <li key={item.title} className="flex items-start gap-3 group">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-olive/20 to-lime/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <Check className="w-4 h-4 text-olive" />
                      </span>
                      <div>
                        <span className="font-medium text-primary">{item.title}</span>
                        <p className="text-sm text-muted-foreground">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 pt-6 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t.tours.toursFrom}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-primary text-2xl">€150</span>
                      <span className="text-muted-foreground text-sm">{t.tours.forHalfDay}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        {/* Value Props */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-10">
          {[
            { label: "100% Private", icon: Users },
            { label: t.tours.localExpertise, icon: Compass },
            { label: t.tours.flexibleSchedule, icon: Clock },
          ].map((item) => (
            <div 
              key={item.label}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10"
            >
              <item.icon className="w-4 h-4 text-lime" />
              <span className="text-sm font-medium text-white/90">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <a href="#build-tour">
            <Button variant="hero" size="xl" className="w-full sm:w-auto shadow-xl shadow-lime/20">
              {t.cta.buildTour}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          <a 
            href="https://wa.me/306944363525?text=Hi!%20I'd%20like%20to%20discuss%20a%20private%20tour%20in%20Crete."
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="glass" size="xl" className="w-full sm:w-auto border-white/20 hover:bg-white/10">
              <MessageCircle className="w-5 h-5" />
              {t.cta.chatOnWhatsApp}
            </Button>
          </a>
        </div>

        <p className="text-white/50 text-sm mt-6 flex items-center gap-2 justify-center lg:justify-start">
          <Check className="w-4 h-4 text-lime/70" />
          The premier private tour service in Chania & Crete
        </p>
      </PageHero>

      {/* 1. LOCAL EXPERTISE SEO SECTION */}
      <section className="py-24 md:py-32 lg:py-40 bg-background relative overflow-hidden">
        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-olive/10 rounded-full text-olive text-sm font-semibold">
                <MapPin className="w-4 h-4" />
                Based in Chania, Crete
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight leading-[1.1]">
                Your Local Insider for <span className="text-accent underline decoration-lime/30 decoration-4 underline-offset-4">Authentic Crete</span>
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  At LIV Tours, we don't just drive; we guide. Based in the heart of **Chania**, our team consists of locals who know every hidden alley of the Old Town, every secret cove in Sfakia, and the best time to visit the world-famous Balos Lagoon.
                </p>
                <p>
                  Whether you're looking for a relaxing day at Elafonisi, a journey through the historical monasteries of Akrotiri, or a deep dive into the Cretan wild mountains, we curate **private tours in Crete** that feel like traveling with a knowledgeable local friend.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-primary">100%</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Customizable</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-primary">Local</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Expert Guides</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={fleetMinivan} 
                  alt="Private tour in Chania Crete" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="text-2xl font-bold mb-2 italic">"Travel as a local, feel like a guest."</p>
                  <p className="text-sm opacity-80">The LIV Tours Philosophy</p>
                </div>
              </div>
              {/* Decorative background elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-lime/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. BROWSE READY TOURS (INSPIRATION) */}
      <section className="py-12 md:py-20 lg:py-24 relative overflow-hidden">
        <div className="container-wide">
          <div className="relative group overflow-hidden rounded-[2.5rem] bg-[#0A1A14]">
            {/* Background Image with sophisticated Overlay */}
            <div className="absolute inset-0 z-0 scale-105 group-hover:scale-110 transition-transform duration-1000">
               <img 
                src={toursHero} 
                className="w-full h-full object-cover opacity-30"
                alt="Crete tours inspiration"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A1A14] via-[#0A1A14]/95 to-[#0A1A14]/40" />
            </div>

            {/* Aurora / Bloom Effects */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-lime/10 rounded-full blur-[120px] transition-opacity group-hover:opacity-100 opacity-40" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
            
            <div className="relative z-10 p-10 md:p-16 lg:p-24 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center lg:text-left">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full mb-8 border border-white/10"
                >
                  <Ticket className="w-4 h-4 text-lime" />
                  <span className="text-sm font-semibold text-white/80 uppercase tracking-widest text-xs">Ready-made itineraries</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-[1.05]">
                  Need some <span className="text-lime italic">inspiration?</span>
                </h2>
                
                <p className="text-xl text-white/60 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Explore our curated collection of popular private day trips in Crete, designed by local experts and ready to book instantly.
                </p>

                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <Link to="/tours/private">
                    <Button variant="hero" size="xl" className="shadow-2xl shadow-lime/20 h-16 px-10 text-lg group-hover:scale-105 transition-transform">
                      {t.nav.privateTours}
                      <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                  </Link>
                  
                  <Link to="/tours/shared">
                    <Button variant="glass" size="xl" className="bg-white/10 border-white/20 text-white h-16 px-10 text-lg hover:bg-white/20 transition-all">
                      {t.nav.sharedTours}
                      <Users className="w-6 h-6 ml-2" />
                    </Button>
                  </Link>
                  
                  {tourCount !== undefined && tourCount > 0 && (
                    <div className="flex items-center gap-3 px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Compass className="w-5 h-5 text-lime" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold leading-none">{tourCount}+ Tours</p>
                        <p className="text-white/40 text-[10px] mt-1 uppercase tracking-wider font-semibold">Available Now</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative Card / Component */}
              <div className="flex-1 hidden md:block">
                <div className="relative max-w-sm ml-auto">
                    <div className="absolute -inset-4 bg-gradient-to-br from-lime/20 to-accent/20 blur-3xl rounded-full opacity-50" />
                    
                    <motion.div 
                      animate={{ y: [0, -15, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="glass-card p-8 rounded-[2rem] border-white/10 shadow-2xl backdrop-blur-3xl bg-white/5 relative z-10 border border-t-white/20"
                    >
                      <div className="flex justify-between items-center mb-8">
                         <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center ring-1 ring-white/20">
                            <Award className="w-6 h-6 text-lime" />
                         </div>
                         <div className="flex items-center gap-1.5 bg-lime/10 px-3 py-1 rounded-full border border-lime/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                            <span className="text-[10px] font-bold text-lime uppercase tracking-widest">Local Choice</span>
                         </div>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 ring-1 ring-white/10">
                           <img 
                            src={elafonisiImg} 
                            className="w-full h-full object-cover" 
                            alt="Elafonisi Beach"
                           />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg mb-1">Elafonisi Pink Sand</h4>
                          <p className="text-white/60 text-sm leading-relaxed">Discover the world-famous lagoon and its unique pink sands.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lime font-bold text-sm">€200</span>
                          <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Full Day</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                         <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                               <div key={i} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#0A1A14] flex items-center justify-center text-[10px] text-white/40 font-bold">
                                  {i}
                               </div>
                            ))}
                         </div>
                         <p className="text-xs text-white/40 font-medium">Joined by 1,200+ guests this season</p>
                      </div>
                    </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TOUR CATEGORIES GRID */}
      <section className="py-24 md:py-32 lg:py-40">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              {t.tours.tourExperiences}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 tracking-tight">
              {t.tours.idealDayInCrete}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.tours.chooseTheme}
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {tourCategories.map((category) => (
              <button
                type="button"
                key={category.title} 
                onClick={() => handleCategorySelect(category.value)}
                className={`glass-card p-4 md:p-6 hover-lift cursor-pointer group text-left transition-all ${
                  formData.interests === category.value 
                    ? 'ring-2 ring-accent shadow-lg' 
                    : ''
                }`}
              >
                <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl ${category.color} flex items-center justify-center mb-3 md:mb-5 transition-transform motion-reduce:transition-none group-hover:scale-110 motion-reduce:group-hover:scale-100`}>
                  <category.icon className="w-5 h-5 md:w-7 md:h-7" />
                </div>
                <h3 className="text-sm md:text-xl font-bold text-primary mb-1 md:mb-2 tracking-tight">{category.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">{category.description}</p>
                {formData.interests === category.value && (
                  <div className="mt-2 md:mt-3 flex items-center gap-1.5 text-accent text-xs md:text-sm font-medium">
                    <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    <span>Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. WHAT'S INCLUDED SECTION */}
      <section className="py-24 md:py-32 lg:py-40 bg-cream-warm/50 border-y border-border/50 overflow-hidden">
        <div className="container-wide">
          <div className="text-center mb-8 md:mb-16">
            <p className="text-xs md:text-sm font-semibold text-accent uppercase tracking-wider mb-2 md:mb-3">
              {t.tours.whatsIncluded.label}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 tracking-tight">
              {t.tours.whatsIncluded.title}
            </h2>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
              {t.tours.whatsIncluded.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 max-w-6xl mx-auto">
            {[
              { 
                icon: Car, 
                title: t.tours.whatsIncluded.privateDriver.title, 
                subtitle: t.tours.whatsIncluded.privateDriver.subtitle,
                gradient: "from-primary/10 to-primary/5",
                iconBg: "bg-primary/10",
                iconColor: "text-primary" 
              },
              { 
                icon: MapPin, 
                title: t.tours.whatsIncluded.flexibleStops.title, 
                subtitle: t.tours.whatsIncluded.flexibleStops.subtitle,
                gradient: "from-accent/10 to-accent/5",
                iconBg: "bg-accent/10",
                iconColor: "text-accent" 
              },
              { 
                icon: Snowflake, 
                title: t.tours.whatsIncluded.acVehicle.title, 
                subtitle: t.tours.whatsIncluded.acVehicle.subtitle,
                gradient: "from-sky-500/10 to-sky-500/5",
                iconBg: "bg-sky-500/10",
                iconColor: "text-sky-500" 
              },
              { 
                icon: Lightbulb, 
                title: t.tours.whatsIncluded.localTips.title, 
                subtitle: t.tours.whatsIncluded.localTips.subtitle,
                gradient: "from-amber-500/10 to-amber-500/5",
                iconBg: "bg-amber-500/10",
                iconColor: "text-amber-500" 
              },
              { 
                icon: Apple, 
                title: t.tours.whatsIncluded.refreshments.title, 
                subtitle: t.tours.whatsIncluded.refreshments.subtitle,
                gradient: "from-olive/10 to-olive/5",
                iconBg: "bg-olive/10",
                iconColor: "text-olive" 
              },
              { 
                icon: Wifi, 
                title: t.tours.whatsIncluded.freeWifi.title, 
                subtitle: t.tours.whatsIncluded.freeWifi.subtitle,
                gradient: "from-violet-500/10 to-violet-500/5",
                iconBg: "bg-violet-500/10",
                iconColor: "text-violet-500" 
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`group relative flex flex-col items-center text-center p-4 md:p-6 rounded-2xl md:rounded-3xl bg-gradient-to-br ${item.gradient} border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl ${item.iconBg} flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                  <item.icon className={`w-6 h-6 md:w-8 md:h-8 ${item.iconColor}`} />
                </div>
                
                <h3 className="text-sm md:text-lg font-bold text-foreground mb-1 tracking-tight">{item.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground leading-tight">{item.subtitle}</p>
                
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 md:w-6 md:h-6 rounded-full bg-olive flex items-center justify-center shadow-lg md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                  <Check className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 md:mt-12 text-center">
            <div className="inline-flex flex-wrap justify-center items-center gap-2 px-4 py-2 rounded-full bg-olive/10 border border-olive/20">
              <Check className="w-4 h-4 text-olive" />
              <span className="text-xs md:text-sm font-medium text-foreground">{t.tours.whatsIncluded.zeroHiddenFees}</span>
              <span className="text-muted-foreground mx-1">·</span>
              <span className="text-xs md:text-sm text-muted-foreground">{t.tours.whatsIncluded.allTaxesIncluded}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FLEET SECTION */}
      <section className="py-24 md:py-32 lg:py-40 bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
              {t.home.mercedesFleet}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 tracking-tight">
              {t.home.cleanComfortableReliable}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {fleetData.map((vehicle) => (
              <FleetCard key={vehicle.name} {...vehicle} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/fleet">
              <Button variant="outline" size="lg">
                {t.cta.viewFullFleet}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. REVIEWS SECTION */}
      <section className="py-24 md:py-32 lg:py-40 bg-cream-warm/30 border-y border-border/30">
        <div className="container-wide">
          <ContextualReviews category="tour" title={t.tours.reviewsTitle} />
        </div>
      </section>

      {/* 7. BUILD YOUR TOUR FORM */}
      <section id="build-tour" className="section-padding bg-cream-warm scroll-mt-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
                {t.tours.startPlanning}
              </p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-8 tracking-tight">
                {t.tours.buildYourTour}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {t.tours.buildTourDescription}
              </p>

              <div className="space-y-6">
                {[
                  { step: "1", text: t.tours.step1 },
                  { step: "2", text: t.tours.step2 },
                  { step: "3", text: t.tours.step3 },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <p className="text-foreground">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-xl bg-olive/10 border border-olive/20">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{t.tours.noPressure}</span> {t.tours.weRespondWithIdeas}
                  <a 
                    href="https://wa.me/306944363525" 
                    className="text-accent font-medium ml-1 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.tours.justWhatsAppUs}
                  </a>.
                </p>
              </div>
            </div>

            <div className="glass-card p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    {t.tours.whereAreYouStaying}
                  </label>
                  <Input
                    placeholder="e.g., Heraklion, Chania, Elounda..."
                    value={formData.pickupArea}
                    onChange={(e) => setFormData({ ...formData, pickupArea: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      {t.tours.tourDuration}
                    </label>
                    <Select 
                      value={formData.hours}
                      onValueChange={(value) => setFormData({ ...formData, hours: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t.tours.howLong} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4">{t.tours.halfDay}</SelectItem>
                        <SelectItem value="6">{t.tours.sixHours}</SelectItem>
                        <SelectItem value="8">{t.tours.fullDay}</SelectItem>
                        <SelectItem value="10">{t.tours.extended}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      {t.tours.groupSize}
                    </label>
                    <Select 
                      value={formData.groupSize}
                      onValueChange={(value) => setFormData({ ...formData, groupSize: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t.tours.howManyPeople} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{t.tours.solo}</SelectItem>
                        <SelectItem value="2">{t.tours.couple}</SelectItem>
                        <SelectItem value="3-4">{t.tours.smallGroup}</SelectItem>
                        <SelectItem value="5-7">{t.tours.mediumGroup}</SelectItem>
                        <SelectItem value="8+">{t.tours.largeGroup}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Binoculars className="w-4 h-4 inline mr-2" />
                    {t.tours.whatToSee}
                  </label>
                  <Select 
                    value={formData.interests}
                    onValueChange={(value) => setFormData({ ...formData, interests: value })}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={t.tours.selectExperience || "Select an experience..."} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beaches">{t.tours.categories.beachDay.title}</SelectItem>
                      <SelectItem value="history">{t.tours.categories.cultural.title}</SelectItem>
                      <SelectItem value="food-wine">{t.tours.categories.foodWine.title}</SelectItem>
                      <SelectItem value="sunset">{t.tours.categories.sunset.title}</SelectItem>
                      <SelectItem value="family">{t.tours.categories.familyFriendly.title}</SelectItem>
                      <SelectItem value="custom">{t.tours.categories.custom.title}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {t.tours.anythingElse}
                  </label>
                  <Textarea
                    placeholder="Special requests, must-see places, accessibility needs, kids' ages..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="min-h-[100px] resize-none"
                  />
                </div>

                <Button type="submit" className="w-full" size="xl">
                  {t.tours.requestTourQuote}
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {t.tours.noPressure}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="py-24 md:py-32 lg:py-40 bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-3">
                {t.home.quickAnswers}
              </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 tracking-tight">
                  {t.home.commonQuestions}
                </h2>
            </div>

            <FAQAccordion items={faqs} />
          </div>
        </div>
      </section>

      <FinalCTABlock 
        title={t.tours.finalCta.title}
        subtitle={t.tours.finalCta.subtitle}
        badge={t.tours.badge}
        primaryButtonText={t.tours.requestTourQuote}
        primaryButtonLink="#build-tour"
        whatsappMessage="Hi! I'd like to plan a private tour in Crete."
      />
    </Layout>
  );
};

export default Tours;
