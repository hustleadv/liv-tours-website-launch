import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Save, Loader2, Plane, Anchor, MapPin, Plus, Trash2, Download, Check } from "lucide-react";
import { toast } from "sonner";
import SwipeableRow from "./SwipeableRow";

interface FixedPrice {
  id: string;
  region: string;
  pickup_zone: string;
  dropoff_name: string;
  vehicle_class: string;
  fixed_price_eur: number;
  passengers_min: number;
  passengers_max: number;
}

type VehicleClassKey = '1-4' | '5-8' | '9-11' | '12-16' | '17+';

interface GroupedRoute {
  key: string;
  region: string;
  pickup_zone: string;
  dropoff_name: string;
  prices: {
    '1-4'?: FixedPrice;
    '5-8'?: FixedPrice;
    '9-11'?: FixedPrice;
    '12-16'?: FixedPrice;
    '17+'?: FixedPrice;
  };
}

const REGIONS = ["Chania", "Heraklion", "Rethymno", "Lasithi"];
const PICKUP_ZONES = ["Chania Airport", "Heraklion Airport", "Souda Port", "Heraklion Port", "Chania City", "Heraklion City", "Rethymno City"];
const VEHICLE_CLASSES: { id: VehicleClassKey; label: string; passengers_min: number; passengers_max: number }[] = [
  { id: "1-4", label: "Sedan", passengers_min: 1, passengers_max: 4 },
  { id: "5-8", label: "Large", passengers_min: 5, passengers_max: 8 },
  { id: "9-11", label: "Minivan", passengers_min: 9, passengers_max: 11 },
  { id: "12-16", label: "Minibus S", passengers_min: 12, passengers_max: 16 },
  { id: "17+", label: "Minibus L", passengers_min: 17, passengers_max: 50 },
];

