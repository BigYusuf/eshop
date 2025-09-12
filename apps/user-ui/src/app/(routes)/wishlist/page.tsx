"use client";
import useDeviceTracking from "apps/user-ui/src/hooks/useDeviceTracking";
import useLocationTracking from "apps/user-ui/src/hooks/useLocationTracking";
import useUser from "apps/user-ui/src/hooks/useUser";
import { useStore } from "apps/user-ui/src/store";
import Image from "next/image";
import Link from "next/link";

import React from "react";

const WishlistPage = () => {
  const user = useUser();
  const location = useLocationTracking();
  const newLocation = location?.lat
    ? `${location?.city ? location?.city + ", " : ""}${
        location?.country ? location?.country : ""
      }`
    : "Unknown";
  const deviceInfo = useDeviceTracking();
  const addToCart = useStore((state) => state.addToCart);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const wishlist = useStore((state) => state.wishlist);
  const decreaseQty = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ),
    }));
  };
  const increaseQty = (id: string) => {
    useStore.setState((state: any) => ({
      wishlist: state.wishlist.map((item: any) =>
        item.id === id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      ),
    }));
  };
  const removeItem = (id: string) => {
    removeFromWishlist(id, user || "", newLocation, deviceInfo as any);
  };
  return (
    <div className="w-full bg-white min-h-screen p-4">
      <div className="w-[90%] md:w-[80%] mx-auto min-h-screen">
        {/* Header & Breadcrumbs */}
        {/* <PageHeader
          title="Wislist"
          breadcrumb={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
        /> */}
        <div className="pb-[50px]">
          <h1 className="md:pt-[50px] font-medium text-[44px] leading-[1] mb-[16px] font-jost">
            Wishlist
          </h1>
          <Link href={"/"} className="text-[#55585b] hover:underline">
            Home
          </Link>
          <span className="inline-block mx-1 p-[1.5px] bg-[#a8acb0] rounded-full"></span>
          <span className="text-[#55585b]">Wishlist</span>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center text-gray-600 text-lg">
            Your wishlist is empty! Start adding products.
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            <table className="w-full border-collapse">
              <thead className="bg-[#f1f3f4]">
                <tr>
                  <th className="py-3 text-left pl-4"> Product</th>
                  <th className="py-3 text-left"> Price</th>
                  <th className="py-3 text-left"> Quantity</th>
                  <th className="py-3 text-left"> Action</th>
                </tr>
              </thead>
              <tbody className="">
                {wishlist?.map((item: any) => (
                  <tr key={item.id} className="border-b-[#000002b] border-b">
                    <td className="flex items-center gap-3 p-4">
                      <Image
                        src={item?.images[0]?.url}
                        alt={item?.id}
                        width={80}
                        height={80}
                      />
                      <span>{item?.title}</span>
                    </td>
                    <td className="px-6 text-lg">
                      ${item?.salePrice.toFixed(2)}
                    </td>
                    <td className="px-6 text-lg">
                      <div className="flex justify-center items-center border border-gray-200 rounded-[20px] w-[90px] p-[4px] gap-2">
                        <button
                          onClick={() => decreaseQty(item?.id)}
                          className="text-black cursor-pointer text-xl px-3 py-1 rounded-[20px] hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span>{item?.quantity}</span>
                        <button
                          onClick={() => increaseQty(item?.id)}
                          className="text-black cursor-pointer text-xl px-3 py-1 rounded-[20px] hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="">
                      <button
                        onClick={() =>
                          addToCart(item, user, newLocation, deviceInfo as any)
                        }
                        className="text-white bg-[#2295ff] cursor-pointer px-5 py-2 rounded-md transition-all hover:bg-[#007bff]"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className=" ml-2 text-[#818487] border border-[#818487] hover:border-[#ff1826] cursor-pointer px-5 py-2 rounded-md transition hover:text-[#ff1826] duration-200"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
