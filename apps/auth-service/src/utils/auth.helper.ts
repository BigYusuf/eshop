import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { NextFunction } from "express";
import { redis } from "@./db";
import { sendEmail } from "./sendMail";

// const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegisterData = (
  data: any,
  userType: "user" | "seller" | "admin" | "manager" | "editor" | "staff"
) => {
  const { name, email, country, phone_number, password } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError("Missing required fields!");
  }
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format!");
  }
};

export const checkOtpRestrictions = async (
  email: string,
  next: NextFunction
) => {
  const otp_lock = await redis.get(`otp_lock:${email}`);
  const otp_spam_lock = await redis.get(`otp_spam_lock:${email}`);
  const otp_cooldown = await redis.get(`otp_cooldown:${email}`);
  if (otp_lock) {
    return next(
      new ValidationError(
        "Account locked due to multiple failed attempts! Try again after 30 minutes"
      )
    );
  }
  if (otp_spam_lock) {
    return next(
      new ValidationError(
        "Too many OTP requests! Please wait an hour before requesting again."
      )
    );
  }
  if (otp_cooldown) {
    return next(
      new ValidationError("Please wait 1 miute before requesting a new OTP!")
    );
  }
};
export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = await redis.get(`otp_request_count:${email}`);
  let otpRequests = parseInt(otpRequestKey || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); // Locked for 1hour
    return next(
      new ValidationError(
        "Too many requests. Please wait 1 hour before requesting again"
      )
    );
  }
  await redis.set(`otp_request_count:${email}`, otpRequests + 1, "EX", 3600); // Track request for 1hour
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  //sendemail
  await sendEmail(email, "Verify Your Email", template, { name, otp });
  // set otp in redis db
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};

