import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Clock, MapPin, Users, ArrowRight, Sparkles, X, Lightbulb, Palmtree, Mountain, Landmark, UtensilsCrossed, Baby, Compass, Map, HelpCircle, Star } from "lucide-react";
import { differenceInDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import TrustBar from "@/components/TrustBar";
import PageHero from "@/components/PageHero";
import FinalCTABlock from "@/components/FinalCTABlock";
import { usePublishedTours } from "@/hooks/useTours";
import { useTourFunFactsBatch } from "@/hooks/useTourFunFactsBatch";
import { Tour, REGION_OPTIONS, CATEGORY_OPTIONS, TIME_TYPE_OPTIONS, WALKING_LEVEL_OPTIONS, WEATHER_FIT_OPTIONS } from "@/lib/toursTypes";
import { trackEvent } from "@/lib/tracking";
import { useLanguage } from "@/contexts/LanguageContext";
import toursHeroImage from "@/assets/tours-hero-new2.jpg";

const TourCard = ({ tour, funFact }: { tour: Tour; funFact?: string }) => {
  const navigate = useNavigate();
  const isNew = differenceInDays(new Date(), new Date(tour.created_at)) <= 30;
  const isPopular = (tour.popular_score || 0) >= 80;
  
  // Truncate fun fact for card display (max 80 chars)
  const truncatedFunFact = funFact && funFact.length > 80 
    ? funFact.substring(0, 77) + '...' 
    : funFact;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group bg-card rounded-3xl border border-border/50 shadow-sm hover:border-accent/40 transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
      onClick={() => {
        trackEvent('tour_card_view', { tourId: tour.id, tourTitle: tour.title });
        navigate(`/tours/${tour.slug}`);
      }}
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {tour.images.cover_url ? (
          <img 
            src={tour.images.cover_url} 
            alt={tour.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Sparkles className="w-10 h-10 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Bottom info on image */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-2">
            {/* Subtle status indicators */}
            {isPopular && (
              <span className="text-xs font-medium text-amber-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Popular
              </span>
            )}
            {isNew && (
              <span className="text-xs font-medium text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                New
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-white line-clamp-2 leading-tight">
            {tour.title}
          </h3>
        </div>
        
        {/* Top subtle tags */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="px-2.5 py-1 text-xs font-medium bg-white/90 backdrop-blur-sm text-foreground rounded-full">
            {tour.region}
          </span>
          <span className="px-2.5 py-1 text-xs font-medium bg-black/40 backdrop-blur-sm text-white rounded-full">
            {tour.time_type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Fun Fact teaser - show if available, otherwise show short_teaser */}
        {truncatedFunFact ? (
          <div className="flex items-start gap-2 mb-4 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed line-clamp-2">
              {truncatedFunFact}
            </p>
          </div>
        ) : tour.short_teaser ? (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {tour.short_teaser}
          </p>
        ) : null}

        {/* Quick Info - minimal style */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {tour.duration_hours} hours
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {tour.category}
          </span>
          {tour.best_for.length > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {tour.best_for[0]}
              </span>
            </>
          )}
        </div>

        {/* Tags - minimal pills */}
        {tour.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tour.tags.slice(0, 3).map(tag => (
              <span 
                key={tag} 
                className="text-xs px-2 py-0.5 bg-muted/60 text-muted-foreground rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions - cleaner design */}
        <div className="flex gap-2 pt-3">
          <Button 
            variant="ghost" 
            className="flex-1 h-9 text-sm hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tours/${tour.slug}`);
            }}
          >
            Details
          </Button>
          <Button 
            variant="default" 
            className="flex-1 h-9 text-sm"
            onClick={(e) => {
              e.stopPropagation();
              trackEvent('tour_book_click', { tourId: tour.id, tourTitle: tour.title });
              navigate(`/tours/${tour.slug}#booking`);
            }}
          >
            Book Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const ToursBrowse = ({ tourType }: { tourType?: 'private' | 'shared' }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { data: tours = [], isLoading } = usePublishedTours();
  
  // Batch fetch fun facts for all tours
  const tourSlugs = useMemo(() => tours.map(t => t.slug), [tours]);
  const { funFacts } = useTourFunFactsBatch(tourSlugs);
  
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [timeTypeFilter, setTimeTypeFilter] = useState<string>("all");
  const [walkingLevelFilter, setWalkingLevelFilter] = useState<string>("all");
  const [familyFriendly, setFamilyFriendly] = useState(false);
  const [sortBy, setSortBy] = useState<string>("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const filteredTours = useMemo(() => {
    let result = tours.filter(tour => {
      const matchesSearch = !search || 
        tour.title.toLowerCase().includes(search.toLowerCase()) ||
        tour.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
        tour.short_teaser?.toLowerCase().includes(search.toLowerCase());
      
      const matchesRegion = regionFilter === "all" || tour.region === regionFilter;
      const matchesCategory = categoryFilter === "all" || tour.category === categoryFilter;
      const matchesTimeType = timeTypeFilter === "all" || tour.time_type === timeTypeFilter;
      const matchesWalking = walkingLevelFilter === "all" || tour.walking_level === walkingLevelFilter;
      const matchesFamily = !familyFriendly || tour.best_for.includes('Families');
      
      const matchesTourType = !tourType || tour.tour_type === tourType;
      
      return matchesSearch && matchesRegion && matchesCategory && matchesTimeType && matchesWalking && matchesFamily && matchesTourType;
    });

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => (b.popular_score || 0) - (a.popular_score || 0));
        break;
      case 'shortest':
        result.sort((a, b) => a.duration_hours - b.duration_hours);
        break;
      case 'price':
        result.sort((a, b) => (a.price_from_eur || 999) - (b.price_from_eur || 999));
        break;
      default:
        // Recommended: mix of popular score and variety
        result.sort((a, b) => (b.popular_score || 0) - (a.popular_score || 0));
    }

    return result;
  }, [tours, search, regionFilter, categoryFilter, timeTypeFilter, walkingLevelFilter, familyFriendly, sortBy]);

  const activeFiltersCount = [
    regionFilter !== "all",
    categoryFilter !== "all",
    timeTypeFilter !== "all",
    walkingLevelFilter !== "all",
    familyFriendly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setRegionFilter("all");
    setCategoryFilter("all");
    setTimeTypeFilter("all");
    setWalkingLevelFilter("all");
    setFamilyFriendly(false);
  };

  return (
    <Layout>
      <SEOHead
        title={tourType === 'private' ? "Luxury Private Tours in Chania & Crete | LIV Tours" : "Premium Group & Shared Tours in Crete | LIV Tours"}
        description={tourType === 'private' 
          ? "Discover the hidden gems of Crete with our exclusive private tours. From Balos and Elafonisi to food tours and cultural experiences, travel in luxury and privacy." 
          : "Join our boutique shared tours and explore the best of Crete with a small group of like-minded travelers. Professional guides and premium transportation included."}
        keywords="private tours Crete, luxury transfers Chania, boutique tours Chania, Balos private tour, Elafonisi private tour, Crete excursion"
        canonicalUrl={tourType === 'private' ? "https://livtours.gr/tours/private" : "https://livtours.gr/tours/shared"}
      />

      <PageHero
        label={tourType === 'private' ? "Exclusive Experiences" : "Boutique Group Travel"}
        title={tourType === 'private' ? "Private" : "Boutique"}
        titleAccent={tourType === 'private' ? "Experiences & Tours" : "Shared Tours"}
        subtitle={tourType === 'private' 
          ? "Tailor-made itineraries designed for discerning travelers. Explore Crete's most iconic landscapes and hidden treasures in total privacy and comfort."
          : "High-end group experiences with a focus on intimacy and local depth. Perfect for solo travelers and couples looking for premium shared journeys."}
        image={toursHeroImage}
        icon={Map}
        overlay="dark"
        serifAccent
      >
        <div className="flex flex-col items-center gap-8 mt-6">
          {/* Trust Badge - Homepage Style */}
          <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-accent fill-accent" />
              ))}
            </div>
            <div className="w-px h-5 bg-white/20" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white">5.0 on Google Chania</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="hero"
              size="lg"
              className="shadow-xl px-8"
              onClick={() => {
                trackEvent('tour_quiz_start');
                navigate('/quiz');
              }}
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              Take the Tour Quiz
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm px-8"
              onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Browse All {tourType === 'private' ? 'Private' : 'Shared'} Tours
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </PageHero>

      <div className="bg-background">
        <TrustBar />
      </div>

      {/* Main Tours Section */}
      <section className="section-padding" id="explore">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center mb-16 px-4">
            <div className="section-subheading">Curated Selection</div>
            <h2 className="section-heading text-balance mx-auto">
              Find Your Perfect <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Crete Excursion</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              From the pink sands of Elafonisi to the rugged beauty of the White Mountains, 
              our {tourType === 'private' ? 'private' : 'shared'} tours are crafted to provide a deep connection with the local culture and landscape.
            </p>
          </div>

          {/* Category Filter Chips - Premium Style with horizontal scroll on mobile */}
          <div className="relative mb-6">
            {/* Fade gradient hints - only visible on mobile */}
            <div className="absolute left-0 top-0 bottom-2 w-6 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none md:hidden" />
            <div className="absolute right-0 top-0 bottom-2 w-6 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none md:hidden" />
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-6 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`shrink-0 group px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border ${
                  categoryFilter === "all"
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:shadow-md"
                }`}
              >
                <span className="flex items-center gap-1.5 md:gap-2">
                  <Sparkles className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${categoryFilter === "all" ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`} />
                  All
                </span>
              </button>
              {CATEGORY_OPTIONS.map((category) => {
                const CategoryIcon = {
                  Beach: Palmtree,
                  Nature: Mountain,
                  Culture: Landmark,
                  Food: UtensilsCrossed,
                  Family: Baby,
                  Adventure: Compass,
                }[category] || Sparkles;
                
                const isActive = categoryFilter === category;
                
                return (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(isActive ? "all" : category)}
                    className={`shrink-0 group px-4 py-2 md:px-5 md:py-2.5 rounded-lg text-sm font-medium transition-all duration-300 border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-card border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:shadow-md"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 md:gap-2">
                      <CategoryIcon className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary"}`} />
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tours by name, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={showFilters ? "default" : "outline"} 
                onClick={() => setShowFilters(!showFilters)}
                className="h-12"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 bg-accent text-accent-foreground">{activeFiltersCount}</Badge>
                )}
              </Button>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="shortest">Shortest Time</SelectItem>
                  <SelectItem value="price">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expanded Filters - Premium Style */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: "auto", opacity: 1, marginBottom: 32 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden bg-card border border-border/60 rounded-xl md:rounded-2xl shadow-lg"
              >
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 md:mb-5">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <Filter className="w-4 h-4 text-primary" />
                      Refine Results
                    </h3>
                    {activeFiltersCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground h-8 text-xs md:text-sm"
                      >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  
                  {/* Mobile: 2x2 grid + full width toggle | Desktop: 5 columns */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4">
                    {/* Region */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Region</label>
                      <Select value={regionFilter} onValueChange={setRegionFilter}>
                        <SelectTrigger className="w-full h-10 md:h-11 text-sm bg-background border-border/60 hover:border-primary/40 transition-colors">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Regions</SelectItem>
                          {REGION_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full h-10 md:h-11 text-sm bg-background border-border/60 hover:border-primary/40 transition-colors">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Duration */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</label>
                      <Select value={timeTypeFilter} onValueChange={setTimeTypeFilter}>
                        <SelectTrigger className="w-full h-10 md:h-11 text-sm bg-background border-border/60 hover:border-primary/40 transition-colors">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Duration</SelectItem>
                          {TIME_TYPE_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Walking Level */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Activity</label>
                      <Select value={walkingLevelFilter} onValueChange={setWalkingLevelFilter}>
                        <SelectTrigger className="w-full h-10 md:h-11 text-sm bg-background border-border/60 hover:border-primary/40 transition-colors">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Any Level</SelectItem>
                          {WALKING_LEVEL_OPTIONS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Family Friendly Toggle - Full width on mobile */}
                    <div className="col-span-2 md:col-span-1 space-y-1.5">
                      <label className="text-[10px] md:text-xs font-medium text-muted-foreground uppercase tracking-wider">Group Type</label>
                      <div 
                        className={`flex items-center gap-2 md:gap-3 h-10 md:h-11 px-3 md:px-4 rounded-lg border transition-all cursor-pointer ${
                          familyFriendly 
                            ? 'bg-primary/10 border-primary/40 text-primary' 
                            : 'bg-background border-border/60 hover:border-primary/40 text-muted-foreground'
                        }`}
                        onClick={() => setFamilyFriendly(!familyFriendly)}
                      >
                        <Baby className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium truncate">Family Friendly</span>
                        <Switch 
                          id="family-filter" 
                          checked={familyFriendly}
                          onCheckedChange={setFamilyFriendly}
                          className="ml-auto shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            {isLoading ? 'Loading...' : `${filteredTours.length} tours found`}
          </p>

          {/* Tours Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="aspect-[16/10] bg-muted animate-pulse relative" />
                  <div className="p-5 space-y-4">
                    <div className="h-6 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-10 bg-muted animate-pulse rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No tours found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your filters or take our quiz for personalized recommendations.</p>
              <Button onClick={() => navigate('/quiz')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Take the Quiz
              </Button>
            </div>
          ) : (
            <div className="relative">
              {/* Background Depth Elements */}
              <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
              
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredTours.map((tour, index) => (
                    <motion.div
                      layout
                      key={tour.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                    >
                      <TourCard 
                        tour={tour} 
                        funFact={funFacts[tour.slug]?.funFact}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      <FinalCTABlock 
        title="Not sure which tour is right for you?"
        subtitle="Take our quick quiz and get personalized recommendations based on your preferences."
        badge="Tour Finder"
        badgeIcon={Compass}
        primaryButtonText="Start the Quiz"
        primaryButtonLink="/quiz"
        whatsappMessage="Hi! I'm browsing your tours and I'd like some help choosing one."
      />
    </Layout>
  );
};

export default ToursBrowse;
