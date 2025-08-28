import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import { models } from "@./db";
import { AuthError } from "../../packages/error-handler";

export const isAuth = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies["accessToken"] ||
      req.cookies["sellerAccessToken"] ||
      req.headers?.authorization?.split(" ")[1];

    if (!token) {
      console.log("no token");
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
      account = await models.User.findOne({
        where: { id: decoded?.id },
        attributes: { exclude: ["password"] },
      });
      req.user = account;
    } else if (decoded?.role === "seller") {
      account = await models.Seller.findOne({
        where: { id: decoded?.id },
        attributes: { exclude: ["password"] },
        include: [
          {
            model: models.Shop,
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
    if (req.role !== "seller") {
      return next(new AuthError("Access denied: Seller only"));
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const isUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (req.role !== "user") {
      return next(new AuthError("Access denied: User only"));
    }
    next();
  } catch (error) {
    next(error);
  }
};
