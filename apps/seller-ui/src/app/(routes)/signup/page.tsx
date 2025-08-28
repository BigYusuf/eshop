"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { countryList } from "../../../data/countries";
import CreateShop from "../../../shared/modules/auth/create-shop";
import FormField from "../../../shared/components/form-field";
import SubmitButton from "apps/seller-ui/src/shared/components/submit-btn";
import BankIcon from "apps/seller-ui/src/shared/widgets/bank-icon";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  country: string;
};

const RegisterPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [canResend, setCanResend] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  // const [sellerId, setSellerId] = useState<string>(
  //   "a6e1ef2a-9610-4e5c-b769-523e61e9a1f5"
  // );
  const [sellerId, setSellerId] = useState<string>("");

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
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/seller-register`,
        data
      );
      return response?.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);
      setOtpTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/auth/seller-verify`,
        { ...sellerData, otp: otp?.join("") }
      );
      return response?.data;
    },
    onSuccess: (data) => {
      setActiveStep(2);
      setSellerId(data?.seller?.id);
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
    if (sellerData) {
      singupMutation.mutate(sellerData);
    }
  };
  const connectAccount = () => {
    router.push("/login")
  };

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen">
      {/* Stepper */}
      <div className="relative flex justify-between items-center md:w-[50%] mb-8">
        <div className="absolute top-[25%] left-0 w-[80%] md:w-[90%] h-1 -z-10 bg-gray-300" />
        {[1, 2, 3].map((step) => (
          <div className="" key={step}>
            <div
              className={`w-10 h-10 flex rounded-full justify-center font-bold items-center text-white ${
                step <= activeStep ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              {step}
            </div>
            <span className="ml-[-15px]">
              {step === 1
                ? "Create Account"
                : step === 2
                ? "Setup Shop"
                : "Connect Bank"}
            </span>
          </div>
        ))}
      </div>
      {/* Steps content */}
      <div className="md:w-[480px] p-8 bg-white shadow rounded-lg">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h3 className="text-3xl font-semibold text-center mb-2">
                  Create Account
                </h3>
                <FormField<FormData>
                  label="First Name"
                  name="firstName"
                  type="text"
                  register={register}
                  errors={errors}
                  rules={{
                    required: "First name is required",
                    minLength: { value: 3, message: "Invalid First name" },
                  }}
                  placeholder="Enter your first name"
                />
                <FormField<FormData>
                  label="Last Name"
                  name="lastName"
                  type="text"
                  register={register}
                  errors={errors}
                  rules={{
                    required: "Last name is required",
                    minLength: { value: 3, message: "Invalid Last name" },
                  }}
                  placeholder="Enter your last name"
                />
                <FormField<FormData>
                  label="Email"
                  name="email"
                  type="email"
                  register={register}
                  errors={errors}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value:
                        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                      message: "Invalid email address",
                    },
                  }}
                  placeholder="Enter valid email"
                />

                <FormField<FormData>
                  label="Phone Number"
                  name="phoneNumber"
                  type="text"
                  register={register}
                  errors={errors}
                  rules={{
                    required: "Phone Number is required",
                    pattern: {
                      value: /^\+?[1-9]\d{1,14}$/,
                      message: "Invalid Phone Number",
                    },
                    minLength: {
                      value: 10,
                      message: "Phone number must be at least 10 digits",
                    },
                  }}
                  placeholder="Enter valid Phone Number"
                />
                <FormField<FormData>
                  label="Country"
                  name="country"
                  as="select"
                  labelKey={"name"}
                  valueKey={"country_code"}
                  placeholder="Select Country"
                  options={countryList}
                  includePlaceholder
                  register={register}
                  errors={errors}
                  rules={{ required: "Please select a country" }}
                />
                <FormField<FormData>
                  label="Password"
                  name="password"
                  type="password"
                  register={register}
                  errors={errors}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  }}
                  placeholder="Min. 6 characters"
                />
                <SubmitButton
                  isLoading={singupMutation.isPending}
                  btnText="Register"
                  variant="black"
                  loadingText="Signing up..."
                />

                {singupMutation?.isError &&
                  singupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {singupMutation.error?.response?.data?.message ||
                        singupMutation.error?.message}
                    </p>
                  )}
                <p className="text-center text-gray-500 font-semibold mt-4">
                  Already have an account?{" "}
                  <Link href={"/login"} className={"text-pryColor"}>
                    Login
                  </Link>
                </p>
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
                  {verifyOtpMutation.isPending
                    ? "verifying otp.."
                    : "Verify OTP"}
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
                {verifyOtpMutation?.isError &&
                  verifyOtpMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {verifyOtpMutation.error?.response?.data?.message ||
                        verifyOtpMutation.error?.message}
                    </p>
                  )}
              </div>
            )}
          </>
        )}
        {activeStep === 2 && (
          <CreateShop setActiveStep={setActiveStep} sellerId={sellerId} />
        )}
        {activeStep === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Withdrawal Method</h3>
            <br />
            <button
              onClick={connectAccount}
              className="w-full m-auto flex items-center justify-center gap-3 text-lg bg-[#334155] text-white py-2 rounded-lg"
            >
              <BankIcon /> Connect Bank
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
