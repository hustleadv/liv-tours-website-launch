import { useState, useEffect } from "react";
import { Star, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trackEvent } from "@/lib/tracking";

const GOOGLE_REVIEW_LINK = "https://share.google/J9yQsvTvu3TpyzGLg";

const quickTags = [
  "On time",
  "Clean vehicle",
  "Friendly driver",
  "Great local tips",
  "Smooth pickup",
];

const TripHubReviewCard = () => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    trackEvent('review_card_view' as any);
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleGoogleReviewClick = () => {
    trackEvent('review_google_click' as any);
    window.open(GOOGLE_REVIEW_LINK, '_blank');
    setShowThankYou(true);
  };

  const handleLIVReviewClick = () => {
    // Could integrate with internal review system
    console.log('LIV Review:', { rating, reviewText, selectedTags });
  };

  if (showThankYou) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-accent" />
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">
          Thank you. Safe travels.
        </h3>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-primary mb-1">
          Share your vibe
        </h3>
        <p className="text-sm text-muted-foreground">
          15 seconds. Helps other travelers book with confidence.
        </p>
      </div>

      {/* Star Rating */}
      <div className="flex items-center gap-1 mb-5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none"
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                star <= (hoveredRating || rating)
                  ? "fill-accent text-accent"
                  : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Review Text */}
      <Textarea
        placeholder="What did you love most"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        className="mb-4 min-h-[80px] resize-none"
        maxLength={500}
      />

      {/* Quick Tags */}
      <div className="flex flex-wrap gap-2 mb-5">
        {quickTags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedTags.includes(tag)
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Micro Text */}
      <p className="text-xs text-muted-foreground mb-5">
        If your driver made your day easier, mention their name. It means a lot.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="hero"
          size="lg"
          className="flex-1"
          onClick={handleGoogleReviewClick}
        >
          Leave a review on Google
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={handleLIVReviewClick}
        >
          Leave a review on LIV
        </Button>
      </div>
    </div>
  );
};

export default TripHubReviewCard;
