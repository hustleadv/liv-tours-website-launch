import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useImportTours } from "@/hooks/useTours";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { REGION_OPTIONS, CATEGORY_OPTIONS, TIME_TYPE_OPTIONS, generateSlug, TourRegion, TourCategory, TourTimeType } from "@/lib/toursTypes";
import { trackEvent } from "@/lib/tracking";

const ToursImport = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: isAuthLoading } = useAdminAuth();
  const importTours = useImportTours();
  
  const [titles, setTitles] = useState("");
  const [region, setRegion] = useState<TourRegion>("Chania");
  const [category, setCategory] = useState<TourCategory>("Beach");
  const [timeType, setTimeType] = useState<TourTimeType>("Half day");
  const [importedCount, setImportedCount] = useState<number | null>(null);

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

  const handleImport = async () => {
    const lines = titles.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const toursToImport = lines.map(title => ({
      title,
      slug: generateSlug(title) + '-' + Date.now(),
      region,
      category,
      time_type: timeType,
      duration_hours: timeType === 'Half day' ? 4 : 8,
      status: 'draft' as const,
      difficulty: 'Easy' as const,
      walking_level: 'Low' as const,
      best_for: [] as ('Couples' | 'Families' | 'Solo' | 'Groups')[],
      includes: [] as string[],
      highlights: [] as string[],
      tags: [] as string[],
      weather_fit: [] as ('windy_safe' | 'rainy_safe' | 'cold_day_friendly' | 'hot_day_friendly')[],
      seasonality: ['all_year'] as ('all_year' | 'Apr_to_Oct' | 'Nov_to_Mar')[],
      pickup_options: [] as string[],
      stops: [],
      images: { cover_url: null, gallery_urls: [] },
    }));

    try {
      const result = await importTours.mutateAsync(toursToImport);
      setImportedCount(result.length);
      trackEvent('admin_tour_import', { tourId: String(result.length) });
      setTitles("");
    } catch (error) {
      // Error handled in mutation
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/tours')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Import Tours</h1>
            <p className="text-muted-foreground">Bulk import tour titles from your old site</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Paste Tour Titles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tour Titles (one per line)</Label>
              <Textarea
                value={titles}
                onChange={(e) => setTitles(e.target.value)}
                placeholder="Balos Lagoon Adventure&#10;Elafonisi Pink Beach&#10;Samaria Gorge Hike&#10;..."
                rows={10}
                className="mt-2 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {titles.split('\n').filter(l => l.trim()).length} titles detected
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Default Region</Label>
                <Select value={region} onValueChange={(v) => setRegion(v as TourRegion)}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REGION_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Default Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TourCategory)}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Default Time Type</Label>
                <Select value={timeType} onValueChange={(v) => setTimeType(v as TourTimeType)}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIME_TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleImport} 
              disabled={!titles.trim() || importTours.isPending}
              className="w-full"
            >
              {importTours.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing...</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Import as Drafts</>
              )}
            </Button>

            {importedCount !== null && (
              <div className="p-4 bg-accent/10 rounded-lg text-center">
                <p className="font-medium text-accent">{importedCount} tours imported as drafts</p>
                <Button variant="link" onClick={() => navigate('/admin/tours')}>
                  View drafts →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ToursImport;
