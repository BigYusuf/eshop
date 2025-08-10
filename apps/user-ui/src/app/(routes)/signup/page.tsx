"use client";

import { Eye, EyeOff } from "lucide-react";
import GoogleButton from "../../../shared/components/google-button";
import Link from "next/link";
// import { useRouter } from "next/router";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};
const RegisterPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormData | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  const router = useRouter();

  const singupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/user-register`,
        data
      );
      return response?.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setOtpTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/user-verify`,
        { ...userData, otp: otp?.join("") }
      );
      return response?.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    singupMutation.mutate(data);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (userData) {
      singupMutation.mutate(userData);
    }
  };

  return (
    <div className="w-full min-h-[85vh] py-10 bg-[#f1f1f1]">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Register
      </h1>
      <p className="text-center text-lg font-medium py-3 text-black">
        Home . Register
      </p>
      <div className="w-full flex justify-center">
        <div className="shadow p-8 md:w-[480px] bg-white rounded-lg">
          <h3 className="text-3xl font-semibold text-center mb-2">
            Register to Eshop
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Already have an account{" "}
            <Link href={"/login"} className={"text-pryBg"}>
              Login
            </Link>
          </p>
          <GoogleButton text="Connect with Google" />
          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-3">or Sign up with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <label htmlFor="" className="text-gray-700 block mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="Enter valid First name"
                className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                {...register("firstName", {
                  required: "First Name is required",
                  minLength: {
                    value: 2,
                    message: "Invalid First Name",
                  },
                })}
              />
              {errors?.firstName && (
                <p className="text-red-500 text-sm">
                  {String(errors?.firstName?.message)}
                </p>
              )}
              <label htmlFor="" className="text-gray-700 block mb-1">
                Last Name
              </label>
              <input
                type="text"
                placeholder="Enter valid Last name"
                className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                {...register("lastName", {
                  required: "Last Name is required",
                  minLength: {
                    value: 2,
                    message: "Invalid Last Name",
                  },
                })}
              />
              {errors?.lastName && (
                <p className="text-red-500 text-sm">
                  {String(errors?.lastName?.message)}
                </p>
              )}

              <label htmlFor="" className="text-gray-700 block mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter valid email"
                className="w-full p-2 border border-gray-300 outline-0 rounded mb-1"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors?.email && (
                <p className="text-red-500 text-sm">
                  {String(errors?.email?.message)}
                </p>
              )}

              <label htmlFor="" className="text-gray-700 block mb-1">
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
                <p className="text-red-500 text-sm">
                  {String(errors?.password?.message)}
                </p>
              )}
              <div className="flex justify-between items-center my-4"></div>
              <button
                type="submit"
                disabled={singupMutation.isPending}
                className={`w-full py-2 !rounded cursor-pointer text-white hover:bg-pryBg ${
                  singupMutation.isPending ? "bg-gray-300" : "bg-black"
                }`}
              >
                {singupMutation.isPending ? "Signing up..." : "Register"}
              </button>

              {singupMutation?.isError &&
                singupMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {singupMutation.error?.response?.data?.message ||
                      singupMutation.error?.message}
                  </p>
                )}
            </form>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otp?.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 !rounded outline-none border border-gray-300 text-center"
                  />
                ))}
              </div>
              <button
                onClick={() => verifyOtpMutation.mutate()}
                disabled={verifyOtpMutation.isPending}
                className={`w-full mt-4 py-2 rounded-lg text-lg cursor-pointer text-white ${
                  verifyOtpMutation.isPending ? "bg-gray-300" : "bg-blue-500"
                }`}
              >
                {verifyOtpMutation.isPending ? "verifying otp.." : "Verify OTP"}
              </button>
              <p className="mt-4 text-center text-sm">
                {canResend ? (
                  <button
                    className="text-pryBg cursor-pointer"
                    onClick={resendOtp}
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${otpTimer}s`
                )}
              </p>
              {verifyOtpMutation?.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {verifyOtpMutation.error?.response?.data?.message ||
                      verifyOtpMutation.error?.message}
                  </p>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
