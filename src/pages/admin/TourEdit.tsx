import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Sparkles, Plus, X, GripVertical, Loader2, Image as ImageIcon } from "lucide-react";
import { useTourById, useCreateTour, useUpdateTour } from "@/hooks/useTours";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  Tour,
  TourStop,
  TAG_BIBLE,
  REGION_OPTIONS,
  CATEGORY_OPTIONS,
  TIME_TYPE_OPTIONS,
  DIFFICULTY_OPTIONS,
  WALKING_LEVEL_OPTIONS,
  BEST_FOR_OPTIONS,
  WEATHER_FIT_OPTIONS,
  SEASONALITY_OPTIONS,
  TOUR_TYPE_OPTIONS,
  generateSlug,
} from "@/lib/toursTypes";
import { trackEvent } from "@/lib/tracking";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TourEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id || id === 'new';
  
  const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();
  const { data: existingTour, isLoading: isLoadingTour } = useTourById(id || '');
  const createTour = useCreateTour();
  const updateTour = useUpdateTour();

  const [formData, setFormData] = useState<Partial<Tour>>({
    status: 'draft',
    title: '',
    slug: '',
    region: 'Chania',
    category: 'Beach',
    duration_hours: 4,
    time_type: 'Half day',
    difficulty: 'Easy',
    walking_level: 'Low',
    best_for: [],
    price_from_eur: null,
    includes: [],
    highlights: [],
    short_teaser: '',
    description: '',
    tags: [],
    weather_fit: [],
    seasonality: ['all_year'],
    pickup_options: [],
    stops: [],
    images: { cover_url: null, gallery_urls: [] },
    popular_score: 0,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [newInclude, setNewInclude] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [newPickup, setNewPickup] = useState('');

  useEffect(() => {
    if (existingTour) {
      setFormData(existingTour);
    }
  }, [existingTour]);

  const updateField = <K extends keyof Tour>(field: K, value: Tour[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title') {
      setFormData(prev => ({ ...prev, slug: generateSlug(value as string) }));
    }
  };

  const toggleArrayItem = <T extends string>(field: keyof Tour, item: T) => {
    const arr = (formData[field] as T[]) || [];
    const newArr = arr.includes(item) 
      ? arr.filter(i => i !== item)
      : [...arr, item];
    updateField(field, newArr as any);
  };

  const addArrayItem = (field: 'includes' | 'highlights' | 'pickup_options', value: string) => {
    if (!value.trim()) return;
    const arr = (formData[field] as string[]) || [];
    updateField(field, [...arr, value.trim()]);
  };

  const removeArrayItem = (field: 'includes' | 'highlights' | 'pickup_options', index: number) => {
    const arr = (formData[field] as string[]) || [];
    updateField(field, arr.filter((_, i) => i !== index));
  };

  const addStop = () => {
    const newStop: TourStop = {
      name: '',
      lat: 35.5,
      lon: 24.0,
      stop_minutes: 30,
      note: '',
    };
    updateField('stops', [...(formData.stops || []), newStop]);
  };

  const updateStop = (index: number, updates: Partial<TourStop>) => {
    const stops = [...(formData.stops || [])];
    stops[index] = { ...stops[index], ...updates };
    updateField('stops', stops);
  };

  const removeStop = (index: number) => {
    const stops = (formData.stops || []).filter((_, i) => i !== index);
    updateField('stops', stops);
  };

  const updateCoverUrl = (url: string) => {
    const images = formData.images || { cover_url: null, gallery_urls: [] };
    updateField('images', { ...images, cover_url: url || null });
  };

  const addGalleryUrl = (url: string) => {
    if (!url.trim()) return;
    const images = formData.images || { cover_url: null, gallery_urls: [] };
    const galleryUrls = images.gallery_urls || [];
    updateField('images', { ...images, gallery_urls: [...galleryUrls, url.trim()] });
  };

  const removeGalleryUrl = (index: number) => {
    const images = formData.images || { cover_url: null, gallery_urls: [] };
    const galleryUrls = (images.gallery_urls || []).filter((_, i) => i !== index);
    updateField('images', { ...images, gallery_urls: galleryUrls });
  };

  const handleGalleryDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleGalleryDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const images = formData.images || { cover_url: null, gallery_urls: [] };
    const galleryUrls = [...(images.gallery_urls || [])];
    const draggedItem = galleryUrls[draggedIndex];
    galleryUrls.splice(draggedIndex, 1);
    galleryUrls.splice(index, 0, draggedItem);
    
    updateField('images', { ...images, gallery_urls: galleryUrls });
    setDraggedIndex(index);
  };

  const handleGalleryDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleGenerateAI = async () => {
    if (!formData.title) {
      toast({ title: "Please add a title first", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    trackEvent('admin_ai_draft_generate', { tourTitle: formData.title });

    try {
      const { data, error } = await supabase.functions.invoke('generate-tour-copy', {
        body: {
          title: formData.title,
          region: formData.region,
          category: formData.category,
          duration_hours: formData.duration_hours,
          time_type: formData.time_type,
          difficulty: formData.difficulty,
          walking_level: formData.walking_level,
          best_for: formData.best_for,
          stops: formData.stops?.map(s => s.name).filter(Boolean),
          includes: formData.includes,
          tags: formData.tags,
        },
      });

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        short_teaser: data.short_teaser || prev.short_teaser,
        description: data.description || prev.description,
        highlights: data.highlights?.length ? data.highlights : prev.highlights,
        includes: data.includes?.length ? data.includes : prev.includes,
        source_summary: data.source_summary,
      }));

      toast({ title: "AI draft generated! Review before publishing." });
    } catch (error: any) {
      toast({ title: "Error generating content", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.slug) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    try {
      if (isNew) {
        await createTour.mutateAsync(formData);
        trackEvent('admin_tour_create', { tourTitle: formData.title });
      } else {
        await updateTour.mutateAsync({ id: id!, ...formData });
        trackEvent('admin_tour_update', { tourId: id, tourTitle: formData.title });
      }
      navigate('/admin/tours');
    } catch (error) {
      // Error handled in mutation
    }
  };

  // Show loading while checking auth
  if (isAuthLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4">Checking permissions...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (!isNew && isLoadingTour) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/tours')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{isNew ? 'Create Tour' : 'Edit Tour'}</h1>
              <p className="text-muted-foreground">{formData.status === 'draft' ? 'Draft' : 'Published'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateAI} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate AI Draft
            </Button>
            <Button onClick={handleSave} disabled={createTour.isPending || updateTour.isPending}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basics */}
          <Card>
            <CardHeader>
              <CardTitle>Basics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Balos Lagoon Adventure"
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="balos-lagoon-adventure"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Region</Label>
                  <Select value={formData.region} onValueChange={(v) => updateField('region', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REGION_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => updateField('category', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Duration (hours)</Label>
                  <Input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => updateField('duration_hours', parseFloat(e.target.value) || 4)}
                  />
                </div>
                <div>
                  <Label>Time Type</Label>
                  <Select value={formData.time_type} onValueChange={(v) => updateField('time_type', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIME_TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tour Type</Label>
                  <Select value={formData.tour_type} onValueChange={(v) => updateField('tour_type', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TOUR_TYPE_OPTIONS.map(tt => <SelectItem key={tt} value={tt}>{tt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(v) => updateField('difficulty', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Walking Level</Label>
                  <Select value={formData.walking_level} onValueChange={(v) => updateField('walking_level', v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WALKING_LEVEL_OPTIONS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Price From (€)</Label>
                  <Input
                    type="number"
                    value={formData.price_from_eur || ''}
                    onChange={(e) => updateField('price_from_eur', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label>Popular Score</Label>
                  <Input
                    type="number"
                    value={formData.popular_score || 0}
                    onChange={(e) => updateField('popular_score', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label>Best For</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {BEST_FOR_OPTIONS.map(option => (
                    <Badge
                      key={option}
                      variant={formData.best_for?.includes(option) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem('best_for', option)}
                    >
                      {option}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Cover Image URL</Label>
                <Input
                  value={formData.images?.cover_url || ''}
                  onChange={(e) => updateCoverUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.images?.cover_url && (
                  <div className="mt-2 relative w-40 h-24 rounded overflow-hidden border">
                    <img 
                      src={formData.images.cover_url} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Gallery Images <span className="text-muted-foreground text-xs">(drag to reorder)</span></Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {formData.images?.gallery_urls?.map((url, i) => (
                    <div 
                      key={i} 
                      className={`relative group cursor-grab active:cursor-grabbing ${draggedIndex === i ? 'opacity-50 ring-2 ring-primary' : ''}`}
                      draggable
                      onDragStart={() => handleGalleryDragStart(i)}
                      onDragOver={(e) => handleGalleryDragOver(e, i)}
                      onDragEnd={handleGalleryDragEnd}
                    >
                      <div className="absolute top-1 left-1 bg-background/80 rounded px-1.5 py-0.5 text-xs font-medium z-10">
                        {i + 1}
                      </div>
                      <div className="aspect-video rounded overflow-hidden border">
                        <img 
                          src={url} 
                          alt={`Gallery ${i + 1}`} 
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      </div>
                      <button 
                        onClick={() => removeGalleryUrl(i)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="Paste image URL..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addGalleryUrl(newGalleryUrl);
                        setNewGalleryUrl('');
                      }
                    }}
                  />
                  <Button size="icon" variant="outline" onClick={() => {
                    addGalleryUrl(newGalleryUrl);
                    setNewGalleryUrl('');
                  }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Paste URLs from external sources or your own images
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Copy and Content */}
          <Card>
            <CardHeader>
              <CardTitle>Copy & Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Short Teaser (max 120 chars)</Label>
                <Input
                  value={formData.short_teaser || ''}
                  onChange={(e) => updateField('short_teaser', e.target.value.slice(0, 120))}
                  placeholder="A compelling one-liner..."
                  maxLength={120}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(formData.short_teaser?.length || 0)}/120
                </p>
              </div>

              <div>
                <Label>Description (max 650 chars)</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => updateField('description', e.target.value.slice(0, 650))}
                  placeholder="Detailed tour description..."
                  rows={4}
                  maxLength={650}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {(formData.description?.length || 0)}/650
                </p>
              </div>

              <div>
                <Label>Highlights</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.highlights?.map((h, i) => (
                    <Badge key={i} variant="secondary" className="pr-1">
                      {h}
                      <button onClick={() => removeArrayItem('highlights', i)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    placeholder="Add highlight..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('highlights', newHighlight);
                        setNewHighlight('');
                      }
                    }}
                  />
                  <Button size="icon" variant="outline" onClick={() => {
                    addArrayItem('highlights', newHighlight);
                    setNewHighlight('');
                  }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <Label>Includes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.includes?.map((item, i) => (
                    <Badge key={i} variant="secondary" className="pr-1">
                      {item}
                      <button onClick={() => removeArrayItem('includes', i)} className="ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newInclude}
                    onChange={(e) => setNewInclude(e.target.value)}
                    placeholder="Add inclusion..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('includes', newInclude);
                        setNewInclude('');
                      }
                    }}
                  />
                  <Button size="icon" variant="outline" onClick={() => {
                    addArrayItem('includes', newInclude);
                    setNewInclude('');
                  }}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {TAG_BIBLE.map(tag => (
                  <Badge
                    key={tag}
                    variant={formData.tags?.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem('tags', tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weather & Season */}
          <Card>
            <CardHeader>
              <CardTitle>Weather & Season</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Weather Fit</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {WEATHER_FIT_OPTIONS.map(option => (
                    <Badge
                      key={option}
                      variant={formData.weather_fit?.includes(option) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem('weather_fit', option)}
                    >
                      {option.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <Label>Seasonality</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SEASONALITY_OPTIONS.map(option => (
                    <Badge
                      key={option}
                      variant={formData.seasonality?.includes(option) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleArrayItem('seasonality', option)}
                    >
                      {option.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stops */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Itinerary Stops</CardTitle>
              <Button size="sm" variant="outline" onClick={addStop}>
                <Plus className="w-4 h-4 mr-2" />
                Add Stop
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.stops?.map((stop, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 border rounded-lg">
                    <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-grab" />
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3">
                      <Input
                        placeholder="Stop name"
                        value={stop.name}
                        onChange={(e) => updateStop(index, { name: e.target.value })}
                        className="col-span-2"
                      />
                      <Input
                        type="number"
                        placeholder="Lat"
                        value={stop.lat}
                        onChange={(e) => updateStop(index, { lat: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        type="number"
                        placeholder="Lon"
                        value={stop.lon}
                        onChange={(e) => updateStop(index, { lon: parseFloat(e.target.value) || 0 })}
                      />
                      <Input
                        type="number"
                        placeholder="Minutes"
                        value={stop.stop_minutes}
                        onChange={(e) => updateStop(index, { stop_minutes: parseInt(e.target.value) || 30 })}
                      />
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeStop(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {!formData.stops?.length && (
                  <p className="text-center py-4 text-muted-foreground">
                    No stops added. Click "Add Stop" to create the itinerary.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pickup Options */}
          <Card>
            <CardHeader>
              <CardTitle>Pickup Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {formData.pickup_options?.map((option, i) => (
                  <Badge key={i} variant="secondary" className="pr-1">
                    {option}
                    <button onClick={() => removeArrayItem('pickup_options', i)} className="ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newPickup}
                  onChange={(e) => setNewPickup(e.target.value)}
                  placeholder="e.g., Chania Town, Platanias..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addArrayItem('pickup_options', newPickup);
                      setNewPickup('');
                    }
                  }}
                />
                <Button size="icon" variant="outline" onClick={() => {
                  addArrayItem('pickup_options', newPickup);
                  setNewPickup('');
                }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Source Summary (AI) */}
          {formData.source_summary && (
            <Card>
              <CardHeader>
                <CardTitle>AI Source Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{formData.source_summary}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TourEdit;
