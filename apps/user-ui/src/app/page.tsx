"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../shared/components/section-title";
import HeroSection from "../shared/modules/hero";
import axiosInstance from "../utils/axiosInstance";
import ProductCard from "../shared/components/cards/product-card";
import ShopCard from "../shared/components/cards/shop-card";

export default function Page() {
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosInstance(
        "product/api/product/get-all-products?page=1&limit=10"
      );
      console.log("res", res.data);
      return res.data?.products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: latestProducts = [] } = useQuery({
    queryKey: ["latest-products"],
    queryFn: async () => {
      const res = await axiosInstance(
        "product/api/product/get-all-products?page=1&limit=10&type=new"
      );
      return res.data?.products;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const {
    data: shops = [],
    isLoading: isShopLoading,
    isError: isShopError,
  } = useQuery({
    queryKey: ["top-shops"],
    queryFn: async () => {
      const res = await axiosInstance(
        "product/api/product/top-shops?page=1&limit=10"
      );
      return res.data?.shops;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log("products12", products);
  return (
    <div className="bg-[#f5f5f5]">
      <HeroSection />
      <div className="my-10 m-auto w-[90%] md:w-[80%]">
        <div className="mb-8">
          <SectionTitle title="Sugested Products" />
        </div>
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
              />
            ))}
          </div>
        )}
        {!isLoading && products?.length === 0 && (
          <p>No products available yet!</p>
        )}
        {!isLoading && !isError && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="my-8 block">
          <SectionTitle title="Latest Products" />
        </div>
        {!isLoading && !isError && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {latestProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        {!isLoading && latestProducts?.length === 0 && (
          <p className="text-center">No products available yet!</p>
        )}
        <div className="my-8 block">
          <SectionTitle title="Top Shops" />
        </div>
        {!isShopLoading && !isShopError && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {shops?.map((shop: any) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
        {!isShopLoading && shops?.length === 0 && (
          <p className="text-center">No shops available yet!</p>
        )}

        {/* All events  */}
      </div>
    </div>
  );
}
