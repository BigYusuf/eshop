// register a new User

import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import {
  checkOtpRestrictions,
  sendOtp,
  trackOtpRequests,
  validateRegisterData,
  verifyOtp,
} from "../utils/auth.helper";
import { User } from "@./db";
import { ValidationError } from "../../../../packages/error-handler";


export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegisterData(req.body, "user");
    const { firstName, lastName, email } = req.body;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }
    const name = firstName + " " + lastName;
    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};

export const userVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp, firstName, lastName, email, password } = req.body;
    if (!email || !otp || !lastName || !firstName || !password) {
      return next(new ValidationError("All fields are required!"));
    }
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await verifyOtp(email, otp);

    const hashPassword = await bcrypt.hash(password, 10);

    await User.create({
      lastName,
      firstName,
      email,
      password: hashPassword,
    });

    res
      .status(201)
      .json({ success: true, message: "User registered successfully!" });
  } catch (error) {
    return next(error);
  }
};
