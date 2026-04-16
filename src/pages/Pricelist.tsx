import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Car, Users, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Layout from "@/components/Layout";
import PageHero from "@/components/PageHero";
import SEOHead from "@/components/SEOHead";
import FinalCTABlock from "@/components/FinalCTABlock";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuote } from "@/contexts/QuoteContext";
import {
  getFixedPrices,
  getDestinations,
  getPickupZonesForDestination,
  getVehicleClassesForRoute,
  findFixedPrice,
  type FixedPrice,
} from "@/lib/fixedPrices";
import { cn } from "@/lib/utils";

const Pricelist = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { setQuoteData } = useQuote();
  
  // Search state
  const [destinations, setDestinations] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [availableZones, setAvailableZones] = useState<string[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [foundPrice, setFoundPrice] = useState<FixedPrice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Load destinations on mount
  useEffect(() => {
    const loadDestinations = async () => {
      setIsLoading(true);
      const dests = await getDestinations();
      setDestinations(dests);
      setIsLoading(false);
    };
    loadDestinations();
  }, []);
  
  // Load zones when destination changes
  useEffect(() => {
    const loadZones = async () => {
      if (!selectedDestination) {
        setAvailableZones([]);
        setSelectedZone("");
        return;
      }
      const zones = await getPickupZonesForDestination(selectedDestination);
      setAvailableZones(zones);
      if (zones.length === 1) {
        setSelectedZone(zones[0]);
      } else {
        setSelectedZone("");
      }
    };
    loadZones();
  }, [selectedDestination]);
  
  // Load vehicle classes when zone changes
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedDestination || !selectedZone) {
        setAvailableClasses([]);
        setSelectedClass("");
        return;
      }
      const classes = await getVehicleClassesForRoute(selectedZone, selectedDestination);
      setAvailableClasses(classes);
      if (classes.length === 1) {
        setSelectedClass(classes[0]);
      } else {
        setSelectedClass("");
      }
    };
    loadClasses();
  }, [selectedDestination, selectedZone]);
  
  // Find price when all selections are made
  useEffect(() => {
    const findPrice = async () => {
      if (!selectedDestination || !selectedZone || !selectedClass) {
        setFoundPrice(null);
        return;
      }
      const price = await findFixedPrice(selectedZone, selectedDestination, selectedClass, 4);
      setFoundPrice(price);
    };
    findPrice();
  }, [selectedDestination, selectedZone, selectedClass]);
  
  // Filter destinations based on search
  const filteredDestinations = useMemo(() => {
    if (!searchQuery) return destinations;
    return destinations.filter(d => 
      d.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [destinations, searchQuery]);
  
  // Handle book route
  const handleBookRoute = () => {
    if (!foundPrice) return;
    
    // Pre-fill quote data with all required fields
    setQuoteData({
      pickup: foundPrice.pickup_zone,
      dropoff: foundPrice.dropoff_name,
      date: "",
      time: "",
      passengers: foundPrice.passengers_max.toString(),
      luggage: "medium",
      vehicleType: foundPrice.vehicle_class.toLowerCase(),
      childSeat: 0,
      extraStop: false,
      meetGreet: true,
      extraHour: false,
      coolerWaters: false,
      bookingType: 'standard',
    });
    
    navigate("/");
  };
  
  return (
    <Layout>
      <SEOHead
        title={language === 'gr' ? "Τιμοκατάλογος Ταξί και Μίνιμπας | LIV Tours" : "Taxi and Minibus Prices | LIV Tours"}
        description={language === 'gr' 
          ? "Δείτε τις σταθερές τιμές μεταφοράς για όλους τους προορισμούς στην Κρήτη. Χωρίς κρυφές χρεώσεις."
          : "View fixed transfer prices for all destinations in Crete. No hidden fees."
        }
        keywords="taxi prices Crete, minibus prices, transfer rates, Chania taxi, Heraklion taxi"
        canonicalUrl="https://livtours.gr/pricelist"
      />
      
      <PageHero
        label={language === 'gr' ? "ΣΤΑΘΕΡΕΣ ΤΙΜΕΣ" : "FIXED PRICES"}
        title={language === 'gr' ? "Τιμές Ταξί και Μίνιμπας" : "Taxi and Minibus Prices"}
        subtitle={language === 'gr' 
          ? "Αναζητήστε έναν προορισμό και δείτε αμέσως τη σταθερή τιμή"
          : "Search a destination and see the fixed price instantly"
        }
        icon={Car}
        compact={true}
      />
      
      {/* Search Section */}
      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
            {/* Destination Search */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">
                {language === 'gr' ? "Αναζήτηση Προορισμού" : "Search Destination"}
              </Label>
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={searchOpen}
                    className="w-full justify-between h-12 text-left font-normal"
                  >
                    {selectedDestination || (language === 'gr' ? "Επιλέξτε προορισμό..." : "Select destination...")}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0 pointer-events-auto" align="start">
                  <Command>
                    <CommandInput 
                      placeholder={language === 'gr' ? "Αναζήτηση..." : "Search..."} 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {isLoading 
                          ? (language === 'gr' ? "Φόρτωση..." : "Loading...")
                          : (language === 'gr' ? "Δεν βρέθηκε προορισμός" : "No destination found")
                        }
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredDestinations.map((dest) => (
                          <CommandItem
                            key={dest}
                            value={dest}
                            onSelect={() => {
                              setSelectedDestination(dest);
                              setSearchOpen(false);
                              setSearchQuery("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedDestination === dest ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {dest}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Pickup Zone */}
            {availableZones.length > 0 && (
              <div className="mb-6 animate-fade-in">
                <Label className="text-sm font-medium mb-2 block">
                  {language === 'gr' ? "Σημείο Παραλαβής" : "Pickup Zone"}
                </Label>
                {availableZones.length === 1 ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <MapPin className="w-4 h-4 text-olive" />
                    <span className="font-medium">{availableZones[0]}</span>
                  </div>
                ) : (
                  <Select value={selectedZone} onValueChange={setSelectedZone}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={language === 'gr' ? "Επιλέξτε σημείο..." : "Select zone..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableZones.map(zone => (
                        <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            
            {/* Vehicle Class Toggle - 5 Tiers */}
            {availableClasses.length > 1 && (
              <div className="mb-6 animate-fade-in">
                <Label className="text-sm font-medium mb-2 block">
                  {language === 'gr' ? "Τύπος Οχήματος" : "Vehicle Type"}
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {availableClasses.map(cls => {
                    // Map vehicle class to display label
                    const getClassLabel = (vehicleClass: string) => {
                      if (vehicleClass.includes('1-4')) return { name: 'E-Class', pax: '1-4' };
                      if (vehicleClass.includes('5-8')) return { name: 'Sprinter', pax: '5-8' };
                      if (vehicleClass.includes('9-11')) return { name: 'Sprinter', pax: '9-11' };
                      if (vehicleClass.includes('12-16')) return { name: 'Sprinter Maxi', pax: '12-16' };
                      if (vehicleClass.includes('17')) return { name: 'Sprinter Maxi', pax: '17+' };
                      return { name: vehicleClass, pax: '' };
                    };
                    const label = getClassLabel(cls);
                    
                    return (
                      <Button
                        key={cls}
                        variant={selectedClass === cls ? "default" : "outline"}
                        className="flex flex-col items-center justify-center h-auto py-3 px-2"
                        onClick={() => setSelectedClass(cls)}
                      >
                        <Car className="w-4 h-4 mb-1" />
                        <span className="text-xs font-medium">{label.name}</span>
                        <span className="text-[10px] opacity-70">{label.pax} pax</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Price Card */}
            {foundPrice && (
              <div className="bg-gradient-to-br from-olive/10 to-lime/5 rounded-2xl p-6 border border-olive/20 animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'gr' ? "Σταθερή Τιμή" : "Fixed Price"}
                    </p>
                    <p className="text-4xl font-bold text-primary">
                      €{foundPrice.fixed_price_eur.toFixed(0)}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {foundPrice.passengers_min} to {foundPrice.passengers_max} {language === 'gr' ? "επιβάτες" : "passengers"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        {foundPrice.vehicle_class}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {language === 'gr' 
                        ? "Οι τιμές είναι ανά όχημα εκτός αν αναφέρεται διαφορετικά"
                        : "Prices are per vehicle unless stated otherwise"
                      }
                    </p>
                  </div>
                  
                  <Button onClick={handleBookRoute} size="lg" className="gap-2">
                    {language === 'gr' ? "Κράτηση" : "Book this route"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {/* Empty state */}
            {!selectedDestination && !isLoading && destinations.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>
                  {language === 'gr' 
                    ? "Επιλέξτε έναν προορισμό για να δείτε τις τιμές"
                    : "Select a destination to see prices"
                  }
                </p>
              </div>
            )}
            
            {/* Loading state */}
            {isLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-3">
                  {language === 'gr' ? "Φόρτωση τιμών..." : "Loading prices..."}
                </p>
              </div>
            )}
            
            {/* No prices yet */}
            {!isLoading && destinations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  {language === 'gr' 
                    ? "Δεν υπάρχουν διαθέσιμες τιμές ακόμα"
                    : "No prices available yet"
                  }
                </p>
              </div>
            )}
          </div>
          
          {/* Trust note */}
          <div className="mt-8 text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-olive" />
                {language === 'gr' ? "Σταθερές τιμές" : "Fixed prices"}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-olive" />
                {language === 'gr' ? "Χωρίς κρυφές χρεώσεις" : "No hidden fees"}
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-olive" />
                {language === 'gr' ? "Δωρεάν ακύρωση 24ω" : "Free cancellation 24h"}
              </span>
            </div>
          </div>
        </div>
      </section>
      <FinalCTABlock 
        title={language === 'gr' ? "Έτοιμοι για Κράτηση;" : "Ready to Book?"}
        subtitle={language === 'gr' ? "Όλοι οι προορισμοί στην Κρήτη. Σταθερές τιμές, χωρίς κρυφές χρεώσεις." : "All destinations in Crete. Fixed prices, no hidden fees."}
        badge={language === 'gr' ? "Τιμοκατάλογος" : "Price List"}
        primaryButtonText={language === 'gr' ? "Λήψη Προσφοράς" : "Get Your Quote"}
        whatsappMessage="Hi! I checked your price list and I'd like to book a transfer."
      />
    </Layout>
  );
};

export default Pricelist;
