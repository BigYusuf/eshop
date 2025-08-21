import { NextFunction, Request, Response } from "express";

import { SubCategory, Category, DiscountCode } from "@./db";
import { NotFoundError, ValidationError } from "@packages/error-handler";
// import { AuthError, ValidationError } from "../../../../packages/error-handler";

//get product
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: SubCategory,
          as: "subcategories",
        },
      ],
      order: [["name", "ASC"]],
    });
    if (!categories) {
      return next(new NotFoundError("Category not found"));
    }
    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return next(error);
  }
};

export const createDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { publicName, discountValue, discountCode, discountType } = req.body;

    const existingDiscountCode = await DiscountCode.findOne({
      where: { discountCode },
    });

    if (existingDiscountCode) {
      return next(
        new ValidationError(
          "Discount code already available please use a different code!"
        )
      );
    }

    const data = await DiscountCode.create({
      publicName,
      discountCode,
      discountType,
      discountValue: parseFloat(discountValue),
      sellerId: req.seller.id,
    });

    res.status(201).json({
      success: true,
      discountCode: data,
      message: "DiscountCode created successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

//get discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discountCodes = await DiscountCode.findAll({
      where: [{ sellerId: req.seller.id }],
    });

    return res.status(200).json({
      success: true,
      discountCodes,
    });
  } catch (error) {
    return next(error);
  }
};

//delete discount code
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller?.id;

    const discountCode = await DiscountCode.findOne({
      where: { id },
      attributes: ["id", "sellerId"],
    });
    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError("Unauthorized access!"));
    }
    await DiscountCode.destroy({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Discount code deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

// get single discount code
export const getDiscountCodeById = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const discountCode = await DiscountCode.findOne({
      where: { id, sellerId: req.seller.id },
    });

    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }

    return res.status(200).json({
      success: true,
      discountCode,
    });
  } catch (error) {
    return next(error);
  }
};

// update discountcode
export const updateDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { publicName, discountValue, discountCode, discountType } = req.body;

    const existing = await DiscountCode.findOne({
      where: { id, sellerId: req.seller.id },
    });

    if (!existing) {
      return next(new NotFoundError("Discount code not found!"));
    }

    await existing.update({
      publicName: publicName ?? existing.publicName,
      discountCode: discountCode ?? existing.discountCode,
      discountType: discountType ?? existing.discountType,
      discountValue:
        discountValue !== undefined
          ? parseFloat(discountValue)
          : existing.discountValue,
    });

    return res.status(200).json({
      success: true,
      discountCode: existing,
      message: "Discount code updated successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

//apply /use discount code
export const applyDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, amount } = req.body; // `amount` = cart total

    const discount = await DiscountCode.findOne({
      where: { discountCode: code, sellerId: req.seller.id },
    });

    if (!discount) {
      return next(new NotFoundError("Invalid or expired discount code!"));
    }

    let finalAmount = amount;

    if (discount.discountType === "percentage") {
      finalAmount = amount - (amount * discount.discountValue) / 100;
    } else if (discount.discountType === "fixed") {
      finalAmount = amount - discount.discountValue;
    }

    return res.status(200).json({
      success: true,
      originalAmount: amount,
      discountApplied: discount.discountValue,
      finalAmount: Math.max(finalAmount, 0),
    });
  } catch (error) {
    return next(error);
  }
};

// create product
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    return next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const { otp, firstName, lastName, email, password } = req.body;
    // if (!email || !otp || !lastName || !firstName || !password) {
    //   return next(new ValidationError("All fields are required!"));
    // }
    // const existingUser = await User.findOne({ where: { email } });
  } catch (error) {
    return next(error);
  }
};

export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    return next(error);
  }
};

//get product
export const getProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
