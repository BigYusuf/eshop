"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [canResend, setCanResend] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>();
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    formState: { errors: errorsPassword },
  } = useForm<{ password: string; cPassword: string }>();
  
  const password = watch("password");

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/forgot-password-user`,
        { email }
      );
      return response?.data;
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep("otp");
      setError(null);
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errMessage =
        (error?.response?.data as { message?: string })?.message ||
        "Invalid credential. Try again!";
      setError(errMessage);
    },
  });
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/verify-forgot-password-user`,
        { email: userEmail, otp: otp?.join("") }
      );
      return response?.data;
    },
    onSuccess: () => {
      setStep("reset");
      setError(null);
    },
    onError: (error: AxiosError) => {
      const errMessage =
        (error?.response?.data as { message?: string })?.message ||
        "Invalid OTP. Try again!";
      setError(errMessage);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/reset-password-user`,
        { email: userEmail, password }
      );
      return response?.data;
    },
    onSuccess: () => {
      setStep("email");
      toast.success(
        "Password reset successfully! Please login with your new password."
      );
      setError(null);
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      const errMessage =
        (error?.response?.data as { message?: string })?.message ||
        "Failed to reset password. Try again!";
      setError(errMessage);
    },
  });

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
  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };
  const onSubmitPassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password });
  };
  const resendOtp = () => {
    if (userEmail) {
      requestOtpMutation.mutate({ email: userEmail });
    }
  };
  return (
    <div className="w-full min-h-[85vh] py-10 bg-pryBg">
      <h1 className="text-4xl font-Poppins font-semibold text-black text-center">
        Forgot password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-black">
        Home . Forgot password
      </p>
      <div className="w-full flex justify-center">
        <div className="shadow p-8 md:w-[480px] bg-white rounded-lg">
          {step === "email" && (
            <>
              <h3 className="text-3xl font-semibold text-center mb-2">
                Login to Eshop
              </h3>
              <p className="text-center text-gray-500 mb-4">
                Go back to?{" "}
                <Link href={"/login"} className={"text-pryColor"}>
                  Login
                </Link>
              </p>

              <form onSubmit={handleSubmit(onSubmitEmail)}>
                <label htmlFor="" className="label-text">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter valid email"
                  className="input-1"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors?.email && (
                  <p className="error-text">
                    {String(errors?.email?.message)}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className={`w-full mt-4 py-2 rounded-lg text-lg cursor-pointer text-white ${
                    requestOtpMutation.isPending ? "bg-gray-300" : "bg-black"
                  }`}
                >
                  {requestOtpMutation.isPending ? "please wait..." : "Submit"}
                </button>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </form>
            </>
          )}
          {step === "otp" && (
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
                {verifyOtpMutation.isPending ? "verifying ..." : "Verify OTP"}
              </button>
              <p className="mt-4 text-center text-sm">
                {canResend ? (
                  <button
                    className="text-pryColor cursor-pointer"
                    onClick={resendOtp}
                  >
                    Resend OTP
                  </button>
                ) : (
                  `Resend OTP in ${otpTimer}s`
                )}
              </p>

              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              {/* {verifyOtpMutation?.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {verifyOtpMutation.error?.response?.data?.message ||
                      verifyOtpMutation.error?.message}
                  </p>
                )} */}
            </div>
          )}
          {step === "reset" && (
            <>
              <h3 className="text-3xl font-semibold text-center mb-2">
                Reset Password
              </h3>
              <form action="" onSubmit={handleSubmitPassword(onSubmitPassword)}>
                <label htmlFor="" className="label-text">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    className={`w-full p-2 border border-gray-300 outline-0 rounded mb-1 `}
                    {...registerPassword("password", {
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
                <label htmlFor="" className="label-text">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Retype Password"
                    className={`w-full p-2 border border-gray-300 outline-0 rounded mb-1 `}
                    {...registerPassword("cPassword", {
                      required: "Confirm Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                      validate: (value) =>
                        value === password || "Passwords do not match",
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
                {errorsPassword?.password && (
                  <p className="error-text">
                    {String(errorsPassword?.password?.message)}
                  </p>
                )}
                <div className="flex justify-between items-center my-4"></div>
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className={`w-full py-2 !rounded cursor-pointer text-white hover:bg-pryColor ${
                    resetPasswordMutation.isPending ? "bg-gray-300" : "bg-black"
                  }`}
                >
                  {resetPasswordMutation.isPending
                    ? "Resetting..."
                    : "Reset Password"}
                </button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                {/* {resetPasswordMutation?.isError &&
                                resetPasswordMutation.error instanceof AxiosError && (
                                  <p className="text-red-500 text-sm mt-2">
                                    {resetPasswordMutation.error?.response?.data?.message ||
                                      resetPasswordMutation.error?.message}
                                  </p>
                                )} */}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
