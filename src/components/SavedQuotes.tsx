import { Bookmark, ArrowRight, MessageCircle, X, MapPin, Clock, Users, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSavedQuotes, SavedQuote } from "@/hooks/useSmartBooking";
import { trackEvent } from "@/lib/tracking";
import { generateWhatsAppLink } from "@/lib/tracking";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface SavedQuotesProps {
  onResumeQuote: (quote: SavedQuote) => void;
  className?: string;
  variant?: 'compact' | 'full';
}

const SavedQuotes = ({ onResumeQuote, className, variant = 'full' }: SavedQuotesProps) => {
  const { savedQuotes, removeQuote, clearSavedQuotes } = useSavedQuotes();

  if (savedQuotes.length === 0) return null;

  const handleResume = (quote: SavedQuote) => {
    trackEvent('quote_resume_click' as any);
    onResumeQuote(quote);
  };

  const handleWhatsApp = (quote: SavedQuote) => {
    const extras: string[] = [];
    if (quote.childSeat) extras.push('Child seat');
    if (quote.extraStop) extras.push('Extra stop');
    if (quote.meetGreet) extras.push('Meet & Greet');
    
    const link = generateWhatsAppLink({
      pickup: quote.pickup,
      dropoff: quote.dropoff,
      date: quote.date,
      time: quote.time,
      passengers: quote.passengers,
      luggage: quote.luggage,
      vehicleType: quote.vehicleType,
      extras,
    });
    window.open(link, '_blank');
  };

  const vehicleLabels: Record<string, string> = {
    taxi: 'Sedan',
    minibus: 'Minibus',
  };

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-accent" />
            Saved Quotes
          </p>
          <button
            type="button"
            onClick={clearSavedQuotes}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear all
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {savedQuotes.map((quote) => (
            <button
              key={quote.id}
              type="button"
              onClick={() => handleResume(quote)}
              className="flex items-center gap-2 px-3 py-2 bg-accent/10 hover:bg-accent/20 rounded-xl text-xs font-medium text-foreground transition-colors border border-accent/20"
            >
              <MapPin className="w-3.5 h-3.5 text-accent" />
              <span className="truncate max-w-[150px]">{quote.pickup}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground" />
              <span className="truncate max-w-[150px]">{quote.dropoff}</span>
            </button>
          ))}
        </div>
        
        <p className="text-[10px] text-muted-foreground">
          Saved on this device for faster booking.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-accent" />
          Saved Quotes
        </h3>
        <button
          type="button"
          onClick={clearSavedQuotes}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {savedQuotes.map((quote) => (
          <div
            key={quote.id}
            className="glass-card p-4 relative group"
          >
            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeQuote(quote.id)}
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-muted/50 hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
            </button>
            
            {/* Route */}
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{quote.pickup}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ArrowRight className="w-3 h-3" />
                  <span className="truncate">{quote.dropoff}</span>
                </div>
              </div>
            </div>
            
            {/* Details */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              {quote.date && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {quote.date}
                </span>
              )}
              {quote.passengers && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {quote.passengers}
                </span>
              )}
              {quote.vehicleType && (
                <span className="flex items-center gap-1">
                  <Car className="w-3.5 h-3.5" />
                  {vehicleLabels[quote.vehicleType] || quote.vehicleType}
                </span>
              )}
            </div>
            
            {/* Time saved */}
            <p className="text-[10px] text-muted-foreground mb-3">
              Saved {formatDistanceToNow(quote.savedAt, { addSuffix: true })}
            </p>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="flex-1 text-xs"
                onClick={() => handleResume(quote)}
              >
                Resume Booking
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="whatsapp"
                className="px-3"
                onClick={() => handleWhatsApp(quote)}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        Saved on this device for faster booking.
      </p>
    </div>
  );
};

export default SavedQuotes;
