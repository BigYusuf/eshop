import Link from "next/link";
import React from "react";
import { HeartIcon, Search, ShoppingCartIcon, UserIcon } from "lucide-react";
import HeaderBottom from "./header-bottom";

const Header = () => {
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
            className="w-full px-4 outline-none h-[55px] font-Poppins font-medium border-[2.5px] border-pryBg"
          />

          <div className="w-[60px] cursor-pointer flex items-center justify-center h-[55px] absolute top-0 right-0 bg-pryBg">
            <Search color="white" />
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="w-[50px] h-[50px] flex border-2 items-center justify-center rounded-full border-grayBg"
            >
              <UserIcon color="black" />
            </Link>
            <Link href="/login">
              <span className="block font-medium">Hello</span>
              <span className="font-semibold">Sign in</span>
            </Link>
          </div>
          <div className="flex items-center gap-5">
   
            <Link href="/wishlist" className="relative">
              <HeartIcon color="black" />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-sm text-white font-medium">0</span>
              </div>
            </Link>
            <Link href="/cart" className="relative">
              <ShoppingCartIcon color="black" />
              <div className="w-6 h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]">
                <span className="text-sm text-white font-medium">0</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="border-b border-b-[#99999938">
        <HeaderBottom />
      </div>
    </div>
  );
};

export default Header;
