import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { NextFunction, Request, Response } from "express";
import { redis, Seller, User } from "@./db";
import { sendEmail } from "./sendMail";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegisterData = (
  data: any,
  userType: "user" | "seller" | "admin" | "manager" | "editor" | "staff"
) => {
  const { firstName,password, lastName, email, country, phoneNumber } = data;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    (userType === "seller" && (!phoneNumber || !country))
  ) {
    throw new ValidationError("Missing required fields!");
  }
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format!");
  }
};

export const checkOtpRestrictions = async (email: string) => {
  const otp_lock = await redis.get(`otp_lock:${email}`);
  const otp_spam_lock = await redis.get(`otp_spam_lock:${email}`);
  const otp_cooldown = await redis.get(`otp_cooldown:${email}`);
  if (otp_lock) {
    throw new ValidationError(
      "Account locked due to multiple failed attempts! Try again after 30 minutes"
    );
  }
  if (otp_spam_lock) {
    throw new ValidationError(
      "Too many OTP requests! Please wait an hour before requesting again."
    );
  }
  if (otp_cooldown) {
    throw new ValidationError(
      "Please wait 1 miute before requesting a new OTP!"
    );
  }
};
export const trackOtpRequests = async (email: string) => {
  const otpRequestKey = await redis.get(`otp_request_count:${email}`);
  let otpRequests = parseInt(otpRequestKey || "0");

  if (otpRequests >= 2) {
    await redis.set(`otp_spam_lock:${email}`, "locked", "EX", 3600); // Locked for 1hour
    throw new ValidationError(
      "Too many requests. Please wait 1 hour before requesting again"
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

export const verifyOtp = async (email: string, otp: string): Promise<void> => {
  const storedOtp = await redis.get(`otp:${email}`);
  if (!storedOtp) {
    throw new ValidationError("Invalid or expired OTP!");
  }

  const failedAttemptsKey = `otp_attempts:${email}`;
  const failedAttempts = parseInt((await redis.get(failedAttemptsKey)) || "0");

  if (storedOtp !== otp) {
    if (failedAttempts > 2) {
      await redis.set(`otp_lock:${email}`, "locked", "EX", 1800); // 30 mins
      await redis.del(`otp:${email}`, failedAttemptsKey);
      throw new ValidationError(
        "Too many failed attempts. Your account is locked for 30 minutes!"
      );
    }

    await redis.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
    throw new ValidationError(
      `Incorrect OTP. ${3 - failedAttempts} attempts left.`
    );
  }

  // On success, delete OTP and failed attempts
  await redis.del(`otp:${email}`, failedAttemptsKey);
};

export const handleForgotPass = async (
  res: Response,
  req: Request,
  next: NextFunction,
  uType: "user" | "seller" | "admin"
) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new ValidationError("Email is required!");
    }
    const existingUser =
      uType === "user"
        ? await User.findOne({ where: { email } })
        : await Seller.findOne({ where: { email } });

    if (!existingUser) {
      throw new ValidationError(`${uType} not found`);
    }
    //Check otp restrictions
    await checkOtpRestrictions(email);
    await trackOtpRequests(email);

    //generate Otp and send Email
    await sendOtp(
      existingUser?.firstName as string,
      email,
      uType === "user"
        ? "forgot-password-user-mail"
        : "forgot-password-seller-mail"
    );
    res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};
export const verifyForgotPasswordOtp = async (
  res: Response,
  req: Request,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      throw new ValidationError("Email and OTP are required!");
    }
    await verifyOtp(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP verified. You can now reset your password.",
    });
  } catch (error) {
    return next(error);
  }
};
