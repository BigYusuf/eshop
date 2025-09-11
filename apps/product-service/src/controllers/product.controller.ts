import { NextFunction, Request, Response } from "express";

import { models } from "@./db";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagkit";
// import { AuthError, ValidationError } from "../../../../packages/error-handler";

// Extend Request type to include seller
interface AuthenticatedRequest extends Request {
  seller?: { id: string; shop: { id?: string } };
}

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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { publicName, discountValue, discountCode, discountType, shopId } =
      req.body;

    if (!discountCode || !discountValue || !discountType) {
      return next(new ValidationError("Missing required fields"));
    }

    // normalize discountCode
    const code = discountCode.trim().toUpperCase();

    // check existing
    const existingDiscountCode = await models.DiscountCode.findOne({
      where: { discountCode: code },
    });

    if (existingDiscountCode) {
      return next(
        new ValidationError(
          "Discount code already exists. Please use a different one."
        )
      );
    }

    // ensure value is number
    const parsedValue = parseFloat(discountValue);
    if (isNaN(parsedValue)) {
      return next(new ValidationError("Discount value must be a number"));
    }

    const data = await models.DiscountCode.create({
      publicName,
      discountCode: code,
      discountType,
      discountValue: parsedValue,
      shopId: shopId || req.seller?.shop?.id, // fallback if discounts tied to shops
    });

    res.status(201).json({
      success: true,
      discountCode: data,
      message: "Discount code created successfully!",
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
      where: { shopId: req.seller?.shop?.id },
      include: [
        { model: models.Shop, as: "shop", attributes: ["id", "name"] },
        {
          model: models.Event,
          as: "events",
          attributes: ["id", "name", "startingDate", "endingDate"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      discountCodes,
      message: " Discount codes retrieved successfully",
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
    const shopId = req.seller?.shop?.id;

    const discountCode = await models.DiscountCode.findOne({
      where: { id },
      attributes: ["id", "sellerId"],
    });
    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }

    if (discountCode.shopId !== shopId) {
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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const discountCode = await models.DiscountCode.findOne({
      where: { id, shopId: req.seller?.shop?.id },
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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { publicName, discountValue, discountCode, discountType } = req.body;

    const existing = await models.DiscountCode.findOne({
      where: { id, shopId: req.seller?.shop?.id },
      attributes: [
        "id",
        "publicName",
        "discountValue",
        "discountCode",
        "discountType",
        "shopId",
      ],
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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, amount } = req.body; // `amount` = cart total

    const discount = await models.DiscountCode.findOne({
      where: { discountCode: code, shopId: req?.seller?.shop?.id },
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
      isFeatured,
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
      shopId: req?.seller?.shop?.id,
      categoryId,
      isFeatured: isFeatured || false,
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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const shopId = req?.seller?.shop?.id;

    const product = await models.Product.findOne({
      where: { id: productId },
      attributes: ["id", "shopId", "deletedAt"],
      // paranoid: false, // 👈 include soft-deleted rows
    });
    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (shopId !== product?.shopId) {
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
    const shopId = req?.seller?.shop?.id;

    const product = await models.Product.findOne({
      where: { id: productId },
      attributes: ["id", "deletedAt", "sellerId"],
    });

    if (!product) {
      return next(new ValidationError("Product not found"));
    }
    if (shopId !== product?.shopId) {
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
    const { productId } = req.params;

    const product = await models.Product.findOne({
      where: { id: productId, isDeleted: false },
      include: [
        { model: models.Image, as: "images" },
        { model: models.Category, as: "category" },
        { model: models.SubCategory, as: "subCategory" },
      ],
    });

    if (!product) {
      return next(new NotFoundError("Product not found"));
    }

    // // increment views
    // product.views += 1;
    await product.save();

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.seller?.shop?.id) {
      return next(new ValidationError("No shop associated with this seller"));
    }
    const products = await models.Product.findAll({
      where: { shopId: req?.seller?.shop?.id },
      include: [
        { model: models.Image, as: "images" },
        { model: models.Category, as: "category" },
        { model: models.SubCategory, as: "subCategory" },
      ],
    });
    console.log("prod", products);
    res.status(200).json({
      success: true,
      products,
      message: "Shop Products retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number.isNaN(Number(req.query.page))
      ? 1
      : parseInt(req.query.page as string);
    const limit = Number.isNaN(Number(req.query.limit))
      ? 20
      : parseInt(req.query.limit as string);
    const offset = (page - 1) * limit;
    const type = req.query.type as string;

    const categoryId = req.query.categoryId as string;
    const subCategoryId = req.query.subCategoryId as string;

    // shared includes
    const include = [
      {
        model: models.Shop,
        as: "shop",
        // attributes: ["id", "name", "description","ratings"], // pick only what you need
        include: [{ model: models.Image, as: "logo", attributes: ["url"] }],
      },
      { model: models.Event, as: "events" },
      { model: models.Image, as: "images" },
      { model: models.Category, as: "category" },
      { model: models.SubCategory, as: "subCategory" },
    ];

    // dynamic ordering
    let order: any = [["totalSales", "DESC"]];
    if (type === "new") order = [["createdAt", "DESC"]];
    if (type === "featured")
      order = [
        ["isFeatured", "DESC"],
        ["createdAt", "DESC"],
      ];
    if (type === "popular") order = [["views", "DESC"]];

    // build where clause dynamically
    const where: any = { isDeleted: false };
    if (categoryId) where.categoryId = categoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;

    // main paginated query
    const { count, rows: products } = await models.Product.findAndCountAll({
      where,
      include,
      limit,
      offset,
      order,
    });

    // top10 query (ignores pagination but still respects filters)
    const top10Products = await models.Product.findAll({
      where,
      include,
      limit: 10,
      order,
    });

    res.status(200).json({
      success: true,
      products,
      top10Products,
      pagination: {
        top10By: type || "topSales",
        skip: offset,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};
