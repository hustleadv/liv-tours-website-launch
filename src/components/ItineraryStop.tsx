import { useRef, useEffect, useState } from "react";
import { Clock, MapPin, Navigation, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Stop {
  name: string;
  stop_minutes?: number;
  note?: string;
  lat?: number;
  lon?: number;
}

interface ItineraryStopProps {
  stop: Stop;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  totalStops: number;
  language: string;
  isRevealed: boolean;
  onReveal: () => void;
  onCollapse: () => void;
}

export default function ItineraryStop({ 
  stop, 
  index, 
  isFirst, 
  isLast, 
  totalStops,
  language,
  isRevealed,
  onReveal,
  onCollapse
}: ItineraryStopProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Set mounted after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMounted(true);
      // First item becomes visible immediately after mount
      if (isFirst) {
        setIsVisible(true);
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isFirst]);

  // Reveal animation for non-first items when isRevealed becomes true
  useEffect(() => {
    if (isFirst || !hasMounted || !isRevealed) return;
    
    // Staggered reveal based on index
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 150); // 150ms delay between each stop
    
    return () => clearTimeout(timer);
  }, [isFirst, hasMounted, isRevealed, index]);

  // Handle reveal button click
  const handleRevealClick = () => {
    onReveal();
    // Smooth scroll to show more content
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Handle collapse button click
  const handleCollapseClick = () => {
    // Smooth scroll to first stop before collapsing
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Delay collapse to allow scroll to complete
    setTimeout(() => {
      onCollapse();
    }, 300);
  };

  // Before mount, show nothing (prevents flash)
  if (!hasMounted) {
    return (
      <div ref={ref} className="relative min-h-[100px]">
        {/* Placeholder */}
      </div>
    );
  }

  // Hide non-first items until revealed
  if (!isFirst && !isRevealed) {
    return null;
  }

  return (
    <div ref={ref} className="relative">
      {/* Connecting line segment - grows when visible */}
      {!isLast && isVisible && (
        <div 
          className="absolute left-5 md:left-6 top-10 md:top-12 w-0.5 bg-gradient-to-b from-accent to-accent/20 origin-top"
          style={{
            height: 'calc(100% - 16px)',
            transform: isVisible ? 'scaleY(1)' : 'scaleY(0)',
            transition: 'transform 0.6s ease-out 0.3s'
          }}
        />
      )}
      
      <div 
        className="relative flex gap-4 md:gap-5 group"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
        }}
      >
        {/* Timeline node */}
        <div className="relative z-10 flex-shrink-0">
          <div 
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-lg",
              isFirst 
                ? "bg-accent text-accent-foreground ring-4 ring-accent/20" 
                : isLast 
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-card border-2 border-accent text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors duration-300"
            )}
            style={{
              transform: isVisible ? 'scale(1)' : 'scale(0)',
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s'
            }}
          >
            {isFirst ? (
              <Navigation className="w-4 h-4 md:w-5 md:h-5" />
            ) : isLast ? (
              <MapPin className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              index + 1
            )}
          </div>
        </div>
        
        {/* Content card */}
        <div className="flex-1 pb-6">
          <div 
            className={cn(
              "bg-card rounded-2xl p-4 md:p-5 border border-border/50",
              "hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300",
              isFirst && "ring-1 ring-accent/20"
            )}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateX(0)' : 'translateX(20px)',
              transition: 'opacity 0.5s ease-out 0.15s, transform 0.5s ease-out 0.15s'
            }}
          >
            {/* Stop header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {isFirst && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {language === 'gr' ? 'Αναχώρηση' : 'Start'}
                    </Badge>
                  )}
                  {isLast && (
                    <Badge className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20">
                      {language === 'gr' ? 'Τέλος' : 'End'}
                    </Badge>
                  )}
                </div>
                <h4 className="font-semibold text-base md:text-lg">{stop.name}</h4>
              </div>
              
              {/* Duration badge */}
              {stop.stop_minutes && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  <span>~{stop.stop_minutes} min</span>
                </div>
              )}
            </div>
            
            {/* Note */}
            {stop.note && (
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {stop.note}
              </p>
            )}
          </div>
          
          {/* Expand/Collapse button - only on first stop */}
          {isFirst && totalStops > 1 && (
            <button
              onClick={isRevealed ? handleCollapseClick : handleRevealClick}
              className="flex flex-col items-center mt-4 text-muted-foreground hover:text-accent transition-colors cursor-pointer group/reveal w-full"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease-out 0.5s'
              }}
            >
              <span className="text-xs mb-1 group-hover/reveal:text-accent transition-colors">
                {isRevealed 
                  ? (language === 'gr' ? 'Απόκρυψη προγράμματος' : 'Hide itinerary')
                  : (language === 'gr' ? 'Πάτα για να δεις το πρόγραμμα' : 'Tap to explore itinerary')
                }
              </span>
              <div className="flex flex-col items-center">
                {isRevealed ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 animate-bounce" style={{ animationDelay: '0s' }} />
                    <ChevronDown className="w-5 h-5 -mt-3 animate-bounce opacity-60" style={{ animationDelay: '0.1s' }} />
                  </>
                )}
              </div>
              {!isRevealed && (
                <span className="text-[10px] mt-1 opacity-60">
                  {totalStops - 1} {language === 'gr' ? 'ακόμη στάσεις' : 'more stops'}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
