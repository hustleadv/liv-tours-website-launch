import { Link } from "react-router-dom";
import { ArrowRight, Plane, Check, Clock, MapPin, Shield, Car, Sparkles, Users, Briefcase, Star, MessageCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import TrustBar from "@/components/TrustBar";
import QuoteWidget from "@/components/QuoteWidget";
import RouteCard from "@/components/RouteCard";
import FleetCard from "@/components/FleetCard";
import FAQAccordion from "@/components/FAQAccordion";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import ContextualReviews from "@/components/ContextualReviews";
import TrustBadges from "@/components/TrustBadges";
import WhyChooseLIV from "@/components/WhyChooseLIV";
import PolicyBlock from "@/components/PolicyBlock";
import FinalCTABlock from "@/components/FinalCTABlock";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/fleet-minivan-real.webp";
import fleetSedan from "@/assets/fleet-sedan-new.webp";
import fleetMinivan from "@/assets/fleet-vclass-exterior.webp";
import fleetMinibus from "@/assets/minibusmaxi4.jpg";
import toursHero from "@/assets/tours-hero.jpg";

// Destination images for route cards
import chaniaImg from "@/assets/tours/chania-old-town-cover.webp";
import rethymnoImg from "@/assets/tours/rethymno-cover.webp";
import kournasImg from "@/assets/tours/lake-kournas-cover.webp";
import elafonisiImg from "@/assets/tours/elafonisi-pink-sand.png";
import balosImg from "@/assets/tours/balos-lagoon-cover.png";
import spinalongaImg from "@/assets/tours/spinalonga-cover.webp";
import mirabelloImg from "@/assets/tours/mirabello-sailing-cover.webp";
import knossosImg from "@/assets/tours/knossos-cover.webp";
import falassarnaImg from "@/assets/tours/falassarna-sunset-cover.webp";
import villageImg from "@/assets/tours/village-food-cover.webp";
import heraklionImg from "@/assets/tours/heraklion-1.webp"; // Better for Heraklion/Hersonissos
import chqImg from "@/assets/tours/chania-old-town-1.webp"; // Using actual Chania Old Town for Chania City
import maliaImg from "@/assets/tours/lasithi-1.webp"; // Using Lasithi for Malia/Hersonissos area

const Transfers = () => {
  const { t } = useLanguage();

  const includedFeatures = [
    {
      icon: MapPin,
      title: t.transfers.includedFeatures.meetGreet.title,
      description: t.transfers.includedFeatures.meetGreet.description,
    },
    {
      icon: Clock,
      title: t.transfers.includedFeatures.flightTracking.title,
      description: t.transfers.includedFeatures.flightTracking.description,
    },
    {
      icon: Shield,
      title: t.transfers.includedFeatures.fixedPrice.title,
      description: t.transfers.includedFeatures.fixedPrice.description,
    },
    {
      icon: Users,
      title: t.transfers.includedFeatures.professionalDrivers.title,
      description: t.transfers.includedFeatures.professionalDrivers.description,
    },
    {
      icon: ShieldCheck,
      title: t.transfers.includedFeatures.cleanVehicles.title,
      description: t.transfers.includedFeatures.cleanVehicles.description,
    },
    {
      icon: Car,
      title: t.transfers.includedFeatures.doorToDoor.title,
      description: t.transfers.includedFeatures.doorToDoor.description,
    },
  ];

  const heraklionRoutes = [
    { from: "Heraklion Airport", to: "Chania", duration: "2h", price: "€160", image: chqImg, routeId: "heraklion-airport-to-chania" },
    { from: "Heraklion Airport", to: "Rethymno", duration: "1h 10min", price: "€85", image: rethymnoImg, routeId: "heraklion-airport-to-rethymno" },
    { from: "Heraklion Airport", to: "Elounda", duration: "1h", price: "€75", image: spinalongaImg, routeId: "heraklion-airport-to-elounda" },
    { from: "Heraklion Airport", to: "Agios Nikolaos", duration: "50min", price: "€65", image: mirabelloImg, routeId: "heraklion-airport-to-agios-nikolaos" },
    { from: "Heraklion Airport", to: "Hersonissos", duration: "25min", price: "€35", image: heraklionImg, routeId: "heraklion-airport-to-hersonissos" },
    { from: "Heraklion Airport", to: "Malia", duration: "35min", price: "€45", image: maliaImg, routeId: "heraklion-airport-to-malia" },
  ];

  const chaniaRoutes = [
    { from: "Chania Airport", to: "Chania City", duration: "15min", price: "€28", image: chqImg, routeId: "chania-airport-to-chania-old-town" },
    { from: "Chania Airport", to: "Platanias", duration: "25min", price: "€45", image: falassarnaImg, routeId: "chania-airport-to-platanias" },
    { from: "Chania Airport", to: "Georgioupolis", duration: "40min", price: "€65", image: kournasImg, routeId: "chania-airport-to-georgioupolis" },
    { from: "Chania Airport", to: "Rethymno", duration: "55min", price: "€88", image: rethymnoImg, routeId: "chania-airport-to-rethymno" },
    { from: "Chania Airport", to: "Elafonisi", duration: "1h 40min", price: "€110", image: elafonisiImg, routeId: "chania-airport-to-elafonisi" },
    { from: "Chania Airport", to: "Balos", duration: "1h 20min", price: "€95", image: balosImg, routeId: "chania-airport-to-balos" },
  ];

  const fleetVehicles = [
    {
      name: "Mercedes E-Class",
      category: "Executive Sedan",
      passengers: 4,
      luggage: 4,
      image: fleetSedan,
      features: ["wifi", "ac", "leather seats", "bottled water"],
    },
    {
      name: "Mercedes Sprinter",
      category: "Premium Minivan",
      passengers: 11,
      luggage: 11,
      image: fleetMinivan,
      features: ["wifi", "ac", "USB charging", "extra legroom"],
    },
    {
      name: "Mercedes Sprinter Maxi",
      category: "Group Minibus",
      passengers: 20,
      luggage: 20,
      image: fleetMinibus,
      features: ["wifi", "ac", "reclining seats", "luggage trailer"],
      imageClassName: "object-[center_70%]",
    },
  ];

  const faqs = [
    {
      question: t.faqs.q1.question,
      answer: t.faqs.q1.answer,
    },
    {
      question: t.faqs.q6.question,
      answer: t.faqs.q6.answer,
    },
    {
      question: t.faqs.q2.question,
      answer: t.faqs.q2.answer,
    },
    {
      question: t.faqs.q3.question,
      answer: t.faqs.q3.answer,
    },
    {
      question: t.faqs.q4.question,
      answer: t.faqs.q4.answer,
    },
    {
      question: t.faqs.q5.question,
      answer: t.faqs.q5.answer,
    },
  ];

  const transfersServiceData = {
    name: "Airport Transfer Service Crete",
    description: "Premium airport transfer services from Chania and Heraklion airports. Meet & greet, flight monitoring, fixed prices, and professional drivers with Mercedes fleet.",
    serviceType: "Airport Transfer",
    areaServed: "Crete, Greece",
    url: "https://livtours.gr/transfers",
    priceRange: "€€",
    offers: [
      { name: "Heraklion Airport to City", description: "Private transfer from Heraklion Airport to city center", price: "€25" },
      { name: "Chania Airport to City", description: "Private transfer from Chania Airport to city center", price: "€30" },
      { name: "Airport to Resort Transfers", description: "Comfortable transfers to all major resorts in Crete", price: "€35" },
    ]
  };

  return (
    <Layout>
      <SEOHead
        title="Luxury Airport Transfers Chania & Heraklion | LIV Tours Crete"
        description="Premium private airport transfers in Crete. Guaranteed fixed prices, professional drivers, and luxury Mercedes fleet for Chania (CHQ) and Heraklion (HER) airports."
        keywords="airport transfer Chania, Chania airport taxi, Heraklion airport transfer, private transfer Crete, luxury taxi Crete"
        canonicalUrl="https://livtours.gr/transfers"
        includeLocalBusiness={true}
        faqItems={faqs}
        serviceData={transfersServiceData}
        breadcrumbs={[
          { name: "Home", url: "https://livtours.gr" },
          { name: "Airport Transfers", url: "https://livtours.gr/transfers" }
        ]}
      />
      <PageHero
        label={t.transfers.airports}
        title="Luxury Airport"
        titleAccent="Transfers & VIP Service"
        subtitle="Experience seamless, high-end transportation across Crete. From Chania Airport (CHQ) to the most exclusive resorts, we provide professional drivers and a premium fleet at fixed rates."
        image={heroImage}
        icon={Plane}
        align="left"
        overlay="dark"
        serifAccent
        sideContent={<QuoteWidget variant="hero" />}
      >
        <div className="flex flex-col gap-6">
          {/* Trust Badge - Homepage Style */}
          <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl w-fit">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-accent fill-accent" />
              ))}
            </div>
            <div className="w-px h-5 bg-white/20" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white">5.0 on Google Chania</span>
          </div>

          {/* Check list */}
          <div className="flex flex-col gap-2.5">
            {[t.transfers.flightDelayed, t.transfers.noHiddenFees, t.transfers.freeCancellation].map((item) => (
              <div key={item} className="flex items-center gap-3 text-white/90">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-accent" />
                </div>
                <span className="text-sm font-medium tracking-wide">{item}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-6 border-t border-white/15">
            <div>
              <p className="text-2xl font-bold text-white">10K+</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/50">{t.transfers.airportPickups}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">15min</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/50">{t.transfers.avgResponseTime}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5★</p>
              <p className="text-[10px] uppercase font-black tracking-widest text-white/50">{t.transfers.customerRating}</p>
            </div>
          </div>
        </div>
      </PageHero>

      <div className="bg-background">
        <TrustBar />
      </div>

      {/* ========== MOBILE QUOTE WIDGET - Optimized Spacing ========== */}
      <section id="quote-section" className="lg:hidden pt-8 pb-16 bg-cream-warm">
        <div className="container-wide">
          <QuoteWidget variant="inline" />
        </div>
      </section>

      {/* ========== WHAT'S INCLUDED ========== */}
      <section className="section-padding overflow-hidden">
        <div className="container-wide">
          <div className="text-center mb-16 md:mb-20 max-w-3xl mx-auto px-4">
            <p className="section-subheading">
              {t.transfers.whatsIncluded}
            </p>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary tracking-tight leading-[1.1]">
              Stress-Free from <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Touchdown</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mt-8 leading-relaxed">
              Every LIV Tours transfer is designed to be a seamless extension of your luxury holiday. We handle the logistics so you can focus on the journey.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {includedFeatures.map((feature, index) => (
              <div 
                key={feature.title} 
                className="group relative bg-card rounded-2xl p-8 border border-border/50 hover:border-accent/30 hover:shadow-xl transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-primary text-xl tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CHANIA AIRPORT ROUTES ========== */}
      <section className="section-padding bg-cream-warm">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 md:gap-12 mb-16 glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-border/60 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/5 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary border border-primary rounded-full shadow-sm">
                <Plane className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">Chania Airport · CHQ</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight leading-tight">
                Luxury Transfers from <span className="text-accent italic font-serif">Chania</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">Premium door-to-door service from Crete's most beautiful gateway to your final destination.</p>
            </div>
            
            <div className="relative z-10 flex-shrink-0">
              <Link to="/routes">
                <Button variant="default" size="lg" className="rounded-full px-8 h-14 shadow-xl shadow-primary/20 hover:shadow-2xl transition-all group">
                  Explore All Routes
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {chaniaRoutes.map((route, i) => (
              <RouteCard key={`chq-${i}`} {...route} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== HERAKLION AIRPORT ROUTES ========== */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 md:gap-12 mb-16 glass-card p-8 md:p-12 rounded-[2rem] md:rounded-[2.5rem] border border-border/60 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 border border-amber-600 rounded-full shadow-sm">
                <Plane className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-white uppercase">Heraklion Airport · HER</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight leading-tight">
                Private Transfers from <span className="text-accent italic font-serif">Heraklion</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed">Reliable, professional arrivals and departures from Crete's largest airport hub.</p>
            </div>
            
            <div className="relative z-10 flex-shrink-0">
              <Link to="/routes">
                <Button variant="default" size="lg" className="rounded-full px-8 h-14 shadow-xl shadow-primary/20 hover:shadow-2xl transition-all group">
                  Explore All Routes
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {heraklionRoutes.map((route, i) => (
              <RouteCard key={`her-${i}`} {...route} />
            ))}
          </div>

          {/* CTA Banner - Optimized for Luxury */}
          <div className="mt-16 glass-card p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 rounded-[2rem] border-dashed border-2">
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-bold text-primary tracking-tight">Can't find your specific destination?</h3>
              <p className="text-muted-foreground">We provide tailor-made transfers to every corner of Crete, from hidden villas to remote ports.</p>
            </div>
            <Link to="/contact">
              <Button variant="hero" className="px-10 h-14 shadow-2xl">
                Request a Custom Quote
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FLEET SECTION ========== */}
      <section className="section-padding bg-cream-warm">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <p className="section-subheading">
                {t.transfers.ourFleet}
              </p>
              <h2 className="section-heading text-left ml-0">
                Premium Vehicles for <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Every Group</span>
              </h2>
              <p className="text-muted-foreground mt-6 leading-relaxed">{t.transfers.allVehiclesIncludeLuggage}</p>
            </div>
            <Link to="/fleet">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                View Full Fleet Gallery
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {fleetVehicles.map((vehicle) => (
              <FleetCard key={vehicle.name} {...vehicle} />
            ))}
          </div>

          {/* Luggage Info */}
          <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-bold text-primary mb-1 tracking-tight">{t.transfers.travelingWithExtraLuggage}</h4>
                <p className="text-sm text-muted-foreground">
                  {t.transfers.surfboardsGolfClubs}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHY CHOOSE LIV ========== */}
      <WhyChooseLIV variant="full" />

      {/* ========== REVIEWS SECTION ========== */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <ContextualReviews category="airport" />
        </div>
      </section>

      {/* ========== POLICIES SECTION ========== */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide max-w-4xl">
          <PolicyBlock variant="full" expandable={true} />
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section className="section-padding bg-cream-warm">
        <div className="container-wide max-w-4xl">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-2">
              {t.home.quickAnswers}
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 tracking-tight">
              {t.home.commonQuestions}
            </h2>
          </div>

          <FAQAccordion items={faqs} defaultOpen="item-0" />

          <div className="text-center mt-10">
            <Link to="/faq">
              <Button variant="outline" size="lg">
                {t.cta.viewAllFaqs}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <FinalCTABlock 
        title={t.transfers.finalCta.title}
        subtitle={t.transfers.finalCta.subtitle}
        badge={t.transfers.airportPickups}
        primaryButtonText={t.cta.getQuote}
        primaryButtonLink="/contact"
        whatsappMessage="Hello! I'd like to book an airport transfer in Crete."
      />

    </Layout>
  );
};

export default Transfers;
