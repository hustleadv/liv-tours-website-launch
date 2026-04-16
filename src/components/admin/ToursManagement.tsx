import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Upload, 
  Loader2, 
  Map, 
  Compass, 
  RefreshCw,
  ArrowRightLeft,
  MapPin,
  Clock
} from "lucide-react";
import { useAllTours, useUpdateTour, useDeleteTour, useCreateTour } from "@/hooks/useTours";
import { Tour, REGION_OPTIONS, TourStatus } from "@/lib/toursTypes";
import { trackEvent } from "@/lib/tracking";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RoutesAdmin from "@/components/admin/RoutesAdmin";
import LocationAliasesAdmin from "@/components/admin/LocationAliasesAdmin";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const ToursManagement = () => {
  const navigate = useNavigate();
  const { data: tours = [], isLoading, refetch } = useAllTours();
  const updateTour = useUpdateTour();
  const deleteTour = useDeleteTour();
  const createTour = useCreateTour();
  
  const [activeTab, setActiveTab] = useState("tours");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TourStatus | "all">("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      const matchesSearch = !search || 
        tour.title.toLowerCase().includes(search.toLowerCase()) ||
        tour.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      const matchesStatus = statusFilter === "all" || tour.status === statusFilter;
      const matchesRegion = regionFilter === "all" || tour.region === regionFilter;
      const matchesType = typeFilter === "all" || tour.tour_type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesRegion && matchesType;
    });
  }, [tours, search, statusFilter, regionFilter, typeFilter]);

  const handlePublish = async (tour: Tour) => {
    const newStatus = tour.status === 'published' ? 'draft' : 'published';
    await updateTour.mutateAsync({ id: tour.id, status: newStatus });
    trackEvent(newStatus === 'published' ? 'admin_tour_publish' : 'admin_tour_unpublish', { tourId: tour.id });
  };

  const handleDuplicate = async (tour: Tour) => {
    const { id, created_at, updated_at, ...rest } = tour;
    await createTour.mutateAsync({
      ...rest,
      title: `${tour.title} (Copy)`,
      slug: `${tour.slug}-copy-${Date.now()}`,
      status: 'draft',
    });
  };

  const handleDelete = async (tour: Tour) => {
    if (window.confirm(`Delete "${tour.title}"? This cannot be undone.`)) {
      await deleteTour.mutateAsync(tour.id);
    }
  };

  const handleRegenerateDescriptions = async () => {
    if (!window.confirm('Αναδημιουργία κειμένων για όλες τις εκδρομές; Μπορεί να πάρει 1-2 λεπτά.')) return;
    setIsRegenerating(true);
    toast({ title: "Regenerating...", description: "Παρακαλώ περιμένετε..." });
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-tour-descriptions', { body: {} });
      if (error) throw error;
      toast({ title: "Ολοκληρώθηκε!", description: `${data.success}/${data.total} εκδρομές ενημερώθηκαν` });
      refetch();
    } catch (error: any) {
      toast({ title: "Σφάλμα", description: error.message, variant: "destructive" });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="p-0 border-none bg-transparent shadow-none">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 bg-slate-50/50 p-6 rounded-[32px] border border-slate-100">
           <TabsList className="bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto h-auto min-w-[300px]">
             <TabsTrigger value="tours" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg">
               <Compass className="w-4 h-4" />
               Εκδρομές
             </TabsTrigger>
             <TabsTrigger value="routes" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg">
               <Map className="w-4 h-4" />
               Διαδρομές
             </TabsTrigger>
             <TabsTrigger value="aliases" className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-lg">
               <ArrowRightLeft className="w-4 h-4" />
               Aliases
             </TabsTrigger>
           </TabsList>

           <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={handleRegenerateDescriptions}
                disabled={isRegenerating}
                className="h-11 rounded-2xl border-slate-200 font-bold bg-white"
              >
                {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">AI Regenerate</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/tours/import')}
                className="h-11 rounded-2xl border-slate-200 font-bold bg-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Import</span>
              </Button>
              <Button 
                onClick={() => navigate('/admin/tours/new')}
                className="h-11 rounded-2xl bg-slate-900 text-white font-black shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Νέα Εκδρομή
              </Button>
           </div>
        </div>

        <TabsContent value="tours" className="animate-in fade-in duration-500">
           {/* Filters */}
           <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <Input
                  placeholder="Αναζήτηση βάσει τίτλου ή tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-14 h-14 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-400 transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                 <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TourStatus | "all")}>
                    <SelectTrigger className="w-[120px] h-14 rounded-2xl border-slate-50 bg-slate-50 font-black text-[10px] uppercase tracking-widest">
                       <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100">
                       <SelectItem value="all">ΟΛΑ</SelectItem>
                       <SelectItem value="draft">DRAFT</SelectItem>
                       <SelectItem value="published">PUBLISHED</SelectItem>
                    </SelectContent>
                 </Select>

                 <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[120px] h-14 rounded-2xl border-slate-50 bg-slate-50 font-black text-[10px] uppercase tracking-widest">
                       <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100">
                       <SelectItem value="all">ΟΛΑ</SelectItem>
                       <SelectItem value="private">PRIVATE</SelectItem>
                       <SelectItem value="shared">SHARED</SelectItem>
                    </SelectContent>
                 </Select>

                 <Select value={regionFilter} onValueChange={setRegionFilter}>
                   <SelectTrigger className="w-[130px] h-14 rounded-2xl border-slate-50 bg-slate-50 font-black text-[10px] uppercase tracking-widest">
                     <SelectValue placeholder="Region" />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl border-slate-100">
                     <SelectItem value="all">Όλη η Κρήτη</SelectItem>
                     {REGION_OPTIONS.map(region => (
                       <SelectItem key={region} value={region}>{region}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
           </div>

           {/* Grid Layout */}
           {isLoading ? (
             <div className="py-40 flex flex-col items-center gap-6 animate-pulse">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
                   <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Φόρτωση Εκδρομών...</p>
             </div>
           ) : filteredTours.length === 0 ? (
             <div className="py-40 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
                   <Compass className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Δεν βρέθηκαν εκδρομές</h3>
                <p className="text-sm text-slate-400 font-bold">Δοκιμάστε διαφορετικά φίλτρα ή αναζήτηση.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
                {filteredTours.map((tour) => (
                  <Card 
                    key={tour.id} 
                    className="group rounded-[40px] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 flex flex-col bg-white"
                  >
                    {/* Thumbnail & Badges */}
                    <div className="relative aspect-[16/10] overflow-hidden group-hover:scale-[1.02] transition-transform duration-700">
                      {tour.images?.cover_url ? (
                        <img 
                          src={tour.images.cover_url} 
                          alt={tour.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                           <Map className="w-12 h-12 text-slate-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60" />
                      
                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <div className={cn(
                          "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg",
                          tour.status === 'published' 
                            ? "bg-emerald-500/90 text-white border-emerald-400" 
                            : "bg-slate-900/80 text-slate-300 border-slate-700"
                        )}>
                          {tour.status}
                        </div>
                      </div>

                      {/* Region & More Button */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/30">
                            <MapPin className="w-3.5 h-3.5" />
                            {tour.region}
                         </div>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <Button size="icon" className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white hover:text-slate-900 transition-all">
                                  <MoreHorizontal className="w-5 h-5" />
                               </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 p-2 shadow-2xl w-[220px]">
                               <DropdownMenuItem onClick={() => navigate(`/admin/tours/${tour.id}/edit`)} className="rounded-xl px-4 py-3 font-bold text-slate-600 cursor-pointer">
                                  <Edit className="w-4 h-4 mr-3" /> Επεξεργασία
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleDuplicate(tour)} className="rounded-xl px-4 py-3 font-bold text-slate-600 cursor-pointer">
                                  <Copy className="w-4 h-4 mr-3" /> Αντίγραφο
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handlePublish(tour)} className="rounded-xl px-4 py-3 font-bold text-slate-600 cursor-pointer border-t border-slate-50 mt-1 pt-3">
                                  {tour.status === 'published' ? <EyeOff className="w-4 h-4 mr-3" /> : <Eye className="w-4 h-4 mr-3" />}
                                  {tour.status === 'published' ? 'Unpublish' : 'Publish'}
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleDelete(tour)} className="rounded-xl px-4 py-3 font-bold text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer">
                                  <Trash2 className="w-4 h-4 mr-3" /> Διαγραφή
                               </DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-1 flex flex-col">
                       <div className="mb-4">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">{tour.category}</p>
                          <h4 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">{tour.title}</h4>
                       </div>

                       <div className="flex items-center gap-6 mt-auto pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                             <Clock className="w-4 h-4 text-slate-300" />
                             <span className="text-xs font-black text-slate-500">{tour.duration_hours}h • {tour.time_type}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                             {tour.tags.slice(0, 2).map(tag => (
                               <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded-md text-[9px] font-bold uppercase tracking-wider">
                                  {tag}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Footer Action */}
                    <div className="px-8 pb-8">
                       <Button 
                          onClick={() => navigate(`/admin/tours/${tour.id}/edit`)}
                          className="w-full h-12 rounded-2xl bg-slate-50 text-slate-900 font-black hover:bg-slate-900 hover:text-white transition-all shadow-none border-none"
                       >
                          Διαχείριση Περιεχομένου
                       </Button>
                    </div>
                  </Card>
                ))}
             </div>
           )}
        </TabsContent>

        <TabsContent value="routes" className="animate-in fade-in duration-500">
           <Card className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 overflow-hidden">
             <RoutesAdmin />
           </Card>
        </TabsContent>

        <TabsContent value="aliases" className="animate-in fade-in duration-500">
           <Card className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 overflow-hidden">
             <LocationAliasesAdmin />
           </Card>
        </TabsContent>
      </Tabs>
    </Card>

  );
};
