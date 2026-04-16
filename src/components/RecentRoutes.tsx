import { Clock, ArrowRight, X } from "lucide-react";
import { useRecentRoutes, RecentRoute } from "@/hooks/useSmartBooking";
import { trackEvent } from "@/lib/tracking";
import { cn } from "@/lib/utils";

interface RecentRoutesProps {
  onRouteSelect: (pickup: string, dropoff: string) => void;
  className?: string;
}

const RecentRoutes = ({ onRouteSelect, className }: RecentRoutesProps) => {
  const { recentRoutes, clearRecentRoutes } = useRecentRoutes();

  if (recentRoutes.length === 0) return null;

  const handleRouteClick = (route: RecentRoute) => {
    trackEvent('recent_route_click' as any, { 
      pickup: route.pickup, 
      dropoff: route.dropoff 
    });
    onRouteSelect(route.pickup, route.dropoff);
  };

  // Truncate long location names for mobile
  const truncate = (str: string, max: number = 18) => {
    if (str.length <= max) return str;
    return str.slice(0, max) + '...';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          Recent routes
        </p>
        <button
          type="button"
          onClick={clearRecentRoutes}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {recentRoutes.slice(0, 3).map((route, index) => (
          <button
            key={`${route.pickup}-${route.dropoff}-${index}`}
            type="button"
            onClick={() => handleRouteClick(route)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 hover:bg-muted rounded-full text-xs font-medium text-foreground transition-colors group"
          >
            <span className="truncate max-w-[80px] md:max-w-[120px]">
              {truncate(route.pickup, 12)}
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate max-w-[80px] md:max-w-[120px]">
              {truncate(route.dropoff, 12)}
            </span>
          </button>
        ))}
      </div>
      
      <p className="text-[10px] text-muted-foreground">
        Saved on this device for faster booking.
      </p>
    </div>
  );
};

export default RecentRoutes;
