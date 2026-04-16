import React from 'react';
import { Map, MapPin, Sun, Sunset, Coffee } from 'lucide-react';
import { LocalGem } from '@/data/badges';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/tracking';
import { cn } from '@/lib/utils';

interface LocalGemCardProps {
  gem: LocalGem;
  isHidden?: boolean;
}

const typeIcons: Record<LocalGem['type'], React.ReactNode> = {
  food: <Coffee className="w-4 h-4" />,
  view: <Sunset className="w-4 h-4" />,
  walk: <MapPin className="w-4 h-4" />,
  beach: <Sun className="w-4 h-4" />,
  culture: <MapPin className="w-4 h-4" />,
};

const bestTimeLabels: Record<LocalGem['bestTime'], string> = {
  morning: 'Best in morning',
  afternoon: 'Best in afternoon',
  sunset: 'Best at sunset',
};

export function LocalGemCard({ gem, isHidden = false }: LocalGemCardProps) {
  const handleMapClick = () => {
    trackEvent('local_gem_maps_click', { gemId: gem.id });
    window.open(gem.mapUrl, '_blank');
  };

  return (
    <div className={cn(
      "rounded-2xl border p-4 transition-all",
      isHidden 
        ? "bg-gradient-to-br from-accent/10 to-olive/10 border-accent/30 ring-1 ring-accent/20" 
        : "bg-card border-border"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            isHidden ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
          )}>
            {typeIcons[gem.type]}
          </div>
          {isHidden && (
            <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs font-medium rounded-full">
              Hidden Gem
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {bestTimeLabels[gem.bestTime]}
        </span>
      </div>
      
      <h3 className="font-semibold text-foreground mb-1">{gem.title}</h3>
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {gem.shortDescription}
      </p>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={handleMapClick}
      >
        <Map className="w-4 h-4" />
        Open in Maps
      </Button>
    </div>
  );
}

interface LocalGemsGridProps {
  gems: LocalGem[];
  hiddenGem?: LocalGem;
}

export function LocalGemsGrid({ gems, hiddenGem }: LocalGemsGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gems.map(gem => (
          <LocalGemCard key={gem.id} gem={gem} />
        ))}
        {hiddenGem && (
          <LocalGemCard gem={hiddenGem} isHidden />
        )}
      </div>
    </div>
  );
}
