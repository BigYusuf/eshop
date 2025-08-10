// register a new User

import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  checkOtpRestrictions,
  handleForgotPass,
  sendOtp,
  trackOtpRequests,
  validateRegisterData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import { User } from "@./db";
import { AuthError, ValidationError } from "../../../../packages/error-handler";
import { setCookie } from "../utils/cookies/setCookie";

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

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and Password are required!"));
    }
    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
      return next(new AuthError("Invalid Credential!"));
    }
    //verify paassword if user exist

    const isMatch = await bcrypt.compare(password, existingUser?.password);
    if (!isMatch) {
      return next(new AuthError("Invalid Credential!"));
    }
    //generate access & refresh token
    const accessToken = jwt.sign(
      { id: existingUser?.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { id: existingUser?.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    //store refresh & access token in httpOnly secure cookie
    setCookie(res, "refreshToken", refreshToken);
    setCookie(res, "accessToken", accessToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: existingUser?.id,
        email: existingUser?.email,
        firstName: existingUser?.firstName,
        lastName: existingUser?.lastName,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userType } = req.body;
  const uType = userType || "user";
  handleForgotPass(res, req, next, uType);
};

export const verifyUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyForgotPasswordOtp(res, req, next);
};

export const userResetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and new Password are required!"));
    }
    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
      return next(new ValidationError(`User not found`));
    }
    //compare new password with existing password
    const isSamePass = await bcrypt.compare(password, existingUser?.password);

    if (isSamePass) {
      return next(
        new ValidationError(
          `New password cannot be the same as the old password!`
        )
      );
    }
    //hash the new password

    const hashPassword = await bcrypt.hash(password, 10);

    await User.update(
      { password: hashPassword },
      { where: { email } } // or `id` or any other unique identifier
    );

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    next(error);
  }
};
