import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

const StarsRating = ({ rating, onRatingChange, readonly = false, size = 24 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) setHoverRating(value);
  };

  const handleMouseLeave = () => {
    if (!readonly) setHoverRating(0);
  };

  return (
    <div className="stars-rating" style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.div
          key={star}
          whileHover={{ scale: readonly ? 1 : 1.15 }}
          whileTap={{ scale: readonly ? 1 : 0.9 }}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: readonly ? 'default' : 'pointer' }}
        >
          <Star
            size={size}
            fill={(hoverRating || rating) >= star ? '#ffc107' : 'none'}
            color="#ffc107"
            strokeWidth={1.5}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default StarsRating;