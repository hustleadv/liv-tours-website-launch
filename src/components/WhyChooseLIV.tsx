import { Check, ArrowRight, Clock, Shield, Car, Zap, MapPin, Star, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface WhyChooseLIVProps {
  variant?: 'full' | 'compact';
  showCTA?: boolean;
  className?: string;
}

const WhyChooseLIV = ({ 
  variant = 'full', 
  showCTA = true,
  className = ''
}: WhyChooseLIVProps) => {
  const { t } = useLanguage();

  const fullReasons = [
    {
      icon: Clock,
      title: t.whyChoose.onTime,
      description: 'We monitor every flight and adjust automatically. No calls needed, no stress.',
      gradient: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: Shield,
      title: t.whyChoose.clearPricing,
      description: 'The price you see is the price you pay. No hidden fees, no meter anxiety.',
      gradient: 'from-olive/10 to-olive/5',
      iconBg: 'bg-olive/10',
      iconColor: 'text-olive',
    },
    {
      icon: Car,
      title: t.whyChoose.comfort,
      description: 'Premium Mercedes fleet with space for your bags, child seats, and everything else.',
      gradient: 'from-accent/10 to-accent/5',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
    {
      icon: Zap,
      title: t.whyChoose.fastConfirm,
      description: 'Book and confirm in minutes. Real humans respond, usually within an hour.',
      gradient: 'from-primary/10 to-primary/5',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      icon: MapPin,
      title: t.whyChoose.localKnowledge,
      description: 'Drivers who know the hidden beaches, best tavernas, and perfect photo spots.',
      gradient: 'from-olive/10 to-olive/5',
      iconBg: 'bg-olive/10',
      iconColor: 'text-olive',
    },
    {
      icon: Star,
      title: t.whyChoose.trusted,
      description: '5-star reviews on Google. We earn your trust with every trip.',
      gradient: 'from-accent/10 to-accent/5',
      iconBg: 'bg-accent/10',
      iconColor: 'text-accent',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  if (variant === 'compact') {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          {t.whyChoose.title}
        </h4>
        <ul className="space-y-3" role="list">
          {fullReasons.slice(0, 4).map((reason) => (
            <li key={reason.title} className="flex items-center gap-3 text-sm text-foreground/90 group">
              <div className={`p-1 rounded-md ${reason.iconBg} group-hover:scale-110 transition-transform`}>
                <reason.icon className={`w-3.5 h-3.5 ${reason.iconColor}`} />
              </div>
              {reason.title}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className={`section-padding relative overflow-hidden bg-slate-50 dark:bg-slate-950/50 ${className}`} aria-labelledby="why-choose-heading">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-0 right-0 p-20 opacity-[0.02] dark:opacity-[0.05]">
          <Sparkles className="w-64 h-64 text-primary rotate-12" />
        </div>
      </div>

      <div className="container-wide relative z-10">
        {/* Header - Redesigned for Impact */}
        <div className="max-w-4xl mx-auto text-center mb-20 md:mb-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full mb-8 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Crown className="w-4 h-4 text-accent drop-shadow-[0_0_8px_rgba(var(--accent),0.4)]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">The LIV Difference</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            id="why-choose-heading" 
            className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight mb-8 leading-[1.05] bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent"
          >
            Why Travelers <span className="block text-accent italic font-serif mt-2 underline decoration-accent/20 underline-offset-8">Choose LIV TOURS</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            We don't just get you there, we make the journey part of your Crete experience with luxury, reliability, and local expertise.
          </motion.p>
        </div>

        {/* Improved Interactive Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10" 
        >
          {fullReasons.map((reason, index) => (
            <motion.div 
              key={reason.title} 
              variants={itemVariants}
              className="group relative"
            >
              {/* Card Glow Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm group-hover:shadow-2xl group-hover:shadow-accent/5 group-hover:-translate-y-3 transition-all duration-500 overflow-hidden">
                {/* Decorative Number */}
                <span className="absolute top-8 right-10 text-8xl font-black text-slate-50 dark:text-slate-800/50 pointer-events-none group-hover:text-accent/10 transition-colors">
                  0{index + 1}
                </span>

                {/* Icon with sophisticated treatment */}
                <div className={`relative w-20 h-20 rounded-3xl ${reason.iconBg} flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
                  <div className="absolute inset-0 bg-white/20 dark:bg-black/20 rounded-3xl blur-[1px]" />
                  <reason.icon className={`relative w-10 h-10 ${reason.iconColor}`} strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-primary mb-5 group-hover:text-accent transition-colors">{reason.title}</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {reason.description}
                </p>

                {/* Accent Detail */}
                <div className="mt-10 flex items-center gap-3">
                  <div className="h-1.5 w-12 bg-accent rounded-full opacity-30 group-hover:w-24 group-hover:opacity-100 transition-all duration-700" />
                  <div className="w-1.5 h-1.5 rounded-full bg-accent opacity-30" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Re-designed CTA Area */}
        {showCTA && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-24 md:mt-32"
          >
            <div className="inline-block p-1 rounded-[2.5rem] bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 mb-8">
              <Link to="/contact">
                <Button size="xl" variant="accent" className="min-w-[280px] h-20 text-xl font-bold px-12 group shadow-2xl shadow-accent/20 rounded-[2rem]">
                  Start Your Journey
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" aria-hidden="true" />
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mt-8">
              <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-accent" /> {t.microcopy.instantConfirmation}</span>
              <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-accent" /> {t.microcopy.noHiddenFees}</span>
              <span className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-accent" /> Professional Drivers</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default WhyChooseLIV;
