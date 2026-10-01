import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, readOnly = false, size = 'sm' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => setRating && setRating(star)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition'} p-0.5 focus:outline-none`}
        >
          <Star
            className={`${sizes[size] || sizes.sm} ${
              star <= rating
                ? 'text-amber-400 fill-amber-400'
                : 'text-slate-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;

