// hooks/useApiQuery.ts
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axiosInstance from "../utils/axiosInstance";

export function useApiQuery<TData = unknown>(
  queryKey: string[],
  url: string,
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">,
  params?: Record<string, any>
) {
  return useQuery<TData>({
    queryKey: [...queryKey, params], // cache key includes params
    queryFn: async () => {
      const res: any = await axiosInstance.get(url, { params });
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
    ...options,
  });
}
//examples usage

// 1. Fetching categories (static endpoint)
// const { data: categories, isLoading, isError } = useApiQuery(
//   ["categories"],
//   "/product/api/product/get-categories"
// );

// 2. Fetching a single product by id (dynamic param)
// const { data: product } = useApiQuery(
//   ["product", productId],
//   `/product/api/product/${productId}`
// );

// 3. Fetching with query params (e.g. search)
// const { data: products } = useApiQuery(
//   ["products", searchTerm],
//   "/product/api/product/search",
//   { enabled: !!searchTerm }, // only fetch if searchTerm exists
//   { query: searchTerm } // passed as `params`
// );

// 4. Using options (staleTime, refetchOnWindowFocus, etc.)
// const { data: discounts } = useApiQuery(
//   ["discount-codes"],
//   "/discount/api/get-discount-codes",
//   { refetchOnWindowFocus: false } // disables auto refetch on focus
// );
