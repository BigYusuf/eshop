import React from "react";

export type RatingCardProps = {
  rating: number; // e.g. 4.3
  maxStars?: number; // default 5
  size?: number; // svg size in px
  className?: string;
  reviewCount?: number; // optional (e.g. 124)
  showNumber?: boolean; // show numeric rating
};

const FilledStar = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path
      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.789 1.402 8.168L12 18.896l-7.336 3.871 1.402-8.168L.132 9.21l8.2-1.192z"
      fill="currentColor"
    />
  </svg>
);

const OutlineStar = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

// half star by layering a filled star clipped to half
const HalfStar = ({ size = 20 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    aria-hidden
  >
    <defs>
      <clipPath id="half">
        <rect x="0" y="0" width="12" height="24" />
      </clipPath>
    </defs>

    <path
      d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.789 1.402 8.168L12 18.896l-7.336 3.871 1.402-8.168L.132 9.21l8.2-1.192z"
      fill="currentColor"
      clipPath="url(#half)"
    />

    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const Ratings = ({
  rating,
  maxStars = 5,
  size = 18,
  className = "",
  reviewCount,
  showNumber = true,
}: RatingCardProps) => {
  // guard
  const safeRating = Number.isFinite(rating)
    ? Math.max(0, Math.min(rating, maxStars))
    : 0;

  // prepare star types for each position
  const stars: ("full" | "half" | "empty")[] = [];
  for (let i = 1; i <= maxStars; i++) {
    if (safeRating >= i) stars.push("full");
    else if (safeRating >= i - 0.5) stars.push("half");
    else stars.push("empty");
  }

  return (
    <div
      className={`inline-flex items-center space-x-2 text-slate-700 ${className}`}
      role="img"
      aria-label={`Rating ${safeRating} out of ${maxStars}${
        reviewCount ? ` — ${reviewCount} reviews` : ""
      }`}
    >
      <div className="flex items-center space-x-1">
        {stars.map((s, idx) => (
          <span
            key={idx}
            className={`inline-flex ${
              s === "full"
                ? "text-yellow-500"
                : s === "half"
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
            aria-hidden={true}
            title={`${
              safeRating >= idx + 1 ? "Full" : s === "half" ? "Half" : "Empty"
            } star`}
          >
            {s === "full" && <FilledStar size={size} />}
            {s === "half" && <HalfStar size={size} />}
            {s === "empty" && <OutlineStar size={size} />}
          </span>
        ))}
      </div>

      {showNumber && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{safeRating.toFixed(1)}</span>
          {typeof reviewCount === "number" && (
            <span className="text-xs text-gray-500">
              ({reviewCount} reviews)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
export default Ratings;
/*
Usage examples:

<ProductRatingCard rating={4.3} reviewCount={124} />
<ProductRatingCard rating={3.5} maxStars={5} size={20} />
<ProductRatingCard rating={0} showNumber={false} />
*/
