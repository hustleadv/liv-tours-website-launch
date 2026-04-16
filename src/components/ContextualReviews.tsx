import { Link } from 'react-router-dom';
import { Star, ArrowRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  getContextualReviews, 
  getMixedBestReviews, 
  getReviewStats,
  type ReviewCategory 
} from '@/data/reviews';
import { trackEvent } from '@/lib/tracking';
import { useEffect } from 'react';

interface ContextualReviewsProps {
  category?: ReviewCategory;
  routeTag?: string;
  limit?: number;
  showCTA?: boolean;
  variant?: 'default' | 'compact';
  title?: string;
  onGetQuote?: () => void;
}

const ContextualReviews = ({
  category,
  routeTag,
  limit = 3,
  showCTA = true,
  variant = 'default',
  title = "What Travelers Say",
  onGetQuote,
}: ContextualReviewsProps) => {
  const reviews = category || routeTag 
    ? getContextualReviews(category, routeTag, limit)
    : getMixedBestReviews(limit);
  
  const stats = getReviewStats();

  useEffect(() => {
    trackEvent('reviews_view', { 
      source: category || routeTag || 'mixed' 
    });
  }, [category, routeTag]);

  const handleGetQuote = () => {
    if (onGetQuote) {
      onGetQuote();
    } else {
      const quoteSection = document.getElementById('quote-section');
      if (quoteSection) {
        quoteSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  if (variant === 'compact') {
    return (
      <div className="glass-card p-6">
        {/* Rating Summary */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <span className="text-sm font-medium text-primary">
            {stats.averageRating}/5 from {stats.totalReviews}+ reviews
          </span>
        </div>
        
        {/* Single review preview */}
        <div className="relative">
          <Quote className="absolute -top-1 -left-1 w-6 h-6 text-olive/20" />
          <p className="text-sm text-muted-foreground leading-relaxed pl-4">
            "{reviews[0]?.text}"
          </p>
          <p className="text-xs text-muted-foreground mt-2 pl-4">
            — {reviews[0]?.name}, {reviews[0]?.country}
          </p>
        </div>
        
        <Link to="/reviews" className="inline-flex items-center gap-1 text-sm text-accent font-medium mt-4 hover:gap-2 transition-all">
          Read all reviews <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        {/* Header - Only shows if title is provided */}
        {title && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              {/* Rating Summary Chip */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-olive/10 dark:bg-olive/20 rounded-full mb-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-olive fill-olive" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-semibold text-olive dark:text-olive-light">
                  {stats.averageRating}/5 · {stats.totalReviews}+ reviews
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary tracking-tight">{title}</h2>
            </div>
            {showCTA && (
              <Link to="/reviews" className="self-start sm:self-auto">
                <Button variant="outline" size="sm" className="text-sm">
                  All Reviews
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Reviews Grid - Masonry-like visual logic */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {reviews.map((review, index) => (
            <div 
              key={review.id} 
              className={`
                group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-200/60 dark:border-slate-800 shadow-sm
                hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-2 transition-all duration-500 flex flex-col
                ${index % 3 === 1 ? 'lg:translate-y-6' : ''}
              `}
            >
              {/* Reviewer Meta Top */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-bold text-lg border-2 border-white dark:border-slate-800 shadow-sm">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-primary leading-none mb-1 text-sm md:text-base">{review.name}</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight">{review.country}</p>
                </div>
              </div>

              {/* Stars & Rating */}
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-accent fill-accent" />
                ))}
              </div>
              
              {/* Content */}
              <div className="relative mb-8 flex-grow">
                <Quote className="absolute -top-4 -left-3 w-10 h-10 text-accent/5 rotate-180" />
                <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 italic leading-relaxed font-serif">
                  "{review.text}"
                </p>
              </div>
              
              {/* Bottom Tag */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Verified Client</span>
                </div>
                {review.routeTag && (
                  <span className="text-[11px] font-bold text-accent bg-accent/5 px-3 py-1 rounded-full border border-accent/10">
                    {review.routeTag.split('→')[0].trim()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        {showCTA && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Button onClick={handleGetQuote} size="lg" className="w-full sm:w-auto">
              Get Quote
              <ArrowRight className="w-4 h-4" />
            </Button>
            <span className="text-xs text-muted-foreground">Instant confirmation</span>
          </div>
        )}
    </div>
  );
};

export default ContextualReviews;
