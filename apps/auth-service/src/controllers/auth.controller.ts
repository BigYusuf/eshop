// register a new User

import { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import {
  checkOtpRestrictions,
  handleForgotPass,
  sendOtp,
  trackOtpRequests,
  validateRegisterData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import { models } from "@./db";
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

    const existingUser = await models.User.findOne({ where: { email } });

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
    const existingUser = await models.User.findOne({ where: { email } });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await verifyOtp(email, otp);

    const hashPassword = await bcrypt.hash(password, 10);

    await models.User.create({
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
    const existingUser = await models.User.findOne({ where: { email } });

    if (!existingUser) {
      return next(new AuthError("Invalid Credential!"));
    }

    // Verify paassword if user exist
    const isMatch = await bcrypt.compare(password, existingUser?.password);
    if (!isMatch) {
      return next(new AuthError("Invalid Credential!"));
    }

    // Clear seller tokens
    res.clearCookie("sellerAccessToken");
    res.clearCookie("sellerRefreshToken");

    // Generate access & refresh token
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

export const refreshTokenAuth = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken =
      req.cookies["refreshToken"] ||
      req.cookies["sellerRefreshToken"] ||
      req.headers?.authorization?.split(" ")[1];

    if (!refreshToken) {
      return next(new ValidationError("Unauthorized! No refresh token."));
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new JsonWebTokenError("Forbidden! Invalid refresh token."));
    }
    let account;
    if (decoded?.role === "user") {
      account = await models.User.findOne({ where: { id: decoded?.id } });
    } else if (decoded?.role === "seller") {
      account = await models.Seller.findOne({ where: { id: decoded?.id } });
    }
    if (!account) {
      return next(new AuthError("Forbidden! User/Seller not found"));
    }
    const newAccessToken = jwt.sign(
      { id: decoded?.id, role: decoded?.role },
      process?.env?.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );
    if (decoded?.role === "user") {
      setCookie(res, "accessToken", newAccessToken);
    } else if (decoded?.role === "seller") {
      setCookie(res, "sellerAccessToken", newAccessToken);
    }
    req.role = decoded?.role;

    return res.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

//get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    res
      .status(201)
      .json({ success: true, message: "User data fetched!", user });
  } catch (error) {
    next(error);
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
    const existingUser = await models.User.findOne({ where: { email } });

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

    await models.User.update(
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

// register new seller
export const sellerRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegisterData(req.body, "seller");
    const { firstName, lastName, email } = req.body;

    const existingSeller = await models.Seller.findOne({ where: { email } });

    if (existingSeller) {
      return next(
        new ValidationError("Seller already exists with this email!")
      );
    }
    const name = firstName + " " + lastName;
    await checkOtpRestrictions(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, "seller-activation-mail");

    res.status(200).json({
      success: true,
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

export const sellerVerify = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp, firstName, lastName, email, password, phoneNumber, country } =
      req.body;
    if (
      !email ||
      !otp ||
      !lastName ||
      !firstName ||
      !password ||
      !country ||
      !phoneNumber
    ) {
      return next(new ValidationError("All fields are required!"));
    }
    const existingSeller = await models.Seller.findOne({ where: { email } });

    if (existingSeller) {
      return next(
        new ValidationError("Seller already exists with this email!")
      );
    }

    await verifyOtp(email, otp);

    const hashPassword = await bcrypt.hash(password, 10);

    const seller = await models.Seller.create({
      lastName,
      firstName,
      email,
      country,
      phoneNumber,
      password: hashPassword,
    });

    res.status(201).json({
      success: true,
      seller,
      message: "Seller registered successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      description,
      name,
      address,
      category,
      openingHours,
      sellerId,
      website,
    } = req.body;
    if (
      !category ||
      !description ||
      !address ||
      !name ||
      !openingHours ||
      !sellerId
    ) {
      return next(new ValidationError("All fields are required!"));
    }
    const existingShop = await models.Shop.findOne({ where: { sellerId } });

    if (existingShop) {
      return next(new ValidationError("This Seller already has a Shop!"));
    }
    const shopData: any = {
      description,
      name,
      address,
      category,
      openingHours,
      sellerId,
    };
    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await models.Shop.create(shopData);

    res.status(201).json({
      success: true,
      shop,
      message: "Shop created successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

export const connectBank = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError("Seller ID is required"));
    }
    const existingShop = await models.Shop.findOne({ where: { id: sellerId } });

    if (existingShop) {
      return next(new ValidationError("Seller is not available with this id!"));
    }
  } catch (error) {
    next(error);
  }
};

export const sellerLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and Password are required!"));
    }
    const existingSeller = await models.Seller.findOne({ where: { email } });

    if (!existingSeller) {
      return next(new AuthError("Invalid Credential!"));
    }
    //verify paassword if user exist

    const isMatch = await bcrypt.compare(password, existingSeller?.password);
    if (!isMatch) {
      return next(new AuthError("Invalid Credential!"));
    }

    //clear user tokens
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    //generate access & refresh token
    const accessToken = jwt.sign(
      { id: existingSeller?.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      { id: existingSeller?.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      }
    );
    //store refresh & access token in httpOnly secure cookie
    setCookie(res, "sellerRefreshToken", refreshToken);
    setCookie(res, "sellerAccessToken", accessToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: existingSeller?.id,
        email: existingSeller?.email,
        firstName: existingSeller?.firstName,
        lastName: existingSeller?.lastName,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//get logged in user
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const seller = req.seller;

    res
      .status(201)
      .json({ success: true, message: "Seller data fetched!", seller });
  } catch (error) {
    next(error);
  }
};

//follow shop

export const followShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;
    const userId = req?.user?.id; // assuming user is authenticated

    // check if already following
    const existing = await models.ShopFollower.findOne({
      where: { userId, shopId },
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Already following this shop" });
    }

    const follow = await models.ShopFollower.create({ userId, shopId });

    await models.Shop.increment("followerCount", {
      by: 1,
      where: { id: shopId },
    });
    return res.status(201).json({
      success: true,
      follow,
      message: "Shop followed successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const unfollowShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;
    const userId = req.user.id;

    const existing = await models.ShopFollower.findOne({
      where: { userId, shopId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "You are not following this shop" });
    }

    await existing.destroy();

    await models.Shop.decrement("followerCount", {
      by: 1,
      where: { id: shopId },
    });

    res.status(200).json({
      success: true,
      message: "Unfollowed shop successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const getFollowedShops = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const follows = await models.ShopFollower.findAll({
      where: { userId },
      include: [
        {
          model: models.Shop,
          as: "shop",
          include: [{ model: models.Image, as: "logo", attributes: ["url"] }],
        },
      ],
    });

    res.status(200).json({
      success: true,
      shops: follows.map((f) => f?.shop),
    });
  } catch (error) {
    next(error);
  }
};

export const getShopFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.params;

    const followers = await models.ShopFollower.findAll({
      where: { shopId },
      include: [
        {
          model: models.User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email", "avatar"], // adjust to your User model
        },
      ],
    });

    res.status(200).json({
      success: true,
      followers: followers.map((f) => f?.user),
      count: followers.length,
      message: "Followers retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const createUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.user?.id;
    const { label, name, street, city, state, zip, country, isDefault } =
      req.body;
    if (!label || !name || !street || !city || !state || !zip || !country) {
      return next(new ValidationError("All fieds required"));
    }
    // Optional: unset other defaults if this is new default
    if (isDefault) {
      await models?.Address.update({ isDefault: false }, { where: { userId } });
    }

    const address = await models?.Address.create({
      userId,
      label,
      name,
      street,
      city,
      state,
      zip,
      country,
      isDefault,
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    next(error);
  }
};

export const getUserAddresses = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.user?.id;

    const addresses = await models?.Address.findAll({
      where: { userId },
      order: [
        ["isDefault", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

export const updateUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req?.user?.id;
    const { isDefault, ...rest } = req.body;

    // If setting this address as default → clear all others first
    if (isDefault === true || isDefault === "true") {
      await models.Address.update({ isDefault: false }, { where: { userId } });
    }

    const [updated] = await models.Address.update(
      { ...rest, isDefault },
      { where: { id, userId } }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    const address = await models.Address.findByPk(id);
    res.json({ success: true, address });
  } catch (error) {
    return next(error);
  }
};

export const deleteUserAddress = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req?.user?.id;

    const deleted = await models?.Address.destroy({ where: { id, userId } });

    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });

    res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    return next(error);
  }
};
