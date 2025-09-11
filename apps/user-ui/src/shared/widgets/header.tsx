"use client";
import Link from "next/link";
import React from "react";
import { HeartIcon, Search, ShoppingCartIcon } from "lucide-react";
import HeaderBottom from "./header-bottom";
import useUser from "../../hooks/useUser";
import HeaderUser from "./header-user";
import { useStore } from "../../store";

const Header = () => {
  const { isLoading, user } = useUser();
  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);

  return (
    <div className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div className="">
          <Link href={"/"}>
            <span className="text-2xl font-bold">Eshop</span>
          </Link>
        </div>
        <div className="w-[50%] relative">
          <input
            type="text"
            placeholder="Search for products..."
            className="w-full px-4 outline-none h-[55px] font-Poppins font-medium border-[2.5px] border-pryColor"
          />

          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] absolute top-0 right-0 bg-pryColor">
            <Search color="white" />
          </div>
        </div>
        <div className="flex items-center gap-8">
          <HeaderUser user={user} isLoading={isLoading} />
          <div className="flex items-center gap-5">
            <Link href="/wishlist" className="relative">
              <HeartIcon color="black" />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-sm text-white font-medium">
                  {wishlist?.length || 0}
                </span>
              </div>
            </Link>
            <Link href="/cart" className="relative">
              <ShoppingCartIcon color="black" />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-sm text-white font-medium">
                  {cart?.length || 0}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-[#99999938">
        <HeaderBottom user={user} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Header;
