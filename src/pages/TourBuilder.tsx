import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { TourBuilderWizard } from "@/components/TourBuilder";
import { Compass, Sparkles, Shield, MapPin, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import toursHero from "@/assets/tours-hero-new.jpg";

const TourBuilder = () => {
  const { t } = useLanguage();
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setParallaxOffset(window.pageYOffset * 0.35);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Layout>
      <SEOHead
        title="Custom Private Tour Builder Crete | Design Your Bespoke Excursion"
        description="Design your ideal private tour in Chania and across Crete with our AI-powered builder. Create bespoke itineraries, choosing from premium Mercedes vehicles and expert local guides."
        keywords="custom private tours Crete, bespoke excursions Chania, Crete tour planner, private driver Crete, personalized Crete tours, luxury excursions Chania"
        canonicalUrl="https://livtours.gr/tours/builder"
      />

      <article>
        {/* ========== CUSTOM CINEMATIC HERO SECTION ========== */}
        <section className="relative min-h-[75vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden py-24 md:py-32" aria-labelledby="builder-title">
          {/* Background Layer with Parallax */}
          <div className="absolute inset-0 md:-top-20 md:-bottom-20 overflow-hidden">
            <img
              src={toursHero}
              alt="LIV Tours Private Tour Experience"
              className="w-full h-full object-cover object-center will-change-transform scale-105"
              style={{ transform: typeof window !== 'undefined' && window.innerWidth > 768 ? `translateY(${parallaxOffset}px)` : 'none' }}
              loading="eager"
            />
            {/* Multi-layered cinematic overlays */}
            <div className="absolute inset-0 bg-slate-950/50" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-transparent to-slate-950/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/20" />
          </div>

          <div className="container-wide relative z-20 text-center px-5">
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
              {/* Badge with motion */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl"
              >
                <div className="p-1.5 rounded-full bg-accent/20">
                  <Compass className="w-3.5 h-3.5 md:w-4 h-4 text-accent" />
                </div>
                <span className="text-[9px] md:text-sm font-black uppercase tracking-[0.25em] text-white">
                  {t.tourBuilder.badge || 'Build Your Dream Tour'}
                </span>
              </motion.div>

              {/* Title with brand gradient and serif accent */}
              <div className="space-y-6">
                <motion.h1 
                  id="builder-title"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="text-4xl xs:text-5xl md:text-7xl lg:text-9xl font-black tracking-tight leading-[0.95] md:leading-[0.9] text-white"
                >
                  {t.tourBuilder.heroTitle.split(' ').slice(0, -1).join(' ')} <br className="hidden md:block" />
                  <span className="block text-accent italic font-serif mt-4 underline decoration-accent/20 underline-offset-8">
                    {t.tourBuilder.heroTitle.split(' ').pop()}
                  </span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-lg md:text-2xl text-white/80 leading-relaxed max-w-2xl mx-auto font-medium px-4 md:px-0"
                >
                  {t.tourBuilder.heroSubtitle}
                </motion.p>
              </div>

              {/* Horizontal Trust Badges */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-4"
              >
                <div className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-slate-900/40 backdrop-blur-md rounded-full border border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/90">
                    {t.tourBuilder.trustBadge1}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-slate-900/40 backdrop-blur-md rounded-full border border-white/10">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/90">
                    {t.tourBuilder.trustBadge2}
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Cinematic lighting effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-accent/5 blur-[200px] -z-1 pointer-events-none" />
        </section>

        {/* ========== BUILDER WIZARD SECTION ========== */}
        <section className="pb-24 md:pb-32 relative overflow-hidden bg-background">
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="container-wide relative z-10">
            <div className="max-w-4xl mx-auto -mt-16 md:-mt-40 px-4 md:px-0">
              <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="glass-card shadow-3xl shadow-slate-950/20 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden p-1 md:p-1.5 border border-white/30 backdrop-blur-2xl bg-white/70 shadow-2xl"
              >
                <div className="bg-white/80 dark:bg-slate-950/80 rounded-[2.2rem] md:rounded-[3.2rem] p-5 md:p-12 border border-slate-200 dark:border-slate-800">
                  <TourBuilderWizard />
                </div>
              </motion.div>

              {/* Bottom Context Info */}
              <div className="mt-16 flex flex-wrap justify-center gap-12 text-center md:text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-none mb-1">Local Pickup</h3>
                    <p className="text-sm text-muted-foreground">Any hotel or airport in Crete</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                   <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-none mb-1">Fixed Prices</h3>
                    <p className="text-sm text-muted-foreground">No hidden charges, guaranteed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>
    </Layout>
  );
};

export default TourBuilder;
