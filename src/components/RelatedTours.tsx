import { Link } from "react-router-dom";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePublishedTours } from "@/hooks/useTours";
import { Tour } from "@/lib/toursTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedToursProps {
  currentTourId: string;
  region: string;
  category: string;
}

const RelatedTours = ({ currentTourId, region, category }: RelatedToursProps) => {
  const { data: tours, isLoading } = usePublishedTours();

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 lg:py-20 border-t border-border/50">
        <div className="container-wide">
          <div className="text-center mb-8 md:mb-10">
            <Skeleton className="h-8 w-48 mx-auto mb-3 rounded-lg" />
            <Skeleton className="h-5 w-72 mx-auto rounded-lg" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50">
                <Skeleton className="aspect-[16/10]" />
                <div className="p-4 md:p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!tours) return null;

  // Filter related tours: same region or category, excluding current tour
  const relatedTours = tours
    .filter((tour: Tour) => 
      tour.id !== currentTourId && 
      (tour.region === region || tour.category === category)
    )
    .slice(0, 3);

  if (relatedTours.length === 0) return null;

  return (
    <section className="py-12 md:py-16 lg:py-20 border-t border-border/50">
      <div className="container-wide">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">You Might Also Like</h2>
          <p className="text-muted-foreground">Explore more tours in {region}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {relatedTours.map((tour: Tour) => (
            <Link 
              key={tour.id} 
              to={`/tours/${tour.slug}`}
              className="group bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-accent/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                {tour.images.cover_url ? (
                  <img
                    src={tour.images.cover?.url || tour.images.cover_url}
                    alt={tour.images.cover?.alt || tour.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground shadow-lg">
                  {tour.category}
                </Badge>

                {/* Duration */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white">
                  <Clock className="w-3 h-3" />
                  <span>{tour.duration_hours}h</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-5">
                <h3 className="font-semibold text-base md:text-lg mb-2 group-hover:text-accent transition-colors line-clamp-1">
                  {tour.title}
                </h3>
                
                {tour.short_teaser && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {tour.short_teaser}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{tour.region}</span>
                  </div>
                  
                  {tour.price_from_eur && (
                    <span className="font-semibold text-accent">
                      From €{tour.price_from_eur}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild className="rounded-full">
            <Link to="/tours/browse">
              View All Tours
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RelatedTours;
