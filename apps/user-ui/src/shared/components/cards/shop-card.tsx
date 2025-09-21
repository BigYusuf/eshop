import { ArrowUpRight, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const ShopCard = ({ shop }: { shop: any }) => {
  return (
    <div className="w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden transition">
      {/* Cover */}
      <div className="relative w-full h-[120px] ">
        <Image
          src={
            shop?.banner?.url ||
            "https://ik.imagekit.io/bigyusuf/shop/banner/christiann-koepke-WiE01mC9AtY-unsplash.jpg?updatedAt=1758474349365"
          }
          alt="Cover"
          fill
          className="w-full object-cover h-full"
        />
      </div>

      <div className="relative flex justify-center -mt-8 items-center">
        <div className="h-16 w-16 rounded-full border-4 border-white overflow-hidden shadow">
          <Image
            src={
              shop.avatar?.url ||
              "https://ik.imagekit.io/bigyusuf/shop/avatar/yusuf1.jpg?updatedAt=1758474272745"
            }
            alt={shop.name}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
      </div>
      {/* Info */}
      <div className="px-4 pb-4 pt-2 text-center">
        <h3 className="text-base font-semibold text-gray-800">{shop?.name}</h3>
        <p className="text-xs mt-0.5 text-gray-500">
          {shop?.followerCount || 0} Followers
        </p>

        {/* Address + Rating */}
        <div className="flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap">
          {shop?.address && (
            <span className="flex items-center gap-1 max-w-[120px]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{shop?.address}</span>
            </span>
          )}
          <span className="flex gap-1 items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            {shop?.rating ?? "N/A"}
          </span>
        </div>
        {/* Category */}
        {shop?.category && (
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            <span className="bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {shop?.category}
            </span>
          </div>
        )}

        {/* Visit Button  */}
        <div className="mt-4">
          <Link
            href={`/shop/${shop?.id}`}
            className="inline-flex items-center text-sm text-blue-600 transition hover:text-blue-700 font-medium hover:underline "
          >
            Visit Shop
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;
