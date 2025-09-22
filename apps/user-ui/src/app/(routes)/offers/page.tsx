"use client";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "apps/user-ui/src/shared/components/cards/product-card";
import TitleBreadCrumbs from "apps/user-ui/src/shared/components/title-bread-crumbs";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Range } from "react-range";

const MIN = 0;
const MAX = 1199;

const OffersPage = () => {
  const [isProducLoading, setIsProducLoading] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [temppriceRange, setTempPriceRange] = useState([0, 1199]);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [selectedColors, setSelectedColors] = useState<any[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const router = useRouter();

  const updateURL = () => {
    const params = new URLSearchParams();

    if (priceRange?.length === 2) {
      params.set("priceRange", priceRange.join(","));
    }

    if (selectedCategories?.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    if (selectedColors?.length > 0) {
      params.set("colors", selectedColors.join(","));
    }

    if (selectedSizes?.length > 0) {
      params.set("sizes", selectedSizes.join(","));
    }

    params.set("page", page.toString());

    router.replace(`/offers?${decodeURIComponent(params.toString())}`, {
      scroll: false,
    });
  };

  const fetchFilteredProducts = async () => {
    setIsProducLoading(true);

    try {
      const query = new URLSearchParams();

      // price range
      if (Array.isArray(priceRange) && priceRange.length === 2) {
        query.set("priceRange", priceRange.join(","));
      }

      // categories
      if (selectedCategories.length > 0) {
        query.set("categories", selectedCategories.join(","));
      }

      // colors
      if (selectedColors?.length > 0) {
        query.set("colors", selectedColors.join(","));
      }

      // sizes
      if (selectedSizes?.length > 0) {
        query.set("sizes", selectedSizes.join(","));
      }

      query.set("page", String(page));
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `/product/api/product/get-filtered-offers?${query.toString()}`
      );

      setProducts(res?.data?.products || []);
      setTotalPage(res?.data?.pagination?.totalPages);
    } catch (error) {
      console.error("❌ Failed to fetch filtered offers:", error);
    } finally {
      setIsProducLoading(false);
    }
  };

  useEffect(() => {
    updateURL();

    fetchFilteredProducts();
  }, [selectedCategories, priceRange, selectedColors, selectedSizes, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axiosInstance("/product/api/product/get-categories");
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cat) => cat !== id) : [...prev, id]
    );
  };
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((col) => col !== color)
        : [...prev, color]
    );
  };
  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((sz) => sz !== size) : [...prev, size]
    );
  };

  console.log("cat1", selectedCategories);
  const colors = [
    { name: "Black", code: "#000000" },
    { name: "Red", code: "#ff0000" },
    { name: "Green", code: "#00ff00" },
    { name: "Blue", code: "#0000ff" },
    { name: "Yellow", code: "#ffff00" },
    { name: "Magenta", code: "#ff00ff" },
    { name: "Cyan", code: "#00ffff" },
    { name: "White", code: "#ffffff" },
  ];
  const sizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
  return (
    <div className="w-full bg-[#f5f5f5] pb-10 ">
      <div className="w-[90%] lg:w-[80%] m-auto ">
        <TitleBreadCrumbs title="All Offers" subTitle="All Offers" />

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[270px] !rounded bg-white p-4 space-y-6 shadow-md ">
            <h3 className="text-xl font-Poppins font-medium">Price Filter</h3>
            {/* Price filter */}
            <div className="ml-2">
              <Range
                step={1}
                min={MIN}
                max={MAX}
                values={temppriceRange}
                onChange={(values) => setTempPriceRange(values)}
                renderTrack={({ props, children }) => {
                  const [min, max] = temppriceRange;
                  const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                  const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                  return (
                    <div
                      className="relative rounded bg-blue-200 h-[6px]"
                      {...props}
                      style={{ ...props.style }}
                    >
                      <div
                        className="absolute h-full bg-blue-600 rounded"
                        style={{
                          left: `${percentageLeft}`,
                          width: `${percentageRight - percentageLeft}%`,
                        }}
                      />
                      {children}
                    </div>
                  );
                }}
                renderThumb={({ props }) => {
                  const { key, ...rest } = props;
                  return (
                    <div
                      key={key}
                      {...rest}
                      className="w-[16px] h-[16px] bg-blue-600 rounded-full shadow "
                    />
                  );
                }}
              />
            </div>
            <div className="flex justify-between mt-2 items-center">
              <div className="text-sm text-gray-600">
                ${temppriceRange[0]} - ${temppriceRange[1]}
              </div>
              <button
                onClick={() => setPriceRange(temppriceRange)}
                className="text-sm px-4 py-1 bg-gray-200 hover:bg-blue-600 hover:text-white transition !rounded"
              >
                Apply
              </button>
            </div>
            {/* Categories Filter */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1">
              Categories
            </h3>
            <ul className="space-y-2 !mt-3">
              {isLoading ? (
                <p className="">Loading</p>
              ) : (
                data?.data?.map((category: any) => (
                  <li
                    className="flex items-center justify-between"
                    key={category?.id}
                  >
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category?.id)}
                        className="accent-blue-600"
                        onChange={() => toggleCategory(category?.id)}
                      />
                      {category?.name}
                    </label>
                  </li>
                ))
              )}
            </ul>
            {/* Colors */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-6">
              Filter by Color
            </h3>
            <ul className="space-y-2 !mt-3">
              {colors?.map((color: any) => (
                <li
                  className="flex items-center justify-between"
                  key={color?.code}
                >
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedColors.includes(color?.name)}
                      className="accent-blue-600"
                      onChange={() => toggleColor(color?.name)}
                    />
                    <span
                      className="w-[16px] h-[16px] rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: color?.code }}
                    />
                    {color?.name}
                  </label>
                </li>
              ))}
            </ul>
            {/* Sizes */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-6">
              Filter by Size
            </h3>
            {sizes?.map((size: any) => (
              <li className="flex items-center justify-between" key={size}>
                <label className="flex items-center gap-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedColors.includes(size)}
                    className="accent-blue-600"
                    onChange={() => toggleSize(size)}
                  />
                  {size}
                </label>
              </li>
            ))}
          </aside>

          {/* Product grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isProducLoading ? (
              <div className="gridder-1 gap-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl h-[250px] bg-gray-300 animate-pulse "
                  />
                ))}
              </div>
            ) : products?.length > 0 ? (
              <div className="gridder-1 gap-2">
                {products.map((product) => (
                  <ProductCard key={product?.id} product={product} />
                ))}
              </div>
            ) : (
              <p className="">No Product Found!</p>
            )}
            {totalPage > 1 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: totalPage }).map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setPage(index + 1)}
                    className={`px-3 py-1 !rounded border border-gray-200 text-sm ${
                      page === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
