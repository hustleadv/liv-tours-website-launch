import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  Car, 
  Users, 
  Bus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getFixedPrices, FixedPrice, REGIONS } from "@/lib/fixedPrices";
import { Skeleton } from "@/components/ui/skeleton";

type VehicleClassKey = '1-4' | '5-8' | '9-11' | '12-16' | '17+';

interface GroupedPrices {
  [region: string]: {
    [pickupZone: string]: {
      [destination: string]: {
        '1-4'?: FixedPrice;
        '5-8'?: FixedPrice;
        '9-11'?: FixedPrice;
        '12-16'?: FixedPrice;
        '17+'?: FixedPrice;
      };
    };
  };
}

const VEHICLE_CLASSES: { id: VehicleClassKey; label: string; passengers: string }[] = [
  { id: '1-4', label: 'E-Class', passengers: '1-4' },
  { id: '5-8', label: 'Sprinter', passengers: '5-8' },
  { id: '9-11', label: 'Sprinter', passengers: '9-11' },
  { id: '12-16', label: 'Sprinter Maxi', passengers: '12-16' },
  { id: '17+', label: 'Sprinter Maxi', passengers: '17+' },
];

const FixedPricesTable = () => {
  const [prices, setPrices] = useState<FixedPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({
    'Chania': true,
  });

  useEffect(() => {
    const loadPrices = async () => {
      const data = await getFixedPrices(true);
      setPrices(data);
      setIsLoading(false);
    };
    loadPrices();
  }, []);

  // Group prices by region > pickup zone > destination
  const groupedPrices = useMemo(() => {
    const grouped: GroupedPrices = {};
    
    prices.forEach(price => {
      if (!grouped[price.region]) {
        grouped[price.region] = {};
      }
      if (!grouped[price.region][price.pickup_zone]) {
        grouped[price.region][price.pickup_zone] = {};
      }
      if (!grouped[price.region][price.pickup_zone][price.dropoff_name]) {
        grouped[price.region][price.pickup_zone][price.dropoff_name] = {};
      }
      
      const vehicleKey = price.vehicle_class as VehicleClassKey;
      if (VEHICLE_CLASSES.some(vc => vc.id === vehicleKey)) {
        grouped[price.region][price.pickup_zone][price.dropoff_name][vehicleKey] = price;
      }
    });
    
    return grouped;
  }, [prices]);

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [region]: !prev[region],
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-card rounded-2xl border border-border p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (prices.length === 0) {
    return null;
  }

  // Order regions
  const orderedRegions = REGIONS.filter(r => groupedPrices[r]);

  return (
    <div className="space-y-6">
      {orderedRegions.map(region => (
        <Collapsible
          key={region}
          open={expandedRegions[region]}
          onOpenChange={() => toggleRegion(region)}
        >
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <CollapsibleTrigger className="w-full p-5 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-primary">{region} Region</h3>
                  <p className="text-sm text-muted-foreground">
                    {Object.keys(groupedPrices[region] || {}).length} pickup zones
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="hidden sm:flex">
                  {Object.values(groupedPrices[region] || {}).reduce(
                    (acc, zone) => acc + Object.keys(zone).length, 0
                  )} destinations
                </Badge>
                {expandedRegions[region] ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="border-t border-border">
                {Object.entries(groupedPrices[region] || {}).map(([pickupZone, destinations]) => (
                  <div key={pickupZone} className="border-b border-border last:border-b-0">
                    <div className="px-5 py-3 bg-muted/30">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <span className="text-accent">From</span> {pickupZone}
                      </h4>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[180px]">Destination</TableHead>
                            {VEHICLE_CLASSES.map(vc => (
                              <TableHead key={vc.id} className="text-center min-w-[80px]">
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-xs font-medium text-foreground">{vc.label}</span>
                                  <span className="text-[10px] text-muted-foreground">{vc.passengers} pax</span>
                                </div>
                              </TableHead>
                            ))}
                            <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(destinations)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([destination, vehiclePrices]) => (
                              <TableRow key={destination}>
                                <TableCell className="font-medium">{destination}</TableCell>
                                {VEHICLE_CLASSES.map(vc => (
                                  <TableCell key={vc.id} className="text-center">
                                    {vehiclePrices[vc.id] ? (
                                      <span className="font-semibold text-primary">
                                        €{vehiclePrices[vc.id]!.fixed_price_eur.toFixed(0)}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">—</span>
                                    )}
                                  </TableCell>
                                ))}
                                <TableCell>
                                  <Link 
                                    to={`/?pickup=${encodeURIComponent(pickupZone)}&dropoff=${encodeURIComponent(destination)}`}
                                  >
                                    <Button variant="ghost" size="sm" className="gap-1">
                                      Book
                                      <ArrowRight className="w-3 h-3" />
                                    </Button>
                                  </Link>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  );
};

export default FixedPricesTable;
