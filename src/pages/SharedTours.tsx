import { 
  Users, 
  Clock, 
  Calendar, 
  Check, 
  ArrowRight, 
  Shield, 
  Globe, 
  Star, 
  Sparkles, 
  MapPin, 
  Apple,
  Info,
  CreditCard,
  Droplets,
  Tag,
  RotateCcw,
  Baby,
  ShieldCheck,
  Palmtree,
  Waves,
  Sun,
  CalendarCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import TrustBar from "@/components/TrustBar";
import FinalCTABlock from "@/components/FinalCTABlock";
import SharedTourBooking from "@/components/SharedTourBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublishedTours } from "@/hooks/useTours";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import heroImage from "@/assets/tours-hero-new2.jpg";
import elafonisiDetail from "@/assets/elafonisi-detail.png";
import { AnimatePresence } from "framer-motion";

const SharedTours = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { data: tours = [], isLoading } = usePublishedTours();
  const [selectedTour, setSelectedTour] = useState<{ id: string, title: string } | null>(null);
  
  const sharedToursFromDb = tours.filter(tour => tour.tour_type === 'shared');

  const featuredSharedTour = {
    id: 'shared-elafonisi-only-wednesday',
    title: 'Elafonisi Pink Sand Experience',
    slug: 'elafonisi-shared-experience',
    description: 'Join our weekly group tour to the breathtaking Elafonisi beach. Crystal clear waters, pink sand, and a comfortable ride with our premium fleet.',
    short_teaser: t.tours.sharedTourSchedule,
    images: { cover_url: heroImage },
    duration_hours: 7.5,
    tour_type: 'shared'
  };

  const displayTours = sharedToursFromDb.length > 0 ? sharedToursFromDb : [featuredSharedTour];

  return (
    <Layout>
      <SEOHead
        title="Best Shared Tours Chania | Small Group Adventures Crete"
        description="Experience Chania's best shared group tours. Join our premium small-group excursions to Elafonisi and Crete's iconic highlights. Fixed prices, luxury fleet, and expert guides. Book your adventure today!"
        keywords="shared tours Chania, group excursions Chania, small group tours Crete, Elafonisi shared tour, Chania group trips, budget tours Chania, luxury group excursions"
        canonicalUrl="https://livtours.gr/tours/shared"
      />

      {/* Modern High-Impact Hero */}
      <PageHero
        label={t.nav.sharedTours}
        title={t.tours.sharedToursTitle}
        titleAccent="Together"
        subtitle={t.tours.sharedToursSubtitle}
        image={heroImage}
        icon={Users}
        overlay="dark"
        align="left"
        sideContent={
          <div className="hidden lg:block relative group">
            <div className="absolute -inset-4 bg-lime/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative glass-card p-8 rounded-[2rem] border border-white/20 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-lime/10 flex items-center justify-center text-lime">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <div>
                   <p className="text-white font-bold text-xl leading-none">Best Seller</p>
                   <p className="text-white/60 text-xs mt-1 uppercase tracking-widest font-bold">Recommended</p>
                </div>
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-6 italic">
                "We loved the shared tour to Elafonisi! The van was luxurious and meeting other couples made the trip much more fun."
              </p>
              <div className="flex -space-x-3 mb-4">
                {[
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop"
                ].map((url, i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden">
                    <img src={url} alt="Traveler avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-accent flex items-center justify-center text-[10px] text-accent-foreground font-black">
                  +8
                </div>
              </div>
              <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest">A top choice for solo & couple travelers</p>
            </div>
          </div>
        }
      />

      <TrustBar 
        items={[
          {
            icon: ShieldCheck,
            title: language === 'gr' ? "Σταθερές Τιμές" : "Fixed Prices",
            shortTitle: language === 'gr' ? "Τιμή" : "Fixed",
            description: language === 'gr' ? "Χωρίς κρυφές χρεώσεις" : "No hidden fees",
          },
          {
            icon: Shield,
            title: language === 'gr' ? "Premium Στόλος" : "Premium Fleet",
            shortTitle: language === 'gr' ? "Στόλος" : "Fleet",
            description: language === 'gr' ? "Mercedes AC Minivans" : "Air-conditioned luxury",
          },
          {
            icon: Clock,
            title: language === 'gr' ? "Δωρεάν Ακύρωση" : "Free Cancellation",
            shortTitle: language === 'gr' ? "Ακύρωση" : "Cancel",
            description: language === 'gr' ? "Έως 24ω πριν" : "Up to 24h before",
          },
          {
            icon: Baby,
            title: language === 'gr' ? "Παιδικά Καθίσματα" : "Child Seats",
            shortTitle: language === 'gr' ? "Παιδιά" : "Kids",
            description: language === 'gr' ? "Κατόπιν αιτήματος" : "On request",
          },
        ]}
      />

      {/* Main Experience Section */}
      <section className="section-padding bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-lime/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />
        
        <div className="container-wide">
          {/* Header */}
          <div className="max-w-4xl mb-20 md:mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-start"
            >
              <div className="section-subheading">
                 <CalendarCheck className="w-4 h-4" />
                 Weekly Fixed Excursions
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-[1.2] mb-8">
                {t.tours.sharedToursTitle} <span className="text-accent underline decoration-lime/30 underline-offset-8">Experience</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                {t.tours.sharedAdventuresIntro}
              </p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 xl:gap-20">
            {/* LEFT: Tour Cards */}
            <div className="lg:col-span-8 space-y-12">
              {isLoading ? (
                <div className="w-full h-80 bg-muted animate-pulse rounded-3xl" />
              ) : displayTours.map((tour, idx) => (
                <motion.div
                  key={tour.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-card rounded-[2.5rem] border border-border/50 overflow-hidden shadow-sm hover:shadow-2xl hover:border-accent/20 transition-all duration-500"
                >
                  <div className="grid md:grid-cols-2">
                    {/* Image side */}
                    <div className="relative aspect-[4/3] md:aspect-auto h-full overflow-hidden">
                      <img 
                        src={tour.images.cover_url || heroImage} 
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-col gap-2">
                         <div className="px-3 py-1.5 md:px-4 md:py-2 bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                            <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5 text-accent" />
                            {t.tours.everyWednesday}
                         </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 lg:hidden">
                        <div className="glass-card p-3 rounded-xl flex justify-between items-center text-white">
                           <span className="font-bold text-sm">{t.tours.sharedTourPrice}</span>
                           <span className="text-[10px] opacity-70">Total</span>
                        </div>
                      </div>
                    </div>

                    {/* Content side */}
                    <div className="p-6 md:p-12 flex flex-col">
                      <div className="flex items-center gap-2 mb-4 md:mb-6">
                        <div className="flex text-amber-500 scale-90 md:scale-100 origin-left">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Premium Group Excursion</span>
                      </div>

                      <h3 className="text-2xl md:text-4xl font-black mb-6 tracking-tight group-hover:text-accent transition-colors leading-tight">
                        {tour.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
                         <div className="space-y-1">
                            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Departure</p>
                            <div className="flex items-center gap-2 font-bold text-primary text-sm md:text-base">
                               <Clock className="w-3.5 h-3.5 text-accent" />
                               09:00 AM
                            </div>
                         </div>
                         <div className="space-y-1 text-right">
                            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Return Early</p>
                            <div className="flex items-center justify-end gap-2 font-bold text-primary text-sm md:text-base">
                               16:00 PM
                               <ArrowRight className="w-3.5 h-3.5 text-accent" />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Arrival @ Beach</p>
                            <p className="font-bold text-primary text-sm md:text-base">10:30 AM</p>
                         </div>
                         <div className="space-y-1 text-right">
                            <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Pickup location</p>
                            <p className="font-bold text-primary truncate text-sm md:text-base">Chania Center</p>
                         </div>
                      </div>

                      <div className="mt-auto space-y-6">
                         <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                               <Apple className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                               <p className="text-xs font-bold text-primary mb-0.5">Complementary Inclusions</p>
                               <p className="text-xs text-muted-foreground leading-snug">{t.tours.freeWaterSnacks}</p>
                            </div>
                         </div>

                         <Button 
                            className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg gap-3 shadow-xl shadow-primary/20 group-hover:translate-y-[-2px] transition-all"
                            onClick={() => setSelectedTour({ id: tour.id, title: tour.title })}
                         >
                            {t.tours.bookYourSpot}
                            <ArrowRight className="w-5 h-5" />
                         </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* Urgency Widget moved below cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-lime text-lime-foreground p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden group shadow-xl shadow-lime/20"
              >
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1 rounded-full">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          High Demand
                       </div>
                       <h4 className="text-2xl md:text-3xl font-black leading-tight italic">Don't miss your chance!</h4>
                       <p className="text-sm md:text-base font-medium opacity-90 leading-relaxed max-w-xl">
                          Our shared excursions often sell out 7-10 days in advance. Popular spots like Elafonisi have limited shared arrivals each week.
                       </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-4">
                       <div className="text-right hidden md:block">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                          <p className="font-black text-xl">Available Now</p>
                       </div>
                       <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                          <Calendar className="w-8 h-8" />
                       </div>
                    </div>
                 </div>
              </motion.div>
            </div>

            {/* RIGHT: Sidebar Info */}
            <div className="lg:col-span-4 space-y-10">
              {/* Pricing breakdown card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-accent/5 rounded-[2.5rem] p-6 md:p-10 border border-accent/20 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[60px] translate-x-1/2 -translate-y-1/2" />
                
                <h4 className="text-xs font-black text-accent uppercase tracking-[0.2em] mb-8">{t.tours.paymentStructure}</h4>
                
                <div className="space-y-6">
                   <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-muted-foreground">{t.tours.bookingDeposit}</span>
                        <span className="text-primary text-2xl">€18</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Pay now to reserve</p>
                   </div>

                   <div className="w-full border-t border-accent/10 border-dashed" />

                   <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-muted-foreground">{t.tours.remainingBalance}</span>
                        <span className="text-primary text-2xl">€20</span>
                      </div>
                   </div>

                   <div className="bg-white/50 dark:bg-card/50 p-6 rounded-[2rem] border border-accent/10 mt-6 shadow-sm">
                      <div className="flex justify-between items-center text-primary">
                        <span className="font-extrabold text-lg">{t.tours.totalPerPerson}</span>
                        <span className="font-black text-4xl text-accent">€38</span>
                      </div>
                   </div>
                </div>

                <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground font-medium bg-accent/5 p-4 rounded-xl border border-accent/5">
                   <Info className="w-4 h-4 text-accent shrink-0" />
                   Cash payments to driver on excursion day.
                </div>
              </motion.div>

              {/* Shared Benefits Card */}
              <div className="bg-card rounded-[2.5rem] p-10 border border-border/50 shadow-sm space-y-8">
                 <h4 className="text-xl font-bold tracking-tight">Experience Perks</h4>
                 <ul className="space-y-6">
                    {[
                      { icon: Globe, label: "English Speaking", desc: "Expert driver-guides" },
                      { icon: Shield, label: "Fleet Excellence", desc: "Mercedes AC Minivans" },
                      { icon: CreditCard, label: "Easy Booking", desc: "Secure online deposit" },
                      { icon: Droplets, label: "Stay Hydrated", desc: "Mineral water provided" },
                    ].map((perk, i) => (
                      <li key={i} className="flex gap-4">
                         <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary shrink-0">
                            <perk.icon className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="font-bold text-sm leading-none mb-1">{perk.label}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">{perk.desc}</p>
                         </div>
                      </li>
                    ))}
                 </ul>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Discover Elafonisi Section */}
      <section className="section-padding bg-card relative overflow-hidden">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Side */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[3rem] overflow-hidden group shadow-2xl"
            >
              <img 
                src={elafonisiDetail} 
                alt={t.tours.discoverElafonisiTitle}
                className="w-full aspect-[4/5] object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-10 left-10 p-8 glass-card rounded-2xl border-white/20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-white font-black text-2xl drop-shadow-lg">{t.tours.discoverElafonisiSub}</p>
              </div>
            </motion.div>

            {/* Info Side */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
               <div className="space-y-4">
                  <div className="section-subheading">Features</div>
                  <h2 className="text-4xl md:text-5xl font-black text-primary leading-tight">
                    {t.tours.discoverElafonisiTitle}
                  </h2>
               </div>

               <div className="space-y-10">
                  <div className="flex gap-6 group/item">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center shrink-0 group-hover/item:bg-accent group-hover/item:text-white transition-all duration-300">
                        <Waves className="w-8 h-8 text-accent group-hover/item:text-white transition-colors" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-xl font-bold text-primary">{t.tours.discoverElafonisiPinkSand}</h4>
                        <p className="text-muted-foreground leading-relaxed">{t.tours.discoverElafonisiPinkSandDesc}</p>
                     </div>
                  </div>

                  <div className="flex gap-6 group/item">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center shrink-0 group-hover/item:bg-accent group-hover/item:text-white transition-all duration-300">
                        <Sun className="w-8 h-8 text-accent group-hover/item:text-white transition-colors" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-xl font-bold text-primary">{t.tours.discoverElafonisiLagoon}</h4>
                        <p className="text-muted-foreground leading-relaxed">{t.tours.discoverElafonisiLagoonDesc}</p>
                     </div>
                  </div>

                  <div className="flex gap-6 group/item">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center shrink-0 group-hover/item:bg-accent group-hover/item:text-white transition-all duration-300">
                        <Palmtree className="w-8 h-8 text-accent group-hover/item:text-white transition-colors" />
                     </div>
                     <div className="space-y-2">
                        <h4 className="text-xl font-bold text-primary">{t.tours.discoverElafonisiNatura}</h4>
                        <p className="text-muted-foreground leading-relaxed">{t.tours.discoverElafonisiNaturaDesc}</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Commitment Section */}
      <section className="section-padding bg-muted/30 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-[120px] -z-10" />
        
        <div className="container-wide">
           <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
              <div className="section-subheading mx-auto">Commitment</div>
              <h3 className="text-2xl md:text-5xl lg:text-6xl font-black text-primary tracking-tight leading-[1.2] mb-6">Our Commitment to <span className="text-accent">Excellence</span></h3>
              <p className="mobile-text-spacing text-muted-foreground">Every shared journey includes our signature service standards and transparent policies.</p>
           </div>
           
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: t.tours.termFixedPrices, desc: t.tours.termFixedPricesDesc, icon: Tag },
                { title: t.tours.termPremiumFleet, desc: t.tours.termPremiumFleetDesc, icon: Shield },
                { title: t.tours.termCancellation, desc: t.tours.termCancellationDesc, icon: RotateCcw },
                { title: t.tours.termChildSeats, desc: t.tours.termChildSeatsDesc, icon: Baby }
              ].map((f, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative p-8 bg-card rounded-[2rem] border border-border/50 shadow-sm hover:shadow-xl hover:border-accent/10 transition-all duration-500 overflow-hidden"
                >
                   <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-accent/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                   
                   <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                      <f.icon className="w-6 h-6" />
                   </div>
                   <h4 className="text-lg font-bold mb-3 group-hover:text-accent transition-colors">{f.title}</h4>
                   <p className="text-sm text-muted-foreground leading-relaxed relative z-10">{f.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
      </section>

      <FinalCTABlock 
        title="Looking for something private?"
        subtitle="Enjoy total exclusivity with your own dedicated driver and a custom-tailored itinerary just for your group."
        badge="Private Experience"
        primaryButtonText="Explore Private Tours"
        primaryButtonLink="/tours/private"
      />

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedTour && (
          <SharedTourBooking 
            tourId={selectedTour.id}
            tourTitle={selectedTour.title}
            onClose={() => setSelectedTour(null)}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default SharedTours;
