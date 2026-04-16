import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, X, ArrowRightLeft, Lightbulb, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationAlias {
  id: string;
  alias: string;
  canonical_name: string;
  location_type: 'dropoff' | 'pickup';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SuggestedLocation {
  name: string;
  type: 'dropoff' | 'pickup';
  hasAlias: boolean;
}

export default function LocationAliasesAdmin() {
  const [aliases, setAliases] = useState<LocationAlias[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newAlias, setNewAlias] = useState({
    alias: '',
    canonical_name: '',
    location_type: 'dropoff' as 'dropoff' | 'pickup',
  });

  // Fetch aliases and suggestions
  useEffect(() => {
    fetchAliases();
    fetchSuggestions();

    // Realtime subscription
    const channel = supabase
      .channel('location-aliases-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'location_aliases' },
        () => {
          fetchAliases();
          fetchSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAliases = async () => {
    const { data, error } = await supabase
      .from('location_aliases')
      .select('*')
      .order('canonical_name')
      .order('alias');

    if (error) {
      console.error('Error fetching aliases:', error);
      toast({
        title: 'Error',
        description: 'Failed to load aliases',
        variant: 'destructive',
      });
    } else {
      setAliases(data as LocationAlias[]);
    }
    setIsLoading(false);
  };

  const fetchSuggestions = async () => {
    // Get unique dropoff names and pickup zones from fixed_prices
    const { data: pricesData, error } = await supabase
      .from('fixed_prices')
      .select('dropoff_name, pickup_zone');

    if (error) {
      console.error('Error fetching prices for suggestions:', error);
      return;
    }

    // Get existing aliases
    const { data: aliasData } = await supabase
      .from('location_aliases')
      .select('canonical_name, location_type');

    const existingAliases = new Set(
      (aliasData || []).map(a => `${a.canonical_name.toLowerCase()}-${a.location_type}`)
    );

    // Extract unique locations
    const dropoffs = [...new Set(pricesData?.map(p => p.dropoff_name) || [])];
    const pickups = [...new Set(pricesData?.map(p => p.pickup_zone) || [])];

    const allSuggestions: SuggestedLocation[] = [
      ...dropoffs.map(name => ({
        name,
        type: 'dropoff' as const,
        hasAlias: existingAliases.has(`${name.toLowerCase()}-dropoff`),
      })),
      ...pickups.map(name => ({
        name,
        type: 'pickup' as const,
        hasAlias: existingAliases.has(`${name.toLowerCase()}-pickup`),
      })),
    ];

    // Sort: without aliases first
    allSuggestions.sort((a, b) => {
      if (a.hasAlias !== b.hasAlias) return a.hasAlias ? 1 : -1;
      return a.name.localeCompare(b.name);
    });

    setSuggestions(allSuggestions);
  };

  const handleAdd = async () => {
    if (!newAlias.alias.trim() || !newAlias.canonical_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('location_aliases').insert({
      alias: newAlias.alias.toLowerCase().trim(),
      canonical_name: newAlias.canonical_name.trim(),
      location_type: newAlias.location_type,
    });

    if (error) {
      console.error('Error adding alias:', error);
      toast({
        title: 'Error',
        description: error.message.includes('duplicate')
          ? 'This alias already exists'
          : 'Failed to add alias',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Success', description: 'Alias added successfully' });
      setNewAlias({ alias: '', canonical_name: '', location_type: 'dropoff' });
      setIsAdding(false);
    }
  };

  const handleQuickAdd = async (location: SuggestedLocation, aliasText: string) => {
    if (!aliasText.trim()) return;

    const { error } = await supabase.from('location_aliases').insert({
      alias: aliasText.toLowerCase().trim(),
      canonical_name: location.name,
      location_type: location.type,
    });

    if (error) {
      console.error('Error adding alias:', error);
      toast({
        title: 'Error',
        description: error.message.includes('duplicate')
          ? 'This alias already exists'
          : 'Failed to add alias',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Added', description: `Alias for ${location.name}` });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('location_aliases')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting alias:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete alias',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Deleted', description: 'Alias removed' });
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('location_aliases')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) {
      console.error('Error updating alias:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alias',
        variant: 'destructive',
      });
    }
  };

  // Group aliases by canonical_name
  const groupedAliases = aliases.reduce((acc, alias) => {
    const key = alias.canonical_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(alias);
    return acc;
  }, {} as Record<string, LocationAlias[]>);

  const locationsWithoutAliases = suggestions.filter(s => !s.hasAlias);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Location Aliases</h2>
          <p className="text-sm text-muted-foreground">
            Manage location name mappings for price lookups
          </p>
        </div>
        <div className="flex gap-2">
          {locationsWithoutAliases.length > 0 && (
            <Button
              onClick={() => setShowSuggestions(!showSuggestions)}
              variant={showSuggestions ? 'secondary' : 'outline'}
              size="sm"
            >
              <Lightbulb className="w-4 h-4 mr-1" />
              Suggestions ({locationsWithoutAliases.length})
            </Button>
          )}
          <Button
            onClick={() => setIsAdding(!isAdding)}
            variant={isAdding ? 'outline' : 'default'}
            size="sm"
          >
            {isAdding ? (
              <>
                <X className="w-4 h-4 mr-1" /> Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" /> Add Alias
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestions && locationsWithoutAliases.length > 0 && (
        <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Lightbulb className="w-4 h-4" />
            <span className="font-medium text-sm">
              {locationsWithoutAliases.length} locations without aliases
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {locationsWithoutAliases.slice(0, 12).map((location) => (
              <SuggestionCard
                key={`${location.name}-${location.type}`}
                location={location}
                onAdd={handleQuickAdd}
              />
            ))}
          </div>
          {locationsWithoutAliases.length > 12 && (
            <p className="text-xs text-muted-foreground">
              +{locationsWithoutAliases.length - 12} more locations...
            </p>
          )}
        </div>
      )}

      {/* Add New Alias Form */}
      {isAdding && (
        <div className="p-4 rounded-lg border border-border bg-muted/50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm">User Types (alias)</Label>
              <Input
                placeholder="e.g., chania old town"
                value={newAlias.alias}
                onChange={(e) =>
                  setNewAlias({ ...newAlias, alias: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="flex items-end justify-center pb-2">
              <ArrowRightLeft className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-sm">Maps To (database name)</Label>
              <Input
                placeholder="e.g., Chania City"
                value={newAlias.canonical_name}
                onChange={(e) =>
                  setNewAlias({ ...newAlias, canonical_name: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">Type</Label>
              <Select
                value={newAlias.location_type}
                onValueChange={(v) =>
                  setNewAlias({
                    ...newAlias,
                    location_type: v as 'dropoff' | 'pickup',
                  })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dropoff">Dropoff</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAdd} size="sm">
            <Save className="w-4 h-4 mr-1" /> Save Alias
          </Button>
        </div>
      )}

      {/* Aliases Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Types (alias)</TableHead>
              <TableHead>Maps To</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aliases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No aliases configured yet
                </TableCell>
              </TableRow>
            ) : (
              aliases.map((alias) => (
                <TableRow
                  key={alias.id}
                  className={cn(!alias.is_active && 'opacity-50')}
                >
                  <TableCell className="font-mono text-sm">{alias.alias}</TableCell>
                  <TableCell className="font-medium">{alias.canonical_name}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        alias.location_type === 'dropoff'
                          ? 'bg-olive/20 text-olive-foreground'
                          : 'bg-accent/20 text-accent'
                      )}
                    >
                      {alias.location_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => handleToggleActive(alias.id, alias.is_active)}
                      className={cn(
                        'w-10 h-5 rounded-full transition-colors relative',
                        alias.is_active ? 'bg-accent' : 'bg-muted'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                          alias.is_active ? 'left-5' : 'left-0.5'
                        )}
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(alias.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        {Object.keys(groupedAliases).length} destinations with {aliases.length} total aliases
      </div>
    </div>
  );
}

// Suggestion Card Component
function SuggestionCard({
  location,
  onAdd,
}: {
  location: SuggestedLocation;
  onAdd: (location: SuggestedLocation, alias: string) => void;
}) {
  const [alias, setAlias] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  const handleSubmit = () => {
    if (alias.trim()) {
      onAdd(location, alias);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
      setAlias('');
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-background border">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{location.name}</div>
        <span
          className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            location.type === 'dropoff'
              ? 'bg-olive/20 text-olive-foreground'
              : 'bg-accent/20 text-accent'
          )}
        >
          {location.type}
        </span>
      </div>
      <Input
        placeholder="Add alias..."
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="w-28 h-7 text-xs"
      />
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        onClick={handleSubmit}
        disabled={!alias.trim() || isAdded}
      >
        {isAdded ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : (
          <Plus className="w-3 h-3" />
        )}
      </Button>
    </div>
  );
}
