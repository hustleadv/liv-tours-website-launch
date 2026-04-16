import { Skeleton } from "@/components/ui/skeleton";

const TourDetailSkeleton = () => {
  return (
    <div className="animate-fade-in">
      {/* Hero Skeleton */}
      <section className="relative h-[60vh] md:h-[70vh] lg:h-[75vh] overflow-hidden bg-muted">
        <Skeleton className="absolute inset-0 rounded-none" />
        
        {/* Back Button Skeleton */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>

        {/* Hero Content Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="container-wide pb-8 md:pb-12">
            {/* Badges */}
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Title */}
            <Skeleton className="h-10 md:h-14 lg:h-16 w-3/4 max-w-2xl mb-4 rounded-lg" />

            {/* Teaser */}
            <Skeleton className="h-5 md:h-6 w-full max-w-xl mb-6 rounded-lg" />

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              <Skeleton className="h-5 w-16 rounded-lg" />
              <Skeleton className="h-5 w-20 rounded-lg" />
              <Skeleton className="h-5 w-24 rounded-lg" />
              <Skeleton className="h-5 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Mobile CTA Skeleton */}
      <div className="lg:hidden sticky top-[64px] z-40 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container-wide py-3 flex items-center justify-between gap-4">
          <div>
            <Skeleton className="h-6 w-16 mb-1 rounded-lg" />
            <Skeleton className="h-3 w-12 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container-wide">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-10 md:space-y-12">
              
              {/* Quick Facts Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl p-4 md:p-5 border border-border/50 text-center">
                    <Skeleton className="w-6 h-6 md:w-7 md:h-7 mx-auto mb-2 rounded-full" />
                    <Skeleton className="h-3 w-14 mx-auto mb-2 rounded-lg" />
                    <Skeleton className="h-4 w-16 mx-auto rounded-lg" />
                  </div>
                ))}
              </div>

              {/* Weather Skeleton */}
              <div className="bg-accent/10 rounded-2xl p-4 md:p-6 border border-accent/20">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-5 w-40 rounded-lg" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>

              {/* Description Skeleton */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="w-1 h-6 rounded-full" />
                  <Skeleton className="h-7 w-40 rounded-lg" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4 rounded-lg" />
                  <Skeleton className="h-4 w-5/6 rounded-lg" />
                </div>
              </div>

              {/* Highlights Skeleton */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Skeleton className="w-1 h-6 rounded-full" />
                  <Skeleton className="h-7 w-36 rounded-lg" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 md:p-4 bg-card rounded-xl border border-border/50">
                      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                      <Skeleton className="h-4 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Includes Skeleton */}
              <div className="bg-card rounded-2xl p-5 md:p-8 border border-border/50">
                <Skeleton className="h-7 w-40 mb-6 rounded-lg" />
                <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="w-6 h-6 rounded-full flex-shrink-0" />
                      <Skeleton className="h-4 w-3/4 rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary Skeleton */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Skeleton className="w-1 h-6 rounded-full" />
                  <Skeleton className="h-7 w-32 rounded-lg" />
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 md:gap-6">
                      <div className="flex flex-col items-center">
                        <Skeleton className="w-10 h-10 md:w-12 md:h-12 rounded-full" />
                        {i < 2 && <Skeleton className="w-0.5 flex-1 min-h-[60px] mt-2" />}
                      </div>
                      <div className="flex-1 bg-card rounded-xl p-4 md:p-5 border border-border/50 mb-4">
                        <Skeleton className="h-5 w-40 mb-2 rounded-lg" />
                        <Skeleton className="h-4 w-24 mb-2 rounded-lg" />
                        <Skeleton className="h-4 w-28 rounded-lg" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery Skeleton */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Skeleton className="w-1 h-6 rounded-full" />
                  <Skeleton className="h-7 w-36 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar Skeleton (Desktop) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Booking Card Skeleton */}
                <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-lg">
                  <div className="mb-6 pb-6 border-b border-border/50">
                    <Skeleton className="h-4 w-24 mb-2 rounded-lg" />
                    <Skeleton className="h-10 w-20 mb-1 rounded-lg" />
                    <Skeleton className="h-4 w-16 rounded-lg" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                  <Skeleton className="h-3 w-48 mx-auto mt-4 rounded-lg" />
                </div>

                {/* Trust Section Skeleton */}
                <div className="bg-card rounded-2xl p-6 border border-border/50">
                  <Skeleton className="h-5 w-36 mb-4 rounded-lg" />
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-24 mb-1 rounded-lg" />
                          <Skeleton className="h-3 w-full rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pickup Options Skeleton */}
                <div className="bg-card rounded-2xl p-6 border border-border/50">
                  <Skeleton className="h-5 w-44 mb-3 rounded-lg" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Skeleton */}
      <section className="py-12 md:py-16 lg:py-20 bg-muted/30">
        <div className="container-wide max-w-2xl">
          <div className="text-center mb-8 md:mb-10">
            <Skeleton className="h-6 w-32 mx-auto mb-4 rounded-full" />
            <Skeleton className="h-9 w-48 mx-auto mb-3 rounded-lg" />
            <Skeleton className="h-5 w-72 mx-auto rounded-lg" />
          </div>
          
          <div className="bg-card rounded-2xl p-6 md:p-8 lg:p-10 border border-border/50 shadow-lg space-y-6">
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-lg" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36 rounded-lg" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-4 w-80 mx-auto rounded-lg" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default TourDetailSkeleton;
