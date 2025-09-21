"use client";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Package,
  ShoppingCartIcon,
  WalletMinimal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import ReactImageMagnify from "react-image-magnify";

import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import Ratings from "apps/user-ui/src/ratings";
import { useStore } from "apps/user-ui/src/store";
import ProductCard from "../../components/cards/product-card";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

const ProductDetails = ({ productDetails }: { productDetails: any }) => {
  const [currentImage, setCurrentImage] = useState(
    productDetails?.images[0]?.url
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [priceRange, setPriceRange] = useState(
    productDetails?.salePrice || 1199
  );
  const [isSelectedColor, setIsSelectedColor] = useState(
    productDetails?.colors[0] || ""
  );
  const [isSelectedSize, setIsSelectedSize] = useState(
    productDetails?.sizes[0] || ""
  );
  // const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  const [timeLeft, setTimeLeft] = React.useState<string | null>(null);
  const user = useUser();
  const location = useLocationTracking();

  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state) => state.addToCart);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);

  const isInWishlist = wishlist?.some((item) => item.id === productDetails?.id);
  const isInCart = cart?.some((item) => item.id === productDetails?.id);

  // Navigate to Previous Image
  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentImage(productDetails?.images[currentIndex - 1]?.url);
    }
  };
  // Navigate to Next Image
  const nextmage = () => {
    if (currentIndex < productDetails?.images?.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImage(productDetails?.images[currentIndex + 1]?.url);
    }
  };

  const discountPercentage = Math.round(
    ((productDetails?.regularPrice - productDetails?.salePrice) /
      productDetails?.regularPrice) *
      100
  );

  const fetchFilteredProducts = async ({
    priceRange,
    categories,
    colors,
    sizes,
    page = 1,
    limit = 5,
    setRecommendedProducts,
  }: {
    priceRange: number[];
    categories?: string[] | string;
    colors?: string[] | string;
    sizes?: string[] | string;
    page?: number;
    limit?: number;
    setRecommendedProducts: (products: any[]) => void;
  }) => {
    try {
      const query = new URLSearchParams();

      // price range
      if (Array.isArray(priceRange) && priceRange.length === 2) {
        query.set("priceRange", priceRange.join(","));
      }

      // categories
      if (categories) {
        query.set(
          "categories",
          Array.isArray(categories) ? categories.join(",") : categories
        );
      }

      // colors
      if (colors) {
        query.set("colors", Array.isArray(colors) ? colors.join(",") : colors);
      }

      // sizes
      if (sizes) {
        query.set("sizes", Array.isArray(sizes) ? sizes.join(",") : sizes);
      }

      query.set("page", String(page));
      query.set("limit", String(limit));

      const res = await axiosInstance.get(
        `/product/api/product/get-filtered-products?${query.toString()}`
      );

      setRecommendedProducts(res?.data?.products || []);
    } catch (error) {
      console.error("❌ Failed to fetch filtered products:", error);
    }
  };

  useEffect(() => {
    fetchFilteredProducts({
      priceRange,
      setRecommendedProducts,
    });
  }, [JSON.stringify(priceRange)]);

  console.log("rec: ", recommendedProducts);

  const SideContent = ({
    title,
    icon,
    content,
  }: {
    title?: string;
    icon: any;
    content: any;
  }) => {
    return (
      <div className="mb-1 p-3 border-b border-b-gray-100">
        <span className="text-sm text-gray-600">{title}</span>
        <div className="flex gap-1 items-center text-gray-600">
          {icon}
          <span className="text-lg font-normal">{content}</span>
        </div>
      </div>
    );
  };
  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="bg-white w-[90%] lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
        {/* left column - product images */}
        <div className="p-4">
          <div className="relative w-full">
            {/* Main Image with zoom */}
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: "Product Image",
                  isFluidWidth: true,
                  src:
                    currentImage ||
                    "https://ik.imagekit.io/fz0xzwtey/products/product-1741207782553-0_-RWfpGzfHt.jpg",
                },
                largeImage: {
                  src:
                    currentImage ||
                    "https://ik.imagekit.io/fz0xzwtey/products/product-1741207782553-0_-RWfpGzfHt.jpg",
                  width: 1200,
                  height: 1200,
                },
                enlargedImageContainerDimensions: {
                  width: "150%",
                  height: "150%",
                },
                enlargedImageStyle: {
                  border: "none",
                  boxShadow: "none",
                },
                enlargedImagePosition: "right",
              }}
            />
          </div>
          {/* Thumbnail images array */}
          <div className="relative flex items-center gap-2 mt-4 overflow-hidden">
            {productDetails?.images?.length > 4 && (
              <button
                disabled={currentIndex === 0}
                className="absolute left-0 p-2 bg-white rounded-full shadow-md z-10"
                onClick={prevImage}
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="flex gap-2 overflow-x-auto ">
              {productDetails?.images?.map((img: any, index: number) => (
                <Image
                  key={index}
                  src={
                    img?.url ||
                    "https://ik.imagekit.io/fz0xzwtey/products/product-1741207782553-0_-RWfpGzfHt.jpg"
                  }
                  alt={"Yhumbnail"}
                  width={60}
                  height={60}
                  className={`cursor-pointer border rounded-lg p-1 ${
                    currentImage === img ? "border-blue-500" : "border-gray-300"
                  }`}
                  onClick={() => {
                    setCurrentImage(img);
                    setCurrentIndex(index);
                  }}
                />
              ))}
            </div>
            {productDetails?.images?.length > 4 && (
              <button
                disabled={currentIndex === productDetails?.images?.length - 1}
                className="absolute right-0 p-2 bg-white rounded-full shadow-md z-10"
                onClick={nextmage}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Middle Column - product details */}
        <div className="p-4">
          <h1 className="text-xl mb-2 font-medium">{productDetails?.title}</h1>
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Ratings rating={productDetails?.averageRating} />
              <Link href={"#reviews"} className="text-blue-500 hover:underline">
                {`(${productDetails?.reviewCount || 0}  Reviews)`}
              </Link>
            </div>
            <div className="">
              <Heart
                size={25}
                fill={isInWishlist ? "red" : "transparent"}
                className="cursor-pointer "
                color={isInWishlist ? "transparent" : "#777"}
                onClick={() => {
                  isInWishlist
                    ? removeFromWishlist(
                        productDetails?.id,
                        user?.user,
                        location,
                        deviceInfo
                      )
                    : addToWishlist(
                        {
                          ...productDetails,
                          quantity,
                          selectedOptions: {
                            color: isSelectedColor,
                            size: isSelectedSize,
                          },
                        },
                        user?.user,
                        location,
                        deviceInfo
                      );
                }}
              />
            </div>
          </div>
          <div className="py-2 border-b border-gray-200">
            <span className="text-gray-500">
              Brand:{" "}
              <span className="text-blue-500">
                {productDetails?.brand || "No Brand"}
              </span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-orange-500">
              ${productDetails?.salePrice}
              <div className="flex gap-2 pb-2 text-lg border-b border-b-slate-200">
                <span className="line-through text-gray-400">
                  ${productDetails?.regularPrice}
                </span>
                <span className="text-gray-500">-{discountPercentage}%</span>
              </div>
            </span>
          </div>
          <div className="mt-2">
            <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
              {/**Color Options */}
              {productDetails?.colors?.length > 0 && (
                <div className="">
                  <strong>Color:</strong>
                  <div className="flex mt-1 gap-2">
                    {productDetails?.colors?.map(
                      (color: string, index: number) => (
                        <button
                          key={index}
                          className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${
                            isSelectedColor === color
                              ? "border-gray-400 shadow-md scale-110"
                              : "border-transparent"
                          }`}
                          onClick={() => setIsSelectedColor(color)}
                          style={{ backgroundColor: color }}
                        />
                      )
                    )}
                  </div>
                </div>
              )}
              {/**Size Options */}
              {productDetails?.sizes?.length > 0 && (
                <div className="">
                  <strong>Size:</strong>
                  <div className="flex mt-1 gap-2">
                    {productDetails?.sizes?.map(
                      (size: string, index: number) => (
                        <button
                          key={index}
                          className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${
                            isSelectedSize === size
                              ? "bg-gray-800 shadow-md scale-110 text-white"
                              : "bg-gray-300 text-black"
                          }`}
                          onClick={() => setIsSelectedSize(size)}
                        >
                          {size}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex gap-3 items-center">
              <div className="flex rounded-md items-center">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1 bg-gray-300 cursor-pointer hover:bg-gray-400 font-semibold text-black rounded-l-md"
                >
                  -
                </button>
                <span className="px-4 bg-gray-100 py-1">{quantity}</span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-3 py-1 bg-gray-300 cursor-pointer hover:bg-gray-400 font-semibold text-black rounded-l-md"
                >
                  +
                </button>
              </div>
              {productDetails?.stock > 0 ? (
                <span className="text-green-600 font-semibold">
                  In Stock{" "}
                  <span className="text-gray-500 font-semibold">
                    (Stock {productDetails?.stock})
                  </span>
                </span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>
            <button
              className={`flex mt-6 items-center gap-2 px-5 py-[10px] bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition ${
                isInCart ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              disabled={isInCart || productDetails?.stock === 0}
              onClick={() =>
                addToCart(
                  {
                    ...productDetails,
                    quantity,
                    selectedOptions: {
                      color: isSelectedColor,
                      size: isSelectedSize,
                    },
                  },
                  user?.user,
                  location,
                  deviceInfo
                )
              }
            >
              <ShoppingCartIcon size={18} />
              Add to cart
            </button>
          </div>
        </div>

        {/* Right Column - seller information */}
        <div className="-mt-6 bg-[#fafafa]">
          <SideContent
            title={"Delivery Option"}
            icon={<MapPin size={18} className="ml-[-5px]" />}
            content={location?.city + ", " + location?.country}
          />
          <SideContent
            title={"Return & Warranty"}
            icon={<Package size={18} className="ml-[-5px]" />}
            content={"7 Days Returns"}
          />
          <SideContent
            icon={<WalletMinimal size={18} className="ml-[-5px]" />}
            content={productDetails?.warranty || "Warranty not available"}
          />
          <div className="px-3 py-1">
            <div className="rounded-lg w-[85%]">
              {/* Sold by section */}
              <div className="flex items-center justify-between">
                <div className="">
                  <span className="text-sm font-light text-gray-600">
                    Sold by
                  </span>
                  <span className="block max-w-[150px] truncate font-medium text-lg ">
                    {productDetails?.shop.name}
                  </span>
                </div>
                <Link
                  href={"#"}
                  className="text-blue-500 text-sm flex items-center gap-1"
                >
                  <MessageSquareText />
                  Chat Now
                </Link>
              </div>
              {/* Seller performace stats */}
              <div className="grid grid-cols-3 gap-2 border-t border-t-gray-200 mt-3 pt-3">
                <div className="">
                  <p className="text-gray-500 text-[12px]">
                    Positive Seller Ratings
                  </p>
                  <p className="text-lg font-semibold">90%</p>
                </div>

                <div className="">
                  <p className="text-gray-500 text-[12px]">Ship on Time</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
                <div className="">
                  <p className="text-gray-500 text-[12px]">
                    Chat Response Rate
                  </p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
              </div>
              {/* Go to Store */}
              <div className="text-center mt-4 border-t border-t-gray-200 pt-2">
                <Link href={`/shop/${productDetails?.shop?.id}`}>
                  GO TO STORE
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[90%] lg:w-[80%] mx-auto mt-5 ">
        <div className="bg-white min-h-[60vh] h-full p-5">
          <h3 className="text-lg font-semibold">
            Prodoct details of {productDetails?.title}
          </h3>
          <div
            className="prose prose-sm text-slate-200 max-w-none"
            dangerouslySetInnerHTML={{
              __html: productDetails?.detailedDescription,
            }}
          />
        </div>
      </div>

      <div className="w-[90%] lg:w-[80%] mx-auto mt-5">
        <div className="bg-white min-h-[60vh] h-full p-5">
          <h3 className="text-lg font-semibold">
            Ratings & Reviews of {productDetails?.title}
          </h3>
          {productDetails?.reviewCount === 0 ? (
            <p className="text-center pt-14">No Reviews available yet!</p>
          ) : (
            <p className="text-center pt-14 text-red-500">
              create Reviews components!
            </p>
          )}
        </div>
      </div>

      {/* Recommended Product */}

      <div className="w-[90%] lg:w-[80%] mx-auto ">
        <div className="w-full h-full p-5">
          <h3 className="text-xl font-semibold mb-2">You may also like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 m-auto">
            {recommendedProducts?.map((i: any) => (
              <ProductCard product={i} key={i.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
