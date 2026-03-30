import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 16,
  className,
}: StarRatingProps) {
  const clampedRating = Math.max(0, Math.min(rating, maxRating));
  const fullStars = Math.floor(clampedRating);
  const remainder = clampedRating % 1;
  const hasHalfStar = remainder >= 0.25 && remainder < 0.75;
  const hasFullStar = remainder >= 0.75;
  const actualFullStars = fullStars + (hasFullStar ? 1 : 0);
  const emptyStars = maxRating - actualFullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: actualFullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className="fill-yellow-400 text-yellow-400"
          size={size}
        />
      ))}
      {hasHalfStar && (
        <div className="relative inline-block" style={{ width: size, height: size }}>
          <Star
            className="fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700 absolute inset-0"
            size={size}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: size / 2 }}
          >
            <Star
              className="fill-yellow-400 text-yellow-400"
              size={size}
            />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
          size={size}
        />
      ))}
      <span className="ml-1 text-xs text-slate-600 dark:text-slate-400">
        {clampedRating.toFixed(1)}
      </span>
    </div>
  );
}
