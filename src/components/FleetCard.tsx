import { Users, Briefcase, Wifi, Snowflake } from "lucide-react";
import LazyImage from "./LazyImage";

interface FleetCardProps {
  name: string;
  category: string;
  passengers: number;
  luggage: number;
  image: string;
  features: string[];
  imageClassName?: string;
}

const FleetCard = ({ name, category, passengers, luggage, image, features, imageClassName }: FleetCardProps) => {
  return (
    <article className="group glass-card overflow-hidden hover-lift">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <LazyImage
          src={image}
          alt={`${name} - ${category} vehicle for ${passengers} passengers`}
          className={`transition-transform duration-500 motion-reduce:transition-none group-hover:scale-105 motion-reduce:group-hover:scale-100 ${imageClassName || ""}`}
          placeholderClassName="h-52"
          aspectRatio="auto"
        />
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-black text-slate-950 mb-3 tracking-tight">{name}</h3>
        
        {/* Capacity */}
        <div className="flex items-center gap-6 mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span><span className="sr-only">Capacity: </span>{passengers} Passengers</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Briefcase className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <span><span className="sr-only">Luggage: </span>{luggage} Bags</span>
          </div>
        </div>

        {/* Features */}
        <ul className="flex flex-wrap gap-2 list-none" aria-label="Vehicle features">
          {features.includes("wifi") && (
            <li className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
              <Wifi className="w-3 h-3" aria-hidden="true" />
              <span>WiFi</span>
            </li>
          )}
          {features.includes("ac") && (
            <li className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
              <Snowflake className="w-3 h-3" aria-hidden="true" />
              <span>A/C</span>
            </li>
          )}
          {features.map((f) => 
            !["wifi", "ac"].includes(f) && (
              <li key={f} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg capitalize">
                {f}
              </li>
            )
          )}
        </ul>
      </div>
    </article>
  );
};

export default FleetCard;
