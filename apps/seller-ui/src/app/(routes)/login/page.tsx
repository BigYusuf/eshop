"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";

type FormData = {
  email: string;
  password: string;
};
const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const onSubmit = (data: FormData) => {
    loginMutation.mutate(data);
  };

  const loginMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/seller-login`,
        data,
        { withCredentials: true }
      );
      return response?.data;
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error: AxiosError) => {
      const errMessage =
        (error?.response?.data as { message?: string })?.message ||
        "Invalid credentials";
      setError(errMessage);
    },
  });

  return (
    <div className="w-full min-h-screen py-10 bg-pryBg">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-black">
        Home . Login
      </p>
      <div className="w-full flex justify-center">
        <div className="shadow p-8 md:w-[480px] bg-white rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Login to Eshop(Seller)
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Don't have a seller account{" "}
            <Link href={"/signup"} className={"text-pryColor"}>
              Sign Up
            </Link>
          </p>
          
          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="" className="label-text">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter valid email"
              className="inputt"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: "Invalid email address",
                },
              })}
            />
            {errors?.email && (
              <p className="error-text">
                {String(errors?.email?.message)}
              </p>
            )}

            <label htmlFor="" className="label-text">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Min. 6 characters"
                className={`w-full p-2 border border-gray-300 outline-0 rounded mb-1 `}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              >
                {passwordVisible ? <Eye /> : <EyeOff />}
              </button>
            </div>
            {errors?.password && (
              <p className="error-text">
                {String(errors?.password?.message)}
              </p>
            )}
            <div className="flex justify-between items-center my-4">
              <label
                htmlFor="rememberMe"
                className="flex items-center text-gray-600 cursor-pointer"
                onClick={() => setRememberMe(!rememberMe)}
              >
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember me
              </label>
              <Link href={"/forgot-password"} className="text-blue-500 text-sm">
                Forgot Password
              </Link>
            </div>
            <button
            type="submit"
              disabled={loginMutation.isPending}
              className={`w-full  py-2 rounded-lg text-lg cursor-pointer text-white ${
                loginMutation.isPending ? "bg-gray-300" : "bg-black"
              }`}
            >
              {loginMutation.isPending ? "signing in.." : "Login"}
            </button>
            {/* {loginMutation?.isError &&
                            loginMutation.error instanceof AxiosError && (
                              <p className="text-red-500 text-sm mt-2">
                                {loginMutation.error?.response?.data?.message ||
                                  loginMutation.error?.message}
                              </p>
                            )} */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
