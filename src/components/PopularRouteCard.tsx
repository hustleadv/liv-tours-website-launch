import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowRight, Plane, Palmtree, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteData } from "@/data/routes";
import { trackEvent } from "@/lib/tracking";
import { Skeleton } from "@/components/ui/skeleton";

interface PopularRouteCardProps {
  route: RouteData;
  livePrice?: number | null;
  isLoadingPrice?: boolean;
  onGetQuote: (pickup: string, dropoff: string) => void;
}

const PopularRouteCard = forwardRef<HTMLDivElement, PopularRouteCardProps>(({ route, livePrice, isLoadingPrice, onGetQuote }, ref) => {
  const navigate = useNavigate();

  const handleViewRoute = () => {
    trackEvent('route_cta_click', { 
      routeId: route.id, 
      ctaType: 'view_route',
      pickup: route.from,
      dropoff: route.to 
    });
    navigate(`/routes/${route.id}`);
  };

  const handleGetQuote = () => {
    trackEvent('route_quote_prefill', { 
      routeId: route.id,
      pickup: route.from,
      dropoff: route.to 
    });
    onGetQuote(route.from, route.to);
  };

  const getBadgeStyles = (badge?: string) => {
    switch (badge) {
      case "Most booked":
        return "bg-accent text-accent-foreground";
      case "Airport":
        return "bg-sky-100 text-sky-700";
      case "Beach":
        return "bg-emerald-100 text-emerald-700";
      case "Popular":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case "Airport":
        return <Plane className="w-3 h-3" aria-hidden="true" />;
      case "Beach":
        return <Palmtree className="w-3 h-3" aria-hidden="true" />;
      case "Most booked":
        return <Star className="w-3 h-3" aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <article ref={ref} className="group glass-card overflow-hidden hover-lift h-full flex flex-col" aria-label={`Transfer from ${route.from} to ${route.to}`}>
      {/* Header with badge */}
      <div className="p-5 pb-0 flex-1">
        {route.badge && (
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getBadgeStyles(route.badge)}`}>
              {getBadgeIcon(route.badge)}
              {route.badge}
            </span>
          </div>
        )}
        
        {/* Route name */}
        <h3 className="text-lg font-black text-slate-950 mb-1 tracking-tight">
          {route.from}
        </h3>
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
          <span className="font-bold text-slate-900">{route.to}</span>
        </div>

        {/* Duration & Price */}
        <div className="flex items-center justify-between py-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span><span className="sr-only">Duration: </span>{route.duration}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">From</p>
            {isLoadingPrice ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-xl font-black text-slate-950">
                <span className="sr-only">Price: </span>
                €{livePrice ?? route.fixedPriceFrom ?? route.price.replace('€', '')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 pt-0 space-y-2">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full"
          onClick={handleViewRoute}
          aria-label={`View route details for ${route.from} to ${route.to}`}
        >
          View Route
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleGetQuote}
          aria-label={`Get quote for ${route.from} to ${route.to}`}
        >
          Get Quote
        </Button>
      </div>
    </article>
  );
});

PopularRouteCard.displayName = "PopularRouteCard";

export default PopularRouteCard;
