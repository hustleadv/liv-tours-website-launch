import { TourVibe, VIBE_OPTIONS } from "@/lib/tours";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Palmtree, 
  Landmark, 
  UtensilsCrossed, 
  Sun, 
  Baby, 
  Mountain, 
  Heart, 
  Sparkles,
  Check
} from "lucide-react";
import { motion } from "framer-motion";

interface VibeSelectorProps {
  selectedVibe: TourVibe | null;
  onSelect: (vibe: TourVibe) => void;
}

const vibeIcons: Record<string, any> = {
  beach: Palmtree,
  culture: Landmark,
  'food-wine': UtensilsCrossed,
  sunset: Sun,
  family: Baby,
  adventure: Mountain,
  romantic: Heart,
  custom: Sparkles
};

const VibeSelector = ({ selectedVibe, onSelect }: VibeSelectorProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6 md:space-y-10">
      <div className="text-center mb-8 md:mb-14">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl xs:text-3xl md:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-primary via-primary/90 to-accent bg-clip-text text-transparent px-2"
        >
          {t.tourBuilder.whatsYourVibe}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm xs:text-base md:text-xl text-muted-foreground max-w-xl mx-auto px-4"
        >
          {t.tourBuilder.chooseIdealDay}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
        {VIBE_OPTIONS.map((vibe, index) => {
          const Icon = vibeIcons[vibe.id] || Sparkles;
          const isSelected = selectedVibe === vibe.id;
          
          return (
            <motion.button
              key={vibe.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              type="button"
              onClick={() => onSelect(vibe.id)}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-3 md:gap-5 p-4 xs:p-5 md:p-8 rounded-[1.5rem] xs:rounded-[2rem] border-2 transition-all duration-500 text-center",
                isSelected
                  ? "border-accent bg-accent/5 shadow-2xl shadow-accent/10 scale-[1.02] md:scale-[1.05] z-10"
                  : "border-border hover:border-accent/40 hover:bg-muted/30 hover:shadow-xl hover:-translate-y-1"
              )}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 xs:-top-2 xs:-right-2 w-6 h-6 xs:w-8 xs:h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg z-20"
                >
                  <Check className="w-4 h-4 xs:w-5 xs:h-5" />
                </motion.div>
              )}

              {/* Icon Container */}
              <div className={cn(
                "w-10 h-10 xs:w-12 xs:h-12 md:w-20 md:h-20 rounded-xl xs:rounded-2xl flex items-center justify-center transition-all duration-500",
                isSelected 
                  ? "bg-accent text-white rotate-6 shadow-lg shadow-accent/20" 
                  : "bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent group-hover:-rotate-6"
              )}>
                <Icon className="w-5 h-5 xs:w-6 xs:h-6 md:w-10 md:h-10" />
              </div>

              <div className="space-y-1 md:space-y-2">
                <p className={cn(
                  "font-black text-sm md:text-xl leading-tight transition-colors tracking-tight",
                  isSelected ? "text-primary dark:text-white" : "text-foreground group-hover:text-primary"
                )}>
                  {vibe.label}
                </p>
                <p className="text-[10px] xs:text-xs md:text-sm text-muted-foreground leading-relaxed line-clamp-2 md:line-clamp-none">
                  {vibe.description}
                </p>
              </div>

              {/* Background Glow (Hover) */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 rounded-[1.5rem] xs:rounded-[2rem] transition-opacity -z-10" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default VibeSelector;
