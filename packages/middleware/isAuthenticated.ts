import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import { Seller, Shop, User } from "@./db";
import { AuthError } from "@packages/error-handler";

export const isAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["accessToken"] ||
      req.cookies["sellerAccessToken"] ||
      req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized! Token missing." });
    }
    //verify token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as { id: string; role: "user" | "seller" | "admin" };

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized! Invalid token." });
    }
    let account;
    if (decoded?.role === "user") {
      account = await User.findOne({ where: { id: decoded?.id } });
      req.user = account;
    } else if (decoded?.role === "seller") {
      account = await Seller.findOne({
        where: { id: decoded?.id },
        // attributes: { exclude: ["password"] },
        include: [
          {
            model: Shop,
            as: "shop", // Must match the alias used in Seller.hasOne(...)
          },
        ],
      });
      req.seller = account;
    }
    if (!account) {
      return res.status(401).json({ message: "Account not found!" });
    }
    req.role = decoded?.role;

    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized! Token expired or invalid." });
  }
};

export const isSeller = async (req: any, res: Response, next: NextFunction) => {
  try {
    if(req.role ==="seller"){
      return next(new AuthError("Access denied: Seller only"))
    }
  } catch (error) {
    next(error);
  }
};

export const isUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (req.role === "user") {
      return next(new AuthError("Access denied: User only"));
    }
  } catch (error) {
    next(error);
  }
};