import { Star } from "lucide-react";

interface ReviewCardProps {
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
  avatar?: string;
}

const ReviewCard = ({ name, location, rating, text, date, avatar }: ReviewCardProps) => {
  return (
    <article className="glass-card p-6 hover-lift" aria-label={`Review by ${name}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden" aria-hidden="true">
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="text-lg font-semibold text-primary">
                {name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-primary">{name}</p>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5" role="img" aria-label={`Rating: ${rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? "text-amber-400 fill-amber-400" : "text-muted"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Review Text */}
      <blockquote className="text-foreground leading-relaxed mb-4">"{text}"</blockquote>

      {/* Date */}
      <time className="text-xs text-muted-foreground">{date}</time>
    </article>
  );
};

export default ReviewCard;
