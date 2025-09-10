"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import SectionTitle from "../shared/components/section-title";
import HeroSection from "../shared/modules/hero";
import axiosInstance from "../utils/axiosInstance";
import ProductCard from "../shared/components/cards/product-card";

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
        {!isLoading && !isError && (
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-5 gap-5">
            {products?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
