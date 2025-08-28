// hooks/useApiMutation.ts
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { AxiosError } from "axios";
import axiosInstance from "../utils/axiosInstance";

type HttpMethod = "post" | "put" | "patch" | "delete";

export function useApiMutation<TData = any, TVariables = any>(
  url: string | ((variables: TVariables) => string),
  method: HttpMethod,
  options?: Omit<
    UseMutationOptions<TData, AxiosError, TVariables>,
    "mutationFn"
  >
) {
  return useMutation<TData, AxiosError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const endpoint = typeof url === "function" ? url(variables) : url;

      let res;
      if (method === "delete") {
        // Axios delete does not take body directly
        res = await axiosInstance.delete<TData>(endpoint, { data: variables });
      } else {
        res = await axiosInstance[method]<TData>(endpoint, variables);
      }

      return res.data;
    },
    ...options,
  });
}
