"use client";

import {
  AlignLeft,
  ChevronDown,
  ChevronUp,
  HeartIcon,
  ShoppingCartIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Link from "next/link";

import { navItems } from "../../configs/constants";
import HeaderUser from "./header-user";
import { useStore } from "../../store";

const HeaderBottom = ({
  isLoading,
  user,
}: {
  isLoading: boolean;
  user: any;
}) => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const wishlist = useStore((state) => state.wishlist);
  const cart = useStore((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky ? "fixed z-[100] top-0 left-0 bg-white shadow-lg" : "relative"
      }`}
    >
      <div
        className={`w-[80%] relative m-auto flex items-center justify-between ${
          isSticky ? "pt-3" : "py-0"
        }`}
      >
        {/* All Dropdown */}
        <div
          onClick={() => setShow(!show)}
          className={`w-[260px] ${
            isSticky && "-mb-2"
          } cursor-pointer flex items-center justify-between px-5 h-[50px] bg-pryColor`}
        >
          <div className={`flex items-center gap-2`}>
            <AlignLeft color="white" />
            <span className="text-white font-medium">All Departments</span>
          </div>
          {show ? <ChevronUp color="white" /> : <ChevronDown color="white" />}
        </div>
        {/* dropdowm menu */}
        {show && (
          <div
            className={`absolute left-0 ${
              isSticky ? "top-[70px]" : "top-[50px]"
            } w-[260px] h-[400px] bg-[#f5f5f5]`}
          >
            {/** Categories */}
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex items-center">
          {navItems.map((item: NavItemsTypes, index: number) => (
            <Link
              className="px-5 font-medium text-lg"
              key={index}
              href={item?.href}
            >
              {item?.title}
            </Link>
          ))}
          {isSticky && (
            <div className="flex items-center gap-8">
              <HeaderUser user={user?.user} isLoading={isLoading} />
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
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderBottom;