const PriceInput = ({ 
  route, 
  group, 
  vehicleClass,
  currentValue,
  isEdited,
  isSaving,
  justSaved,
  onInputChange,
  onFocus,
  onBlur,
  newPriceValue,
  onNewPriceChange
}: {
  route?: FixedPrice;
  group: GroupedRoute;
  vehicleClass: VehicleClassKey;
  currentValue?: string;
  isEdited?: boolean;
  isSaving?: boolean;
  justSaved?: boolean;
  onInputChange?: (value: string) => void;
  onFocus?: (id: string, element: HTMLInputElement) => void;
  onBlur?: () => void;
  newPriceValue?: number;
  onNewPriceChange?: (value: string) => void;
}) => {
  const newPriceKey = `${group.key}|${vehicleClass}`;
  
  if (route) {
    return (
      <div className="relative">
        <Input
          type="text"
          inputMode="decimal"
          value={currentValue}
          onChange={(e) => onInputChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
          onFocus={(e) => {
            onFocus?.(route.id, e.target);
          }}
          onBlur={onBlur}
          className={`w-20 h-8 text-center text-sm transition-all ${
            justSaved
              ? 'border-green-500 ring-1 ring-green-500 bg-green-50 dark:bg-green-950/30'
              : isSaving
              ? 'border-blue-500 ring-1 ring-blue-500 bg-blue-50 dark:bg-blue-950/30'
              : isEdited
              ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50 dark:bg-amber-950/30'
              : ''
          }`}
        />
        {isSaving && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
          </div>
        )}
        {justSaved && !isSaving && (
          <div className="absolute -right-1 -top-1 flex items-center justify-center animate-scale-in">
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  }
  
  const hasNewPrice = newPriceValue !== undefined;
  
  return (
    <Input
      type="text"
      inputMode="decimal"
      placeholder="—"
      value={hasNewPrice ? String(newPriceValue) : ''}
      onChange={(e) => onNewPriceChange?.(e.target.value)}
      onFocus={(e) => onFocus?.(newPriceKey, e.target)}
      onBlur={() => setTimeout(() => onBlur?.(), 50)}
      className={`w-20 h-8 text-center text-sm ${hasNewPrice ? 'border-green-500 ring-1 ring-green-500 bg-green-50 dark:bg-green-950/30' : 'border-dashed'}`}
    />
  );
};

const RoutesAdmin = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [pickupFilter, setPickupFilter] = useState<string>("all");
  const editedPricesRef = useRef<Record<string, string>>({});
  const editedCountTimerRef = useRef<number | undefined>(undefined);
  const [editedPricesCount, setEditedPricesCount] = useState(0);
  const [newPrices, setNewPrices] = useState<Record<string, number>>({});
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [focusedPriceId, setFocusedPriceId] = useState<string | null>(null);
  const [showNewRouteDialog, setShowNewRouteDialog] = useState(false);
  
  // New route form state
  const [newRoute, setNewRoute] = useState({
    region: "",
    pickup_zone: "",
    dropoff_name: "",
    price1_4: "",
    price5_8: "",
    price9_11: "",
    price12_16: "",
    price17plus: "",
  });

  const scheduleEditedCountUpdate = useCallback(() => {
    if (editedCountTimerRef.current) {
      window.clearTimeout(editedCountTimerRef.current);
    }
    editedCountTimerRef.current = window.setTimeout(() => {
      setEditedPricesCount(Object.keys(editedPricesRef.current).length);
    }, 150);
  }, []);

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['admin-fixed-prices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixed_prices')
        .select('*')
        .order('region', { ascending: true })
        .order('pickup_zone', { ascending: true })
        .order('dropoff_name', { ascending: true });
      
      if (error) throw error;
      return data as FixedPrice[];
    }
  });

  // Realtime subscription for live sync
  useEffect(() => {
    const channel = supabase
      .channel('fixed-prices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixed_prices'
        },
          () => {
            // Avoid refetching while actively editing to prevent focus/scroll jumps.
            if (focusedPriceId) return;
            if (editedPricesCount > 0) return;
            if (savingIds.size > 0) return;

            queryClient.invalidateQueries({ queryKey: ['admin-fixed-prices'] });
          }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, focusedPriceId, editedPricesCount, savingIds]);

  // Single price update mutation (for auto-save)
  const updateSinglePrice = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      setSavingIds(prev => new Set(prev).add(id));
      const { error } = await supabase
        .from('fixed_prices')
        .update({ fixed_price_eur: price, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      return { id, price };
    },
    onSuccess: ({ id }) => {
      // Remove from edited prices and saving state after successful save
      delete editedPricesRef.current[id];
      setEditedPricesCount(Object.keys(editedPricesRef.current).length);

      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      // Show success checkmark
      setSavedIds(prev => new Set(prev).add(id));
      // Hide checkmark after 1.5s
      setTimeout(() => {
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 1500);
    },
    onError: (_, { id }) => {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.error("Σφάλμα κατά την αποθήκευση");
    }
  });

  

  const bulkUpdatePrices = useMutation({
    mutationFn: async (updates: { id: string; price: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from('fixed_prices')
          .update({ fixed_price_eur: update.price, updated_at: new Date().toISOString() })
          .eq('id', update.id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fixed-prices'] });
      editedPricesRef.current = {};
      setEditedPricesCount(0);
      toast.success("Όλες οι τιμές ενημερώθηκαν");
    },
    onError: () => {
      toast.error("Σφάλμα κατά την ενημέρωση");
    }
  });

  const createRoute = useMutation({
    mutationFn: async (data: typeof newRoute) => {
      const routesToInsert = [];
      
      const priceFields: { field: keyof typeof data; vehicleClass: VehicleClassKey }[] = [
        { field: 'price1_4', vehicleClass: '1-4' },
        { field: 'price5_8', vehicleClass: '5-8' },
        { field: 'price9_11', vehicleClass: '9-11' },
        { field: 'price12_16', vehicleClass: '12-16' },
        { field: 'price17plus', vehicleClass: '17+' },
      ];

      for (const { field, vehicleClass } of priceFields) {
        if (data[field]) {
          const config = VEHICLE_CLASSES.find(v => v.id === vehicleClass)!;
          routesToInsert.push({
            region: data.region,
            pickup_zone: data.pickup_zone,
            dropoff_name: data.dropoff_name,
            vehicle_class: vehicleClass,
            fixed_price_eur: parseFloat(data[field]),
            passengers_min: config.passengers_min,
            passengers_max: config.passengers_max,
            currency: "EUR",
            is_fixed_price: true,
            tags: [],
          });
        }
      }

      if (routesToInsert.length === 0) {
        throw new Error("Πρέπει να συμπληρώσεις τουλάχιστον μία τιμή");
      }

      const { error } = await supabase
        .from('fixed_prices')
        .insert(routesToInsert);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fixed-prices'] });
      setShowNewRouteDialog(false);
      setNewRoute({
        region: "",
        pickup_zone: "",
        dropoff_name: "",
        price1_4: "",
        price5_8: "",
        price9_11: "",
        price12_16: "",
        price17plus: "",
      });
      toast.success("Η διαδρομή προστέθηκε");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Σφάλμα κατά την προσθήκη");
    }
  });

  const deleteRoute = useMutation({
    mutationFn: async (group: GroupedRoute) => {
      const idsToDelete = VEHICLE_CLASSES
        .map(vc => group.prices[vc.id]?.id)
        .filter(Boolean) as string[];

      for (const id of idsToDelete) {
        const { error } = await supabase
          .from('fixed_prices')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fixed-prices'] });
      toast.success("Η διαδρομή διαγράφηκε");
    },
    onError: () => {
      toast.error("Σφάλμα κατά τη διαγραφή");
    }
  });

  // Create a single price for an existing route
  const createSinglePrice = useMutation({
    mutationFn: async ({ group, vehicleClass, price }: { 
      group: GroupedRoute; 
      vehicleClass: VehicleClassKey; 
      price: number 
    }) => {
      const vehicleConfig = VEHICLE_CLASSES.find(v => v.id === vehicleClass)!;
      
      const { error } = await supabase
        .from('fixed_prices')
        .insert({
          region: group.region,
          pickup_zone: group.pickup_zone,
          dropoff_name: group.dropoff_name,
          vehicle_class: vehicleClass,
          fixed_price_eur: price,
          passengers_min: vehicleConfig.passengers_min,
          passengers_max: vehicleConfig.passengers_max,
          currency: "EUR",
          is_fixed_price: true,
          tags: [],
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fixed-prices'] });
      setNewPrices({});
      toast.success("Η τιμή προστέθηκε");
    },
    onError: () => {
      toast.error("Σφάλμα κατά την προσθήκη τιμής");
    }
  });

  // Group routes by destination with all vehicle types together
  const groupedRoutes = useMemo(() => {
    const groups: Record<string, GroupedRoute> = {};
    
    routes.forEach(route => {
      const key = `${route.region}-${route.pickup_zone}-${route.dropoff_name}`;
      
      if (!groups[key]) {
        groups[key] = {
          key,
          region: route.region,
          pickup_zone: route.pickup_zone,
          dropoff_name: route.dropoff_name,
          prices: {}
        };
      }
      
      // Map vehicle_class to our new keys
      const vehicleClass = route.vehicle_class as VehicleClassKey;
      if (VEHICLE_CLASSES.some(vc => vc.id === vehicleClass)) {
        groups[key].prices[vehicleClass] = route;
      }
    });
    
    return Object.values(groups);
  }, [routes]);

  const filteredGroups = useMemo(() => {
    return groupedRoutes.filter(group => {
      const matchesSearch = !search || 
        group.dropoff_name.toLowerCase().includes(search.toLowerCase()) ||
        group.region.toLowerCase().includes(search.toLowerCase());
      
      const matchesRegion = regionFilter === "all" || group.region === regionFilter;
      const matchesPickup = pickupFilter === "all" || group.pickup_zone.includes(pickupFilter);
      
      return matchesSearch && matchesRegion && matchesPickup;
    });
  }, [groupedRoutes, search, regionFilter, pickupFilter]);

  // handlePriceChange logic moved to handleLocalInputChange above

  const commitPriceChange = (id: string, value: string, originalValue: string) => {
    if (value === '' || value === originalValue) return;
    if (!/^\d+$/.test(value)) return;

    const price = parseFloat(value);
    if (!isNaN(price) && price > 0) {
      updateSinglePrice.mutate({ id, price });
    }
  };

  const handleNewPriceChange = (key: string, value: string) => {
    const price = parseFloat(value);
    if (value === '' || value === '0') {
      setNewPrices(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else if (!isNaN(price) && price >= 0) {
      setNewPrices(prev => ({ ...prev, [key]: price }));
    }
  };

  const handleSaveAll = async () => {
    // First save existing price updates (filter out empty strings and invalid values)
    const updates = Object.entries(editedPricesRef.current)
      .filter(([, priceStr]) => {
        const price = parseFloat(priceStr);
        return priceStr !== '' && !isNaN(price) && price >= 0;
      })
      .map(([id, priceStr]) => ({ id, price: parseFloat(priceStr) }));
    if (updates.length > 0) {
      await bulkUpdatePrices.mutateAsync(updates);
    }

    // Clear edited map after save-all completes
    editedPricesRef.current = {};
    setEditedPricesCount(0);
    
    // Then create new prices
    for (const [key, price] of Object.entries(newPrices)) {
      const [groupKey, vehicleClass] = key.split('|');
      const group = groupedRoutes.find(g => g.key === groupKey);
      if (group && price > 0) {
        await createSinglePrice.mutateAsync({ 
          group, 
          vehicleClass: vehicleClass as VehicleClassKey, 
          price 
        });
      }
    }
  };

  const handleCreateRoute = () => {
    if (!newRoute.region || !newRoute.pickup_zone || !newRoute.dropoff_name) {
      toast.error("Συμπλήρωσε περιοχή, σημείο παραλαβής και προορισμό");
      return;
    }
    createRoute.mutate(newRoute);
  };

  const handleDeleteRoute = (group: GroupedRoute) => {
    if (window.confirm(`Διαγραφή διαδρομής "${group.pickup_zone} → ${group.dropoff_name}";`)) {
      deleteRoute.mutate(group);
    }
  };

  const handleExportCSV = () => {
    const csvRows: string[] = [];
    // Header row
    csvRows.push(['Region', 'Pickup Zone', 'Destination', '1-4 pax (€)', '5-8 pax (€)', '9-11 pax (€)', '12+ pax (€)'].join(','));
    
    // Data rows
    groupedRoutes.forEach(group => {
      const row = [
        `"${group.region}"`,
        `"${group.pickup_zone}"`,
        `"${group.dropoff_name}"`,
        group.prices['1-4']?.fixed_price_eur ?? '',
        group.prices['5-8']?.fixed_price_eur ?? '',
        group.prices['9-11']?.fixed_price_eur ?? '',
        group.prices['12+']?.fixed_price_eur ?? '',
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `routes-prices-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Το CSV εξήχθη επιτυχώς');
  };

  const getPickupIcon = (zone: string) => {
    if (zone.includes('Airport')) return <Plane className="w-4 h-4" />;
    if (zone.includes('Port')) return <Anchor className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const hasUnsavedChanges = editedPricesCount > 0 || Object.keys(newPrices).length > 0;
  const totalChanges = editedPricesCount + Object.keys(newPrices).length;

  // Track local input values to keep inputs controlled and prevent focus loss
  const [localInputValues, setLocalInputValues] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Initialize or update local input values when routes data changes
    // This ensures the inputs reflect the latest database state unless being edited
    if (isLoading) return;

    const newValues: Record<string, string> = {};
    routes.forEach(route => {
      // If a price is being edited, keep the edited value. Otherwise, use the value from the database.
      if (editedPricesRef.current[route.id] === undefined) {
        newValues[route.id] = String(route.fixed_price_eur);
      }
    });

    // Merge with existing values to preserve inputs for routes that haven't changed
    setLocalInputValues(prev => ({ ...prev, ...newValues }));
  }, [routes, isLoading]);


  const handleLocalInputChange = useCallback((id: string, value: string, originalValue: string) => {
  // Allow empty string or valid numeric patterns
  if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
    return;
  }

  // Update local state immediately
  setLocalInputValues(prev => ({ ...prev, [id]: value }));

  // Update the ref holding edited values
  const isEditedNow = value !== originalValue && value !== '';
  if (isEditedNow) {
    editedPricesRef.current[id] = value;
  } else {
    delete editedPricesRef.current[id];
  }
  
  // Update the count
  scheduleEditedCountUpdate();

  // ΑΦΑΙΡΕΣΗ: Διέγραψε τις γραμμές με debouncedSave
  // ΔΕΝ θέλουμε auto-save πια!
}, [scheduleEditedCountUpdate]);

const handlePriceFocus = useCallback((id: string, element: HTMLInputElement) => {
  setFocusedPriceId(id);
  element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}, []);

// Save a single row's changes
const handleSaveRow = async (group: GroupedRoute) => {
  const updates: { id: string; price: number }[] = [];
  
  // Collect all edited prices for this row
  VEHICLE_CLASSES.forEach(vc => {
    const route = group.prices[vc.id];
    if (route && editedPricesRef.current[route.id]) {
      const price = parseFloat(editedPricesRef.current[route.id]);
      if (!isNaN(price) && price > 0) {
        updates.push({ id: route.id, price });
      }
    }
  });

  if (updates.length === 0) return;

  // Save all updates for this row
  try {
    for (const update of updates) {
      setSavingIds(prev => new Set(prev).add(update.id));
      await updateSinglePrice.mutateAsync(update);
    }
    
    // Clear edited state for this row
    updates.forEach(({ id }) => {
      delete editedPricesRef.current[id];
    });
    setEditedPricesCount(Object.keys(editedPricesRef.current).length);
    
    toast.success("Οι τιμές αποθηκεύτηκαν");
  } catch (error) {
    toast.error("Σφάλμα κατά την αποθήκευση");
  }
};

  return (
    <div>
      {/* Filters - Compact & Discreet */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
          <Input
            placeholder="Αναζήτηση..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm bg-muted/30 border-muted-foreground/10 focus:bg-background"
          />
        </div>
        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-auto min-w-[100px] h-8 text-xs bg-muted/30 border-muted-foreground/10">
            <SelectValue placeholder="Περιοχή" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Όλες</SelectItem>
            {REGIONS.map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={pickupFilter} onValueChange={setPickupFilter}>
          <SelectTrigger className="w-auto min-w-[100px] h-8 text-xs bg-muted/30 border-muted-foreground/10">
            <SelectValue placeholder="Σημείο" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Όλα</SelectItem>
            <SelectItem value="Airport">Airport</SelectItem>
            <SelectItem value="Port">Port</SelectItem>
            <SelectItem value="City">City</SelectItem>
          </SelectContent>
        </Select>
        
        {/* New Route Button */}
        <Dialog open={showNewRouteDialog} onOpenChange={setShowNewRouteDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Νέα Διαδρομή
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Προσθήκη Νέας Διαδρομής</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Περιοχή</Label>
                <Select value={newRoute.region} onValueChange={(v) => setNewRoute(prev => ({ ...prev, region: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε περιοχή" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Σημείο Παραλαβής</Label>
                <Select value={newRoute.pickup_zone} onValueChange={(v) => setNewRoute(prev => ({ ...prev, pickup_zone: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επιλέξτε σημείο" />
                  </SelectTrigger>
                  <SelectContent>
                    {PICKUP_ZONES.map(pz => (
                      <SelectItem key={pz} value={pz}>{pz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Προορισμός</Label>
                <Input 
                  placeholder="π.χ. Platanias" 
                  value={newRoute.dropoff_name}
                  onChange={(e) => setNewRoute(prev => ({ ...prev, dropoff_name: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {VEHICLE_CLASSES.map((vc) => (
                  <div key={vc.id} className="space-y-1">
                    <Label className="text-xs">{vc.id}</Label>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="€"
                      value={vc.id === '1-4' ? newRoute.price1_4 : 
                             vc.id === '5-8' ? newRoute.price5_8 : 
                             vc.id === '9-11' ? newRoute.price9_11 : 
                             vc.id === '12-16' ? newRoute.price12_16 :
                             newRoute.price17plus}
                      onChange={(e) => {
                        const field = vc.id === '1-4' ? 'price1_4' : 
                                      vc.id === '5-8' ? 'price5_8' : 
                                      vc.id === '9-11' ? 'price9_11' : 
                                      vc.id === '12-16' ? 'price12_16' :
                                      'price17plus';
                        setNewRoute(prev => ({ ...prev, [field]: e.target.value }));
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleCreateRoute} 
                className="w-full"
                disabled={createRoute.isPending}
              >
                {createRoute.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Προσθήκη
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
      </div>

      {/* Desktop Header */}
      <div className="hidden md:grid md:grid-cols-[2fr_1fr_80px_80px_80px_80px_80px_60px] gap-4 mb-2 px-4 text-xs font-medium text-muted-foreground">
        <div>Διαδρομή</div>
        <div>Περιοχή</div>
        {VEHICLE_CLASSES.map(vc => (
          <div key={vc.id} className="text-center">{vc.id}</div>
        ))}
        <div></div>
      </div>

      {/* Routes List */}
      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Φόρτωση διαδρομών...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Δεν βρέθηκαν διαδρομές
          </div>
        ) : (
          <div className="divide-y">
            {filteredGroups.map((group) => {
              const hasEdits = VEHICLE_CLASSES.some(
                vc => group.prices[vc.id] && editedPricesRef.current[group.prices[vc.id]!.id] !== undefined
              );
              
              return (
                <div key={group.key}>
                  {/* Mobile Layout - Swipeable */}
                  <div className="md:hidden">
                    <SwipeableRow
                      onDelete={() => handleDeleteRoute(group)}
                      className={hasEdits ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}
                    >
                      <div className={`px-4 py-3 space-y-3 ${hasEdits ? 'bg-amber-50/50 dark:bg-amber-950/10' : 'bg-background'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-muted-foreground flex-shrink-0">{getPickupIcon(group.pickup_zone)}</span>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{group.dropoff_name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                από {group.pickup_zone}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">{group.region}</Badge>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                          {VEHICLE_CLASSES.map(vc => (
                            <div key={vc.id} className="space-y-1">
                              <div className="text-xs text-center text-muted-foreground">{vc.id}</div>
                              <div className="flex justify-center">
                                <PriceInput 
                                  route={group.prices[vc.id]} 
                                  group={group} 
                                  vehicleClass={vc.id}
                                  currentValue={group.prices[vc.id] ? (localInputValues[group.prices[vc.id]!.id] ?? String(group.prices[vc.id]!.fixed_price_eur)) : undefined}
                                  isEdited={group.prices[vc.id] ? editedPricesRef.current[group.prices[vc.id]!.id] !== undefined : false}
                                  isSaving={group.prices[vc.id] ? savingIds.has(group.prices[vc.id]!.id) : false}
                                  justSaved={group.prices[vc.id] ? savedIds.has(group.prices[vc.id]!.id) : false}
                                  onInputChange={(val) => group.prices[vc.id] && handleLocalInputChange(group.prices[vc.id]!.id, val, String(group.prices[vc.id]!.fixed_price_eur))}
                                  onFocus={handlePriceFocus}
                                  onBlur={() => setFocusedPriceId(null)}
                                  newPriceValue={newPrices[`${group.key}|${vc.id}`]}
                                  onNewPriceChange={(val) => handleNewPriceChange(`${group.key}|${vc.id}`, val)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Swipe hint */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="text-[10px] text-muted-foreground/60">
                            ← Σύρε αριστερά για διαγραφή
                          </div>
                          {hasEdits && (
                            <Button 
                              size="sm" 
                              className="h-8 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                              onClick={() => handleSaveRow(group)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Αποθήκευση
                            </Button>
                          )}
                        </div>
                      </div>
                    </SwipeableRow>
                  </div>
                  
                  {/* Desktop Layout - Grid Row */}
                  <div className={`hidden md:grid md:grid-cols-[2fr_1fr_80px_80px_80px_80px_80px_60px] gap-4 px-4 py-3 items-center ${hasEdits ? 'bg-amber-50/50 dark:bg-amber-950/10' : 'hover:bg-muted/50'}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-muted-foreground">{getPickupIcon(group.pickup_zone)}</span>
                      <div className="truncate">
                        <span className="font-medium">{group.dropoff_name}</span>
                        <span className="text-muted-foreground text-sm ml-2 hidden lg:inline">
                          από {group.pickup_zone}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Badge variant="outline" className="text-xs">{group.region}</Badge>
                    </div>
                    {VEHICLE_CLASSES.map(vc => (
                      <div key={vc.id} className="flex justify-center">
                        <PriceInput 
                          route={group.prices[vc.id]} 
                          group={group} 
                          vehicleClass={vc.id}
                          currentValue={group.prices[vc.id] ? (localInputValues[group.prices[vc.id]!.id] ?? String(group.prices[vc.id]!.fixed_price_eur)) : undefined}
                          isEdited={group.prices[vc.id] ? editedPricesRef.current[group.prices[vc.id]!.id] !== undefined : false}
                          isSaving={group.prices[vc.id] ? savingIds.has(group.prices[vc.id]!.id) : false}
                          justSaved={group.prices[vc.id] ? savedIds.has(group.prices[vc.id]!.id) : false}
                          onInputChange={(val) => group.prices[vc.id] && handleLocalInputChange(group.prices[vc.id]!.id, val, String(group.prices[vc.id]!.fixed_price_eur))}
                          onFocus={handlePriceFocus}
                          onBlur={() => setFocusedPriceId(null)}
                          newPriceValue={newPrices[`${group.key}|${vc.id}`]}
                          onNewPriceChange={(val) => handleNewPriceChange(`${group.key}|${vc.id}`, val)}
                        />
                      </div>
                    ))}
                    <div className="flex justify-center gap-1">
                      {/* Save Button - Εμφανίζεται μόνο αν έχει edits */}
                      {hasEdits && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleSaveRow(group)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      {/* Delete Button */}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteRoute(group)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats & Actions */}
      <div className="flex flex-col gap-3 mt-6 pt-4 border-t border-muted-foreground/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">{filteredGroups.length} διαδρομές</span>
          <Button variant="ghost" size="sm" onClick={handleExportCSV} className="text-muted-foreground hover:text-foreground">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoutesAdmin;
