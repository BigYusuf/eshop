import { NextFunction, Request, Response } from "express";

import { models } from "@./db";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagkit";
// import { AuthError, ValidationError } from "../../../../packages/error-handler";

//get product
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await models.Category.findAll({
      include: [
        {
          model: models.SubCategory,
          as: "sub_categories",
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

    const existingDiscountCode = await models.DiscountCode.findOne({
      where: { discountCode },
    });

    if (existingDiscountCode) {
      return next(
        new ValidationError(
          "Discount code already available please use a different code!"
        )
      );
    }

    const data = await models.DiscountCode.create({
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
    const discountCodes = await models.DiscountCode.findAll({
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

    const discountCode = await models.DiscountCode.findOne({
      where: { id },
      attributes: ["id", "sellerId"],
    });
    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError("Unauthorized access!"));
    }
    await models.DiscountCode.destroy({
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

    const discountCode = await models.DiscountCode.findOne({
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

    const existing = await models.DiscountCode.findOne({
      where: { id, sellerId: req.seller.id },
    });

    if (!existing) {
      return next(new NotFoundError("Discount code not found!"));
    }

    const updated = await existing.update({
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
      discountCode: updated,
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

    const discount = await models.DiscountCode.findOne({
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

// upload product image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body; // base64 string

    // Detect file type from base64 prefix
    const matches = fileName.match(/^data:(image\/\w+);base64,/);
    const mimeType = matches ? matches[1] : "image/jpeg"; // default to jpeg
    const extension = mimeType.split("/")[1]; // e.g. png, jpeg, webp

    const response = await imagekit.upload({
      file: fileName, // base64 string
      fileName: `product-${Date.now()}.${extension}`, // use correct extension
      folder: "/products",
    });

    res.status(201).json({
      success: true,
      fileId: response.fileId,
      fileUrl: response.url,
    });
  } catch (error) {
    next(error);
  }
};

// delete product image
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;
    const response = await imagekit.deleteFile(fileId);
    res.status(201).json({
      success: true,
      response,
    });
  } catch (error) {
    next(error);
  }
};

// create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      shortDescription,
      detailedDescription,
      warranty,
      customSpecification,
      slug,
      tags,
      cashOnDelivery,
      brand,
      videoUrl,
      categoryId,
      subCategoryId,
      colors = [],
      sizes = [],
      stock,
      salePrice,
      regularPrice,
      customProperties = {},
      images = [], // expect [{ fileId, url }]
    } = req.body;

    // Required fields
    if (
      !title ||
      !slug ||
      !shortDescription ||
      !categoryId ||
      !subCategoryId ||
      !salePrice ||
      !tags ||
      !stock ||
      !regularPrice
    ) {
      return next(new ValidationError("Missing required fields"));
    }

    // Ensure only sellers can create products
    if (!req.seller?.id) {
      return next(new AuthError("Only seller can create products!"));
    }

    // Ensure slug is unique
    const slugChecking = await models.Product.findOne({ where: { slug } });
    if (slugChecking) {
      return next(
        new ValidationError(
          "Product slug already exists, please use a different one!"
        )
      );
    }

    // Create product
    const product = await models.Product.create({
      title,
      shortDescription,
      detailedDescription,
      warranty,
      slug,
      tags: Array.isArray(tags) ? tags : tags.split(","),
      cashOnDelivery,
      brand,
      videoUrl,
      colors: colors || [],
      sizes: sizes || [],
      stock: parseInt(stock),
      salePrice: parseFloat(salePrice),
      regularPrice: parseFloat(regularPrice),
      customProperties: customProperties || {},
      customSpecification: customSpecification || {},
      sellerId: req.seller.id,
      categoryId,
      subCategoryId,
    });

    // Link images to product
    if (Array.isArray(images) && images.length > 0) {
      const imageRecords = images
        .filter((img: any) => img && img.fileId && img.fileUrl) // remove null/invalid
        .map((img: any) => ({
          fileId: img.fileId,
          url: img.fileUrl,
          productId: product.id,
        }));

      if (imageRecords.length > 0) {
        await models.Image.bulkCreate(imageRecords);
      }
    }

    // Fetch with relations
    const createdProduct = await models.Product.findByPk(product.id, {
      include: [
        { model: models.Image, as: "images" },
        { model: models.Category, as: "category" },
        { model: models.SubCategory, as: "subCategory" },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      createdProduct,
    });
  } catch (error) {
    return next(error);
  }
};

// update product
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

// delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req?.seller?.id;

    const product = await models.Product.findOne({
      where: { id: productId },
      attributes: ["id", "sellerId", "deletedAt"],
      // paranoid: false, // 👈 include soft-deleted rows
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (sellerId !== product?.sellerId) {
      return next(new ValidationError("Unauthorized action"));
    }
    if (product.isDeleted) {
      return next(new ValidationError("Product is already deleted!"));
    }

    const deletedProduct: any = await models.Product.update(
      {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // schedule delete in 24h
      },
      {
        where: { id: productId },
      }
    );
    return res.status(200).json({
      status: true,
      message:
        "Product is scheduled for deletion in 24 hours, You can restore it within this time",
      deleteAt: deletedProduct.deleteAt,
    });
  } catch (error) {
    return next(error);
  }
};
// restore product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req?.seller?.id;

    const product = await models.Product.findOne({
      where: { id: productId },
      attributes: ["id", "deletedAt", "sellerId"],
    });

    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (sellerId !== product?.sellerId) {
      return next(new ValidationError("Unauthorized action"));
    }
    if (product.isDeleted) {
      return next(new ValidationError("Product is not in deleted state!"));
    }

    await models.Product.update(
      {
        isDeleted: false,
        deletedAt: null, // remove date
      },
      {
        where: { id: productId },
      }
    );
    return res.status(200).json({
      status: true,
      message: "Product successfully restored!",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error restoring product!",
    });
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

export const getSellerProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await models.Product.findAll({
      where: [{ sellerId: req.seller.id }],
      include: [
        { model: models.Image, as: "images" },
        { model: models.Category, as: "category" },
        { model: models.SubCategory, as: "subCategory" },
      ],
    });
    res.status(200).json({
      success: true,
      products,
      message: "Seller Products retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
