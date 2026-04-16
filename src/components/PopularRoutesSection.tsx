import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import PopularRouteCard from "@/components/PopularRouteCard";
import { motion } from "framer-motion";
import { useFeaturedRoutePrices } from "@/hooks/useFeaturedRoutePrices";

interface PopularRoutesSectionProps {
  onGetQuote: (pickup: string, dropoff: string) => void;
}

const PopularRoutesSection = forwardRef<HTMLElement, PopularRoutesSectionProps>(({ onGetQuote }, ref) => {
  const { routes: featuredRoutes, isLoading } = useFeaturedRoutePrices();

  return (
    <section ref={ref} className="section-padding bg-slate-50/50 relative overflow-hidden">
      {/* Decorative Background - Subtle Luxury */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-accent/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      
      <div className="container-wide relative z-10">
        {/* Header - Matching Index patterns */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20 md:mb-28">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full mb-8 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <MapPin className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Popular Routes</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent">
              Chania’s Most <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">Requested Transfers</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
              The premier choice for Chania airport taxi services and private transfers across Crete. Secure your fixed-price journey and discover Crete’s top destinations in luxury.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <Link to="/routes">
              <Button variant="outline" size="xl" className="rounded-full px-12 group hover:bg-primary hover:text-primary-foreground transition-all duration-500 shadow-sm hover:shadow-xl border-primary text-primary">
                Explore All Routes
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRoutes.map((route) => (
            <PopularRouteCard 
              key={route.id} 
              route={route} 
              livePrice={route.livePrice}
              isLoadingPrice={isLoading || route.isLoadingPrice}
              onGetQuote={onGetQuote}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

PopularRoutesSection.displayName = "PopularRoutesSection";

export default PopularRoutesSection;
