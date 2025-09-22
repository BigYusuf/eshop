"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import ShopCard from "apps/user-ui/src/shared/components/cards/shop-card";
import TitleBreadCrumbs from "apps/user-ui/src/shared/components/title-bread-crumbs";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import { shopCategories } from "packages/data/categories";
import { countryList } from "packages/data/countries";

const ShopsPage = () => {
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<any[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const router = useRouter();

  const updateURL = () => {
    const params = new URLSearchParams();
    if (selectedCategories?.length > 0) {
      params.set("categories", selectedCategories.join(","));
    }

    if (selectedCountries?.length > 0) {
      params.set("countries", selectedCountries.join(","));
    }

    params.set("page", page.toString());

    router.replace(`/shops?${decodeURIComponent(params.toString())}`, {
      scroll: false,
    });
  };

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);
    try {
      const query = new URLSearchParams();

      // categories
      if (selectedCategories.length > 0) {
        query.set("categories", selectedCategories.join(","));
      }

      // countries
      if (selectedCountries?.length > 0) {
        query.set("colors", selectedCountries.join(","));
      }

      query.set("page", String(page));
      query.set("limit", "12");

      const res = await axiosInstance.get(
        `/product/api/product/get-filtered-shops?${query.toString()}`
      );

      setShops(res?.data?.shops || []);
      setTotalPage(res?.data?.pagination?.totalPages);
    } catch (error) {
      console.error("❌ Failed to fetch filtered products:", error);
    } finally {
      setIsShopLoading(false);
    }
  };

  useEffect(() => {
    updateURL();

    fetchFilteredShops();
  }, [selectedCategories, selectedCountries, page]);

  console.log("shops", shops);

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cat) => cat !== id) : [...prev, id]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );
  };


  return (
    <div className="w-full bg-[#f5f5f5] pb-10 ">
      <div className="w-[90%] lg:w-[80%] m-auto ">
        <TitleBreadCrumbs title="All Shops" subTitle="Shops" />

        <div className="w-full flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-[270px] !rounded bg-white p-4 space-y-6 shadow-md ">
            {/* Categories Filter */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1">
              Categories
            </h3>
            <ul className="space-y-2 !mt-3">
              {shopCategories?.map((category: any) => (
                <li
                  className="flex items-center justify-between"
                  key={category?.id}
                >
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category?.value)}
                      className="accent-blue-600"
                      onChange={() => toggleCategory(category?.value)}
                    />
                    {category?.label}
                  </label>
                </li>
              ))}
            </ul>
            {/* Colors */}
            <h3 className="text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1 mt-6">
              Filter by Countries
            </h3>
            <ul className="space-y-2 !mt-3">
              {countryList?.map((country: any) => (
                <li
                  className="flex items-center justify-between"
                  key={country?.code}
                >
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedCountries.includes(
                        country?.country_code
                      )}
                      className="accent-blue-600"
                      onChange={() => toggleCountry(country?.country_code)}
                    />

                    {country?.name}
                  </label>
                </li>
              ))}
            </ul>
          </aside>

          {/* Shop grid */}
          <div className="flex-1 px-2 lg:px-3">
            {isShopLoading ? (
              <div className="gridder-1 gap-2">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl h-[250px] bg-gray-300 animate-pulse "
                  />
                ))}
              </div>
            ) : shops?.length > 0 ? (
              <div className="gridder-1 gap-2">
                {shops.map((shop) => (
                  <ShopCard key={shop?.id} shop={shop} />
                ))}
              </div>
            ) : (
              <p className="">No Shop Found!</p>
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

export default ShopsPage;
