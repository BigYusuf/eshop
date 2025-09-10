"use client";

import Ratings from "apps/user-ui/src/ratings";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import React, { useEffect } from "react";

const ProductCard = ({
  product,
  isEvent,
}: {
  product: any;
  isEvent?: boolean;
}) => {
  const [timeLeft, setTimeLeft] = React.useState<string | null>(null);

  useEffect(() => {
    if (!isEvent || !product?.events?.endDate) return;

    const endTime = new Date(product?.events?.endDate).getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance <= 0) {
        setTimeLeft("Expired");
        clearInterval(timer);
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [product?.events, isEvent]);

  return (
    <div className="w-full min-h-[350px] h-max bg-white rounded-lg relative">
      {isEvent && (
        <div className="absolute top-2 left-2 bg-red-600 text-white font-semibold text-xs px-2 py-1 rounded">
          OFFER
        </div>
      )}
      {product?.stock <= 5 && product?.stock > 0 && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-slate-700 font-semibold text-xs px-2 py-1 rounded">
          {/* Only {product?.stock} left */}
          Limited
        </div>
      )}
      {product?.stock === 0 && (
        <div className="absolute top-2 right-2 bg-gray-400 text-white font-semibold text-xs px-2 py-1 rounded">
          Out of Stock
        </div>
      )}
      <Link
        href={`/product/${product?.slug}`}
        className="w-full h-[200px] flex items-center justify-center p-4"
      >
        <img
          src={
            product?.images && product?.images.length > 0
              ? product?.images[0]?.url
              : "https://images.unsplash.com/photo-1635405074683-96d6921a2a68.png"
          }
          alt={product?.title}
          className="w-full object-cover h-[200px] rounded-t-md mx-auto"
          width={300}
          height={300}
        />
      </Link>
      <Link
        href={`/shop/${product?.shop?.id}`}
        className="px-2 block text-blue-500 text-sm font-medium my-2"
      >
        {product.shop?.name}
      </Link>
      <Link href={`/product/${product?.slug}`} className="px-2 block">
        <h3 className="text-base text-gray-800 font-semibold mb-2 line-clamp-2">
          {product?.title}
        </h3>
      </Link>
      <div className="px-2">
        {/* rating */}
        <Ratings
          rating={product?.averageRating || 5}
          reviewCount={product?.reviewCount}
          showNumber={false}
        />

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">
              ${product?.salePrice}
            </span>

            {product?.regularPrice > product?.salePrice && (
              <span className="text-sm text-gray-400 line-through">
                ${product?.regularPrice}
              </span>
            )}
          </div>
          <span className="text-sm text-green-500 font-medium">
            {product?.totalSales || 0} sold
          </span>
        </div>
      </div>
      {isEvent && timeLeft && (
        <div className="mt-2">
          <span className="inline-block transform -translate-x-1/2 bg-orange-100 text-white text-xs px-3 py-1 rounded">
            Ends in: {timeLeft}
          </span>
        </div>
      )}
      <div className="absolute top-10 right-3 z-10 flex flex-col gap-3">
        <div className="bg-white rounded-full p-[6px] shadow-lg">
          <Heart
            size={22}
            fill={"red"}
            stroke={"red"}
            className="cursor-pointer hover:scale-110 transition-transform duration-200"
          />
        </div>
        <div className="bg-white rounded-full p-[6px] shadow-lg">
          <Eye
            size={22}
            className="cursor-pointer text-[#4b5563] hover:scale-110 transition-transform duration-200"
          />
        </div>
        <div className="bg-white rounded-full p-[6px] shadow-lg">
          <ShoppingBag
            size={22}
            className="cursor-pointer text-[#4b5563] hover:scale-110 transition-transform duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
