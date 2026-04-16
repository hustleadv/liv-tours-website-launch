import { useState, useEffect } from "react";
import { Heart, PartyPopper, Users, Send, Check, Phone, Mail, Clock, Star, Sparkles, MapPin, Crown, GlassWater, Wifi, UserCheck, ShieldCheck, Quote, User, Calendar, Car } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import TrustBar from "@/components/TrustBar";
import PageHero from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PhoneInput from "@/components/PhoneInput";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import fleetVClass from "@/assets/fleet-vclass-exterior.webp";
import fleetMinibus from "@/assets/minibusmaxi4.jpg";
import fleetSedan from "@/assets/fleet-sedan-new.webp";

const Events = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "wedding",
    eventDate: "",
    guestCount: "",
    pickupLocation: "",
    message: ""
  });

  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setParallaxOffset(window.pageYOffset * 0.4);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-event-request', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: t.events.requestSent,
        description: t.events.requestSentDesc,
      });
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        eventType: "wedding",
        eventDate: "",
        guestCount: "",
        pickupLocation: "",
        message: ""
      });
      setAcceptedPrivacy(false);
    } catch (error: any) {
      console.error("Error sending event request:", error);
      toast({
        title: t.events.errorTitle,
        description: t.events.errorDesc,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTypes = [
    {
      id: "wedding",
      icon: Heart,
      title: t.events.wedding.title,
      description: t.events.wedding.description,
      features: t.events.wedding.features,
    },
    {
      id: "corporate",
      icon: Users,
      title: t.events.corporate.title,
      description: t.events.corporate.description,
      features: t.events.corporate.features,
    },
    {
      id: "bachelor",
      icon: PartyPopper,
      title: t.events.bachelor.title,
      description: t.events.bachelor.description,
      features: t.events.bachelor.features,
    }
  ];

  const whyChooseUs = [
    { icon: Star, text: t.events.rating || "5-Star Top Rated" },
    { icon: Clock, text: t.events.availability || "Punctual & Reliable" },
    { icon: Users, text: t.events.vehicles || "Group Specific Fleets" },
    { icon: Check, text: t.events.licensed || "Certified Professional Drivers" }
  ];

  const faqs = [
    {
      question: "How far in advance should I book my wedding transportation?",
      answer: "We strongly recommend booking your wedding transfer at least 3 to 6 months in advance. During the peak summer season in Crete (June-September), our premium Mercedes vehicles get booked very quickly. However, don't hesitate to reach out for last-minute availability."
    },
    {
      question: "Can you handle transportation for all my wedding guests?",
      answer: "Absolutely! We offer a diverse fleet ranging from sleek Mercedes V-Class luxury vans to spacious Mercedes Sprinter minibuses. We can coordinate multiple vehicles to seamlessly shuttle all your guests between their hotels, the ceremony, and the reception venue anywhere in Crete."
    },
    {
      question: "Do you decorate the wedding car?",
      answer: "While we provide impeccably clean, polished, and elegant vehicles, we usually leave the specific floral decorations (such as ribbons or flower arrangements) to your wedding planner or florist. You are fully welcome to decorate the car, and your driver will gladly assist and arrive early to allow time for this."
    },
    {
      question: "Can we hire a driver for a bachelor/bachelorette party that lasts all night?",
      answer: "Yes! We provide flexible 'driver-at-your-disposal' services for bachelor and bachelorette parties. Your private chauffeur will wait for you securely outside clubs and venues, ensuring everyone gets back to their accommodation safely at any hour of the night."
    },
    {
      question: "Do you offer corporate event transportation with invoices?",
      answer: "Yes, LIV Tours specializes in corporate transfers. We provide business-class service with professional, discreet chauffeurs. We also issue official corporate invoices and can set up B2B billing arrangements for recurring company retreats or conferences in Crete."
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Request a Quote",
      description: "Fill out the contact form specifying your event details (date, guest count, and pickup areas)."
    },
    {
      step: "02",
      title: "Receive a Plan",
      description: "Our logistics team will quickly design a tailored transportation schedule and send you a clear, competitive quote."
    },
    {
      step: "03",
      title: "Secure Your Date",
      description: "Confirm your booking with a simple deposit. Leave the driving to us, and focus on enjoying your special day!"
    }
  ];

  const vipAmenities = [
    {
      icon: GlassWater,
      title: "Complimentary Refreshments",
      description: "Chilled bottled water, mints, and optional champagne available upon request for your celebrations."
    },
    {
      icon: UserCheck,
      title: "Chauffeur Service",
      description: "Professional, discrete, English-speaking drivers dressed impeccably for your special occasion."
    },
    {
      icon: Wifi,
      title: "On-Board Connectivity",
      description: "High-speed Wi-Fi and multiple charging ports to keep everyone connected and devices fully charged."
    },
    {
      icon: ShieldCheck,
      title: "Total Reliability",
      description: "Rigorous vehicle maintenance, GPS tracking, and early arrivals so you never have to worry about the logistics."
    }
  ];

  const testimonials = [
    {
      quote: "LIV Tours made our wedding day completely stress-free. The Mercedes V-Class was pristine, and our driver arrived 15 minutes early. Highly recommended for any couple getting married in Chania!",
      author: "Maria & Alex",
      role: "Wedding Clients"
    },
    {
      quote: "We hired them for our company retreat in Crete. Coordinating transportation for 40 people seemed daunting, but they handled it flawlessly with their Sprinter minibuses. Absolute professionals.",
      author: "David L.",
      role: "Corporate Event Planner"
    },
    {
      quote: "Booked a driver at disposal for our bachelorette party. It was the best decision! We felt super safe moving between venues at night, and the driver was incredibly polite.",
      author: "Sarah J.",
      role: "Bachelorette Party"
    }
  ];

  return (
    <Layout>
      <main>
        <SEOHead
        title="Μεταφορές Γάμων & Events Χανιά Κρήτη | Wedding Transfers Crete"
        description="Premium μεταφορές γάμων, εταιρικών events και bachelor parties στα Χανιά και την Κρήτη. Mercedes στόλος, εξατομικευμένη εξυπηρέτηση. Ζητήστε προσφορά!"
        keywords="wedding transfer Chania, μεταφορά γάμου Χανιά, event transportation Crete, bachelor party Κρήτη, corporate event Chania, μεταφορές εκδηλώσεων Κρήτη"
        canonicalUrl="https://livtours.gr/events"
        includeLocalBusiness={true}
        serviceData={{
          name: "Event Transportation Crete",
          description: "Premium Mercedes transportation for weddings, corporate events, and bachelor parties in Chania and across Crete.",
          serviceType: "Event Transportation Service",
          areaServed: "Crete, Greece",
          url: "https://livtours.gr/events",
          priceRange: "€€€",
          offers: [
            { name: "Wedding Transfers", description: "Elegant transportation for bride, groom, and wedding guests" },
            { name: "Corporate Events", description: "Professional group transportation for business meetings and conferences" },
            { name: "Bachelor/Bachelorette", description: "Fun and reliable transportation for pre-wedding celebrations" }
          ]
        }}
        breadcrumbs={[
          { name: "Home", url: "https://livtours.gr" },
          { name: "Events & Weddings", url: "https://livtours.gr/events" }
        ]}
        faqItems={faqs}
        includeAggregateRating={true}
      />

      <article>
        {/* ========== CUSTOM CINEMATIC HERO SECTION ========== */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" aria-label="Event Transportation Services">
          {/* Background Layer with Parallax */}
          <div className="absolute inset-0 md:-top-20 md:-bottom-20 overflow-hidden">
            <img
              src={fleetVClass}
              alt="LIV Tours Luxury Event Fleet"
              className="w-full h-full object-cover object-center will-change-transform scale-105"
              style={{ transform: typeof window !== 'undefined' && window.innerWidth > 768 ? `translateY(${parallaxOffset}px)` : 'none' }}
              loading="eager"
            />
            {/* Multi-layered cinematic overlays */}
            <div className="absolute inset-0 bg-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-background" />
          </div>

          <div className="container-wide relative z-10 pt-32 pb-20 text-center">
            <div className="max-w-5xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full mb-8 border border-white/20 shadow-xl"
              >
                <Crown className="w-4 h-4 text-accent drop-shadow-[0_0_8px_rgba(var(--accent),0.4)]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">{t.events.badge}</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 text-white leading-[1.1]"
              >
                {t.events.heroTitle} <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">{t.events.heroTitleLine2}</span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-2xl text-white/90 leading-relaxed mb-12 max-w-2xl mx-auto font-medium drop-shadow-md"
              >
                {t.events.heroSubtitle}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-x-10 gap-y-6 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white/70"
              >
                {whyChooseUs.map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                      <item.icon className="w-3 h-3 text-accent" strokeWidth={3} />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-16"
              >
                <Button 
                  size="xl" 
                  className="rounded-full px-12 bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl shadow-accent/20 group"
                  onClick={() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Request Event Proposal
                  <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

      <TrustBar />

      {/* ========== SERVICES SECTION - MODERNIZED ========== */}
      <section className="section-padding bg-slate-50/50 relative overflow-hidden" aria-labelledby="services-heading">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/2 pointer-events-none" />
        
        <div className="container-wide relative z-10">
          <div className="max-w-4xl mb-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-md rounded-full mb-8 border border-slate-200 shadow-sm"
            >
              <Users className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t.events.ourServices}</span>
            </motion.div>
            
            <h2 id="services-heading" className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
              {t.events.transportationForEveryOccasion.split(' ')[0]} <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">{t.events.transportationForEveryOccasion.split(' ').slice(1).join(' ')}</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
              {t.events.customPricing}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {eventTypes.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group glass-card p-10 hover:-translate-y-3 transition-all duration-500 shadow-sm hover:shadow-2xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-10 group-hover:bg-accent transition-all duration-500 group-hover:rotate-6">
                  <event.icon className="w-8 h-8 text-accent group-hover:text-white transition-colors" />
                </div>
                
                <h3 className="text-3xl font-bold text-slate-950 mb-5 tracking-tight">{event.title}</h3>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed">{event.description}</p>
                
                <ul className="space-y-4">
                  {event.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-base font-medium text-slate-700">
                      <div className="mt-1 rounded-full p-1 bg-accent/20">
                        <Check className="w-3 h-3 text-accent" strokeWidth={3} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

        {/* ========== VIP AMENITIES - REDESIGNED ========== */}
        <section className="section-padding bg-background relative overflow-hidden" aria-labelledby="vip-heading">
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/2 pointer-events-none" />
          
          <div className="container-wide relative z-10">
            <div className="max-w-4xl mb-20 text-center mx-auto">
               <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full mb-8 border border-accent/20 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Premium Experience</span>
              </motion.div>
               
               <h2 id="vip-heading" className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                 The LIV <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">VIP Touch</span>
               </h2>
               
               <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                 When you book LIV Tours for your special event, you're getting an elevated experience designed for comfort and luxury.
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {vipAmenities.map((amenity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <amenity.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-950 mb-3 tracking-tight">{amenity.title}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{amenity.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FLEET PREVIEW - MODERNIZED ========== */}
        <section className="section-padding bg-slate-50/50 relative overflow-hidden" aria-labelledby="fleet-heading">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <div className="container-wide relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 md:mb-28">
              <div className="max-w-4xl">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-md rounded-full mb-8 border border-slate-200 shadow-sm"
                >
                  <Car className="w-4 h-4 text-accent" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{t.events.ourFleet}</span>
                </motion.div>
                
                <h2 id="fleet-heading" className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                  {t.events.premiumVehicles.split(' ')[0]} <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">{t.events.premiumVehicles.split(' ').slice(1).join(' ')}</span>
                </h2>
                
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                  {t.events.fleetSubtitle}
                </p>
              </div>
            </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[2rem] overflow-hidden aspect-video group"
            >
              <img src={fleetSedan} alt="Mercedes E-Class for events" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{t.events.eClass}</h3>
                <p className="text-white/80">{t.events.eClassDesc}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative rounded-[2rem] overflow-hidden aspect-video group"
            >
              <img src={fleetVClass} alt="Mercedes V-Class for events" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{t.events.vClass}</h3>
                <p className="text-white/80">{t.events.vClassDesc}</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative rounded-[2rem] overflow-hidden aspect-video group"
            >
              <img
                  src={fleetMinibus}
                  alt="Minibus for groups"
                  className="w-full h-full object-cover object-[center_70%] transition-transform duration-500 group-hover:scale-105"
                />  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{t.events.sprinter}</h3>
                <p className="text-white/80">{t.events.sprinterDesc}</p>
              </div>
            </motion.div>
            </div>
          </div>
        </section>

        {/* ========== HOW IT WORKS - REDESIGNED ========== */}
        <section className="section-padding bg-background relative overflow-hidden" aria-labelledby="process-heading">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 blur-[150px] pointer-events-none" />
          
          <div className="container-wide relative z-10">
            <div className="max-w-4xl mb-20 text-center mx-auto">
               <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full mb-8 border border-accent/20 shadow-sm"
              >
                <Clock className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Booking Experience</span>
              </motion.div>
               
               <h2 id="process-heading" className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                 How Planning <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">Works</span>
               </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-0.5 bg-border/60 z-0"></div>

              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative z-10 flex flex-col items-center text-center group"
                >
                  <div className="w-24 h-24 rounded-full bg-background border border-border shadow-soft flex items-center justify-center mb-6 group-hover:border-accent group-hover:shadow-accent/20 transition-all duration-500 relative">
                    {/* Inner glowing circle */}
                    <div className="absolute inset-1 bg-accent/5 rounded-full" />
                    <span className="text-3xl font-bold font-heading text-primary group-hover:text-accent transition-colors">{step.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed max-w-sm">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== TESTIMONIALS - MODERNIZED ========== */}
        <section className="section-padding bg-slate-50/50 relative overflow-hidden" aria-labelledby="testimonials-heading">
          <div className="container-wide relative z-10">
            <div className="max-w-4xl mb-20 text-center mx-auto">
               <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full mb-8 border border-accent/20 shadow-sm"
              >
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Client Reviews</span>
              </motion.div>
               
               <h2 id="testimonials-heading" className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                 Trusted for the <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">Best Occasions</span>
               </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((doc, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-8 flex flex-col justify-between relative"
                >
                  <Quote className="w-10 h-10 text-primary/10 absolute top-6 right-6" />
                  <div>
                    <div className="flex text-accent mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-foreground/90 italic mb-6 leading-relaxed relative z-10">
                      "{doc.quote}"
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{doc.author}</p>
                    <p className="text-sm text-muted-foreground">{doc.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FAQ SECTION - MODERNIZED ========== */}
        <section className="section-padding bg-background relative overflow-hidden" aria-labelledby="faq-heading">
          <div className="container mx-auto max-w-4xl relative z-10">
            <div className="text-center mb-16">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-100 rounded-full mb-8 border border-slate-200"
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Event Questions</span>
              </motion.div>
              <h2 id="faq-heading" className="text-4xl md:text-5xl font-black tracking-tight mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Frequently Asked <span className="italic font-serif text-accent">Questions</span>
              </h2>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="glass-card border-none px-6 py-2"
                >
                  <AccordionTrigger className="text-left font-semibold text-lg hover:text-accent hover:no-underline [&[data-state=open]]:text-accent">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ========== CONTACT FORM - REDESIGNED ========== */}
        <section id="quote" className="section-padding relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 blur-[200px] pointer-events-none" />
          
          <div className="container-wide relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full mb-8 border border-accent/20"
              >
                <Send className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Inquiry Form</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
                Secure Your <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">Custom Quote</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Tell us about your event and we'll create a personalized transportation package for you.
              </p>
            </div>

          <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">Type of Event *</Label>
              <Select
                value={formData.eventType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, eventType: value }))}
              >
                <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-border/50 focus:ring-accent pl-12 text-left relative transition-all duration-300">
                  <PartyPopper className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                  <SelectValue placeholder="Select event type..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/50 shadow-2xl z-[110]">
                  {eventTypes.map(event => (
                    <SelectItem key={event.id} value={event.id} className="cursor-pointer py-3 rounded-xl focus:bg-accent focus:text-white transition-colors">
                      <div className="flex items-center gap-3">
                        <event.icon className="w-4 h-4" />
                        <span className="font-semibold">{event.title.split(" ")[0]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  {t.events.yourName} *
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Smith"
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:ring-accent transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  {t.events.email} *
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:ring-accent transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  {t.events.phone} *
                </Label>
                <div className="relative">
                  <PhoneInput
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
                    placeholder="69..."
                    className="h-14 rounded-2xl bg-muted/30 border-border/50 focus:ring-accent transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  {t.events.eventDate}
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:ring-accent transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="guestCount" className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  {t.events.guestCount}
                </Label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
                  <Input
                    id="guestCount"
                    type="number"
                    value={formData.guestCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, guestCount: e.target.value }))}
                    placeholder="e.g. 20"
                    className="pl-12 h-14 rounded-2xl bg-muted/30 border-border/50 focus:ring-accent transition-all duration-300"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pickupLocation" className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">
                  {t.events.pickupArea}
                </Label>
                <LocationAutocomplete
                  id="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={(val) => setFormData(prev => ({ ...prev, pickupLocation: val }))}
                  placeholder="e.g. Chania Old Town or Hotel Name"
                  className="h-14 rounded-2xl bg-muted/30 border-border/50"
                  icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground ml-1">
                {t.events.tellUsAboutEvent}
              </Label>
              <Textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder={t.events.tellUsPlaceholder}
                className="rounded-2xl bg-muted/30 border-border/50 focus:ring-accent p-6 transition-all duration-300"
              />
            </div>

            <div className="flex items-start space-x-3 pt-4 border-t border-border/50">
              <Checkbox 
                id="privacy" 
                checked={acceptedPrivacy}
                onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                className="mt-1 flex-shrink-0"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="privacy"
                  className="text-sm text-foreground/80 leading-snug cursor-pointer"
                >
                  I agree to the <a href="/privacy" target="_blank" className="text-primary hover:underline font-medium">Privacy Policy</a> and <a href="/terms" target="_blank" className="text-primary hover:underline font-medium">Terms of Service</a>. *
                </label>
                <p className="text-xs text-muted-foreground">
                  We collect your details only to provide you with the quote and service requested.
                </p>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full text-base font-semibold py-6" disabled={isSubmitting || !acceptedPrivacy}>
              {isSubmitting ? (
                <>{t.events.sending}</>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t.events.submitRequest}
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t.events.responseTime}
            </p>
          </form>

          {/* Contact Options */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <a
              href="tel:+306944363525"
              className="flex items-center justify-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <Phone className="w-5 h-5 text-primary" />
              <span className="font-medium">{t.events.callUs}</span>
            </a>
            <a
              href="mailto:info@liv-tours.com?subject=Event Inquiry"
              className="flex items-center justify-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <Mail className="w-5 h-5 text-primary" />
              <span className="font-medium">{t.events.emailUs}</span>
            </a>
            </div>
          </div>
        </section>
      </article>
      </main>
    </Layout>
  );
};

export default Events;
