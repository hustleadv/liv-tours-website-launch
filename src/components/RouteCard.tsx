import { Link } from "react-router-dom";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import LocalTip from "./LocalTip";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface RouteCardProps {
  from: string;
  to: string;
  duration: string;
  price: string;
  image: string;
  routeId?: string;
}

// Helper to create locationId from destination name
const toLocationId = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

// Determine location type based on destination name
const getLocationType = (from: string, to: string): 'beach' | 'airport' | 'port' | 'city' | 'resort' | 'general' => {
  const dest = to.toLowerCase();
  const pickup = from.toLowerCase();
  
  if (dest.includes('beach') || dest.includes('balos') || dest.includes('elafonisi')) return 'beach';
  if (dest.includes('airport') || pickup.includes('airport')) return 'airport';
  if (dest.includes('port') || pickup.includes('port')) return 'port';
  if (dest.includes('city') || dest.includes('town') || dest.includes('chania') || dest.includes('heraklion') || dest.includes('rethymno')) return 'city';
  if (dest.includes('platanias') || dest.includes('elounda') || dest.includes('hersonissos') || dest.includes('malia') || dest.includes('agia marina')) return 'resort';
  return 'general';
};

const RouteCard = ({ from, to, duration, price, image, routeId }: RouteCardProps) => {
  const locationId = routeId || toLocationId(to);
  const locationType = getLocationType(from, to);
  const { isAdmin } = useIsAdmin();

  return (
    <div className="group glass-card overflow-hidden hover-lift">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        <img
          src={image}
          alt={`${from} to ${to} transfer`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 text-sm text-primary-foreground">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">{from}</span>
            <ArrowRight className="w-4 h-4" />
            <span className="font-medium">{to}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-lg font-semibold text-primary">{price}</p>
          </div>
        </div>

        {/* AI-powered Local Tip */}
        <div className="mb-3">
          <LocalTip 
            locationId={locationId}
            locationName={to}
            locationType={locationType}
            useAI={true}
            isAdmin={isAdmin}
            compact
          />
        </div>

        <Link
          to={routeId ? `/routes/${routeId}` : "/contact"}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-muted rounded-xl text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {routeId ? "View Route" : "Book Now"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default RouteCard;
