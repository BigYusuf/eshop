import Ratings from "apps/user-ui/src/ratings";
import { useStore } from "apps/user-ui/src/store";
import {
  Heart,
  MapPin,
  MessageCircleMoreIcon,
  ShoppingBag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ProductQuickViewCard = ({
  product,
  user,
  location,
  deviceInfo,
  setOpen,
}: {
  product: any;
  user: any;
  location: any;
  deviceInfo?: any;
  setOpen?: (x: boolean) => void;
}) => {
  const [activeImage, setActiveImage] = useState<number>(0);
  const [isSelectedColor, setIsSelectedColor] = useState<string>(
    product?.colors?.[0] || ""
  );
  const [isSelectedSize, setIsSelectedSize] = useState<string>(
    product?.sizes?.[0] || ""
  );
  const [quantity, setQuantity] = useState<number>(1);
  const router = useRouter();
  const addToCart = useStore((state) => state.addToCart);
  const addToWishlist = useStore((state) => state.addToWishlist);
  // const removeFromCart = useStore((state) => state.removeFromCart);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const wishlist = useStore((state) => state.wishlist);
  // const cart = useStore((state) => state.cart);

  const isInWishlist = wishlist?.some((item) => item.id === product?.id);
  // const isInCart = cart?.some((item) => item.id === product?.id);

  const handleCart = () => {
    // if (isInCart) {
    //   removeFromCart(product?.id, user, location, deviceInfo as string);
    // } else {
    addToCart(
      {
        ...product,
        quantity,
        selectedOptions: {
          color: isSelectedColor,
          size: isSelectedSize,
        },
      },
      user,
      location,
      deviceInfo
    );
    // }
  };
  const handleWishlist = () => {
    if (isInWishlist) {
      removeFromWishlist(product?.id, user, location, deviceInfo);
    } else {
      addToWishlist({ ...product, quantity: 1 }, user, location, deviceInfo);
    }
  };
  return (
    <div
      className="fixed inset-0 bg-[#0000001d] top-0 left-0 w-full h-screen bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setOpen && setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-4 w-[90%] md:w-[70%] lg:w-[50%] md:mt-14 2xl:mt-0 shadow-md overflow-scroll h-max min-h-[70vh] md:p-6"
      >
        <div className="flex flex-col md:flex-row w-full">
          <div className="w-full md:w-1/2 h-full flex items-center justify-center p-4">
            <Image
              src={product?.images[activeImage]?.url}
              alt={product?.images[activeImage]?.url}
              height={400}
              width={400}
              className={`w-full rounded-lg object-contain`}
            />
            <div className="flex gap-2 mt-4">
              {product?.images?.map((img: any, index: number) => (
                <div
                  className={`border rouned-md  cursor-pointer ${
                    activeImage === index
                      ? "border-gray-500 pt-1"
                      : "border-transparent"
                  }`}
                  key={index}
                  onClick={() => setActiveImage(index)}
                >
                  <Image
                    src={img?.url}
                    alt={`Thumbnail${index}`}
                    height={80}
                    width={80}
                    className={`rounded-md`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-8 mt-6 md:mt-0">
            <div className="flex items-center justify-between pb-3 border-gray-200 relative border-b">
              <div className="flex items-start gap-3">
                {/* Shp Logo */}
                <Image
                  className="rounded-full w-[60px] h-[60px] object-cover"
                  src={product?.shop?.logo?.url}
                  alt="Shp Logo"
                  width={60}
                  height={60}
                />
                <div>
                  <Link
                    href={`/shop/${product?.shop?.id}`}
                    className="text-lg fonrt-medium"
                  >
                    {product?.shop?.name.length > 20
                      ? product?.shop?.name.slice(0, 20) + "..."
                      : product?.shop?.name}
                  </Link>
                  {/* Shop Rating */}
                  <span className="block mt-1">
                    <Ratings
                      rating={product?.shop?.ratings}
                      showNumber={false}
                    />
                  </span>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <MapPin size={20} />{" "}
                    {product?.shop?.address
                      ? product?.shop?.address.length > 25
                        ? product?.shop?.address.slice(0, 25) + "..."
                        : product?.shop?.address
                      : "No address"}
                  </p>
                </div>
              </div>
              {/* Chat with Seller Button */}
              <button
                onClick={() =>
                  router.push(`/inbox?shopId=${product?.shop?.id}`)
                }
                className="flex gap-2 cursor-pointer items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                <MessageCircleMoreIcon />
                Chat with Seller
              </button>

              <button className="absolute w-8 h-8 cursor-pointer top-[-5px] right-[-5px] flex justify-center items-center my-2 mt-[-10px] rounded-full hover:bg-gray-200 transition">
                <X onClick={() => setOpen && setOpen(false)} size={25} />
              </button>
            </div>
            <h3 className="text-xl font-semibold mt-3">{product?.title}</h3>
            <p className="mt-2 text-gray-700 whitespace-pre-wrap w-full overflow-y-auto">
              {product?.shortDescription.length > 150
                ? product?.shortDescription.slice(0, 150) + "..."
                : product?.shortDescription}
            </p>
            {/* Brand */}
            {product?.brand && (
              <p className="mt-4 text-gray-700">
                <span className="font-semibold">Brand:</span> {product?.brand}
              </p>
            )}
            {/* Size Options */}
            {product?.sizes && product?.sizes.length > 0 && (
              <div className="mt-2">
                <h4 className="font-semibold mb-2">Available Sizes:</h4>
                <div className="flex gap-2">
                  {product?.sizes.map((size: string, index: number) => (
                    <button
                      key={index}
                      className={`border-2 rounded-md px-3 py-1 cursor-pointer hover:bg-gray-200 transition ${
                        isSelectedSize === size
                          ? "border-gray-400 scale-110 shadow-md"
                          : "border-transparent"
                      }`}
                      onClick={() => setIsSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Color Options */}
            <div className="flex flex-col md:flex-row md:items-center gap-5 items-start mt-4">
              {/* Color Options */}
              {product?.colors && product?.colors.length > 0 && (
                <div>
                  <h4 className="font-semibold">Available Colors:</h4>
                  <div className="flex gap-2 mt-2">
                    {product?.colors.map((color: string, index: number) => (
                      <button
                        key={index}
                        style={{ backgroundColor: color }}
                        className={`border-2 w-8 h-8 rounded-full px-3 py-1 cursor-pointer hover:bg-gray-200 bg-[${color}] ${
                          isSelectedColor === color
                            ? "border-gray-400 scale-110 shadow-md"
                            : "border-transparent"
                        } transition`}
                        onClick={() => setIsSelectedColor(color)}
                      ></button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <h3 className="text-2xl font-bold text-gray-900">
                ${product?.salePrice}
              </h3>

              {product?.regularPrice > product?.salePrice && (
                <h3 className="text-lg text-red-600 line-through">
                  ${product?.regularPrice}
                </h3>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center rounded-md">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-1 cursor-pointer bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                >
                  -
                </button>
                <span className="px-4 py-1 border-t border-b border-gray-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-3 py-1 cursor-pointer bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-r-md"
                >
                  +
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleCart}
                  className="w-full bg-blue-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  <ShoppingBag size={18} className="inline-block mr-2" />
                  Add to Cart
                </button>
                <button className="opacity-[.7] cursor-pointer rounded-lg transition">
                  <Heart
                    size={30}
                    fill={isInWishlist ? "red" : "transparent"}
                    stroke={isInWishlist ? "red" : "#4b5563"}
                    color="transparent"
                    onClick={handleWishlist}
                    className={`${
                      isInWishlist ? "fill-red-500" : "text-gray-600"
                    } hover:scale-110 transition-transform duration-200`}
                  />
                  {/* <Heart
                    size={18}
                    fill="red"
                    color="transparent"
                    onClick={() => addToWishlist(product, null, "quickview", "web")}
                    className="inline-block"
                  /> */}
                  {/* <span className="ml-2">Add to Wishlist</span> */}
                  {/* <span className="sr-only">
                    {isInWishlist
                      ? "Remove from Wishlist"
                      : "Add to Wishlist"}
                  </span>
                  <Heart
                    size={18}
                    fill="red"
                    color="transparent"
                    className="inline-block mr-2"
                  /> */}
                </button>
              </div>
            </div>
            <div className="mt-3">
              {product?.stock && product?.stock > 0 ? (
                <span className="text-green-600 font-semibold">
                  In Stock ({product?.stock} available)
                </span>
              ) : (
                <span className="text-red-600 font-semibold">Out of Stock</span>
              )}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              Estimated Delivery:{" "}
              <span className="font-medium">
                {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()}
              </span>
            </div>
          </div>
          {/* <div className="absolute top-2 right-2 cursor-pointer p-2 rounded-full hover:bg-gray-200 transition">
            <X onClick={() => setOpen && setOpen(false)} size={25} />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ProductQuickViewCard;
