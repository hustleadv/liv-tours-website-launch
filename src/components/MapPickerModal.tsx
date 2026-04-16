import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Icon, LatLng } from "leaflet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Search, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import "leaflet/dist/leaflet.css";

// Custom marker icon
const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string, lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

// Component to handle map clicks
function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: LatLng | null; 
  setPosition: (pos: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
}

// Component to recenter map
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([lat, lng], 17);
  }, [lat, lng, map]);
  
  return null;
}

const MapPickerModal = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLat = 35.5138,  // Default to Chania, Crete
  initialLng = 24.0180,
}: MapPickerModalProps) => {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [address, setAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isGettingGPS, setIsGettingGPS] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: initialLat, lng: initialLng });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPosition(null);
      setAddress("");
      setSearchQuery("");
      setMapCenter({ lat: initialLat, lng: initialLng });
    }
  }, [isOpen, initialLat, initialLng]);

  // Reverse geocode when position changes
  useEffect(() => {
    if (!position) {
      setAddress("");
      return;
    }

    const reverseGeocode = async () => {
      setIsLoadingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.lat}&lon=${position.lng}&zoom=19&addressdetails=1&accept-language=en`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'LivToursApp/1.0'
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          const addr = data.address;
          
          // Build detailed address
          const parts: string[] = [];
          
          if (data.name && data.name !== addr?.road) {
            parts.push(data.name);
          }
          
          if (addr?.house_number && addr?.road) {
            parts.push(`${addr.road} ${addr.house_number}`);
          } else if (addr?.road) {
            parts.push(addr.road);
          }
          
          if (addr?.suburb || addr?.neighbourhood) {
            parts.push(addr.suburb || addr.neighbourhood);
          }
          
          const city = addr?.city || addr?.town || addr?.village;
          if (city) parts.push(city);
          
          setAddress(parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(',') || '');
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setAddress(`${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`);
      } finally {
        setIsLoadingAddress(false);
      }
    };

    reverseGeocode();
  }, [position]);

  // Get current GPS location
  const handleGetGPS = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    // Check permissions API if available
    if (navigator.permissions) {
      try {
        const permResult = await navigator.permissions.query({ name: 'geolocation' });
        if (permResult.state === 'denied') {
          toast.error("Location access is blocked", {
            description: "Enable location in your device Settings, then reload the page."
          });
          return;
        }
      } catch {
        // Not supported on Safari - continue
      }
    }

    setIsGettingGPS(true);

    const onSuccess = (pos: GeolocationPosition) => {
      const newPos = new LatLng(pos.coords.latitude, pos.coords.longitude);
      setPosition(newPos);
      setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setIsGettingGPS(false);
      toast.success("Location found!");
    };

    const onFinalError = () => {
      setIsGettingGPS(false);
      toast.error("Could not get location. Tap on the map to select your pickup point.");
    };

    const highAccuracyTimeout = setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onFinalError,
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(highAccuracyTimeout);
        onSuccess(pos);
      },
      (error) => {
        clearTimeout(highAccuracyTimeout);
        if (error.code === error.PERMISSION_DENIED) {
          setIsGettingGPS(false);
          toast.error("Location access denied", {
            description: "Enable location in your device Settings."
          });
          return;
        }
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          onFinalError,
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  // Search for location
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=gr&accept-language=en`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'LivToursApp/1.0'
          }
        }
      );

      if (response.ok) {
        const results = await response.json();
        if (results.length > 0) {
          const { lat, lon } = results[0];
          const newPos = new LatLng(parseFloat(lat), parseFloat(lon));
          setPosition(newPos);
          setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
        } else {
          toast.error("Location not found. Try a different search.");
        }
      }
    } catch (error) {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Confirm selection
  const handleConfirm = () => {
    if (position && address) {
      onSelectLocation(address, position.lat, position.lng);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Select Pickup Location
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-3">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search address or place..."
                className="pl-9"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {/* GPS button */}
          <Button
            variant="outline"
            onClick={handleGetGPS}
            disabled={isGettingGPS}
            className="w-full"
          >
            {isGettingGPS ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            Use my current location
          </Button>

          {/* Map */}
          <div className="h-[300px] rounded-lg overflow-hidden border border-border">
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
              <RecenterMap lat={mapCenter.lat} lng={mapCenter.lng} />
            </MapContainer>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Tap on the map to select your exact pickup point
          </p>

          {/* Selected address */}
          {position && (
            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground mb-1">Selected location:</p>
              {isLoadingAddress ? (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Getting address...</span>
                </div>
              ) : (
                <p className="text-sm font-medium">{address}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                GPS: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 pt-0 gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!position || !address || isLoadingAddress}
          >
            <Check className="w-4 h-4 mr-2" />
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapPickerModal;
