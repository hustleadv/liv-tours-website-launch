import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight, Check, Compass, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface FinalCTABlockProps {
  title: string;
  subtitle: string;
  badge?: string;
  badgeIcon?: LucideIcon;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  whatsappMessage?: string;
  showTrustIcons?: boolean;
}

const FinalCTABlock = ({
  title,
  subtitle,
  badge = "LIV Tours",
  badgeIcon: BadgeIcon = Compass,
  primaryButtonText = "Get a Quote",
  primaryButtonLink = "/contact",
  whatsappMessage = "Hi! I'd like to ask about your services.",
  showTrustIcons = true
}: FinalCTABlockProps) => {
  return (
    <section className="section-padding bg-slate-50/80 relative overflow-hidden border-t border-slate-200/60">
      {/* Discreet Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2" />
      </div>
      
      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Quality Badge - Matching other sections */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-subheading mb-8"
          >
            <BadgeIcon className="w-4 h-4 mr-1" />
            {badge}
          </motion.div>
          
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-primary mb-8 tracking-tight leading-[1.05]">
            Ready for your <span className="inline text-accent italic font-serif underline decoration-accent/20 underline-offset-8">journey?</span>
          </h2>
          
          <p className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
             {primaryButtonLink.startsWith('#') ? (
                <a href={primaryButtonLink} className="w-full sm:w-auto">
                   <Button variant="hero" size="xl" className="shadow-xl shadow-accent/20 min-w-[240px] w-full rounded-full">
                      {primaryButtonText}
                      <ArrowRight className="w-5 h-5 ml-2" />
                   </Button>
                </a>
             ) : (
                <Link to={primaryButtonLink} className="w-full sm:w-auto">
                   <Button variant="hero" size="xl" className="shadow-xl shadow-accent/20 min-w-[240px] w-full rounded-full">
                      {primaryButtonText}
                      <ArrowRight className="w-5 h-5 ml-2" />
                   </Button>
                </Link>
             )}
            
            <a 
              href={`https://wa.me/306944363525?text=${encodeURIComponent(whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto overflow-hidden rounded-full"
            >
              <Button variant="outline" size="xl" className="min-w-[240px] w-full rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-500 font-bold group">
                <MessageCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                WhatsApp Us
              </Button>
            </a>
          </div>

          {showTrustIcons && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-16 pt-10 border-t border-slate-200 flex flex-wrap justify-center gap-x-10 gap-y-4"
            >
               {[
                 "Reply within 15 mins",
                 "Free Cancellation",
                 "Secure Booking"
               ].map((text, i) => (
                 <div key={i} className="flex items-center gap-2 text-muted-foreground/60 text-xs md:text-sm font-bold uppercase tracking-widest">
                   <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
                     <Check className="w-3 h-3 text-accent" />
                   </div>
                   <span>{text}</span>
                 </div>
               ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FinalCTABlock;
