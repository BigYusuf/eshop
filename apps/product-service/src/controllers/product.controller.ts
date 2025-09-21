import { NextFunction, Request, Response } from "express";

import { models } from "@./db";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "@packages/error-handler";
import { imagekit } from "@packages/libs/imagkit";
import { Op } from "sequelize";
import { recalcRatings } from "../utils/recal";

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

export const getProductDetails = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const product = await models.Product.findOne({
      where: { slug: slug, isDeleted: false },
      include: [
        {
          model: models.Shop,
          as: "shop",
          attributes: ["id", "name", "description", "ratings", "openingHours"], // pick only what you need
          include: [
            { model: models.Image, as: "logo", attributes: ["url"] },
            { model: models.Seller, as: "seller" },
          ],
        },
        { model: models.Event, as: "events" },
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
    // await product.save();

    res.status(200).json({
      success: true,
      product,
      message: "Product retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// get filtered products
export const getFilteredProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = "0,10000",
      categories,
      colors,
      sizes,
      page = "1",
      limit = "22",
    } = req.query;

    const parsedPriceRange = String(priceRange).split(",").map(Number);
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Number(limit) || 22);
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: any = {
      salePrice: {
        [Op.gte]: parsedPriceRange[0],
        [Op.lte]: parsedPriceRange[1],
      },
    };

    if (categories) {
      const parsedCategories = Array.isArray(categories)
        ? categories
        : String(categories).split(",").filter(Boolean); // remove ""

      if (parsedCategories.length > 0) {
        filters.categoryId = {
          [Op.in]: parsedCategories,
        };
      }
    }

    if (colors) {
      const parsedColors = Array.isArray(colors)
        ? colors
        : String(colors).split(",").filter(Boolean);

      if (parsedColors.length > 0) {
        filters.colors = { [Op.overlap]: parsedColors };
      }
    }

    if (sizes) {
      const parsedSizes = Array.isArray(sizes)
        ? sizes
        : String(sizes).split(",").filter(Boolean);

      if (parsedSizes.length > 0) {
        filters.sizes = { [Op.overlap]: parsedSizes };
      }
    }

    const include = [
      {
        model: models.Shop,
        as: "shop",
        include: [{ model: models.Image, as: "logo", attributes: ["url"] }],
      },
      { model: models.Event, as: "events" },
      { model: models.Image, as: "images" },
      { model: models.Category, as: "category" },
      { model: models.SubCategory, as: "subCategory" },
    ];

    const { count, rows: products } = await models.Product.findAndCountAll({
      where: filters,
      include,
      limit: parsedLimit,
      offset: skip,
    });

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total: count,
        page: parsedPage,
        totalPages: Math.ceil(count / parsedLimit),
      },
      message: "Products retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// get filtered offers
export const getFilteredEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = "0,10000",
      categories,
      colors,
      sizes,
      page = "1",
      limit = "22",
    } = req.query;

    const parsedPriceRange = String(priceRange).split(",").map(Number);
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Number(limit) || 22);
    const skip = (parsedPage - 1) * parsedLimit;

    // Filters for events
    const eventFilters: any = {
      startingDate: { [Op.not]: null }, // only events with a date
    };

    // Product-related filters (applied when joining products)
    const productFilters: any = {
      salePrice: {
        [Op.gte]: parsedPriceRange[0],
        [Op.lte]: parsedPriceRange[1],
      },
    };

    if (categories) {
      productFilters.categoryId = {
        [Op.in]: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (colors) {
      productFilters.colors = {
        [Op.overlap]: Array.isArray(colors) ? colors : [colors],
      };
    }

    if (sizes) {
      productFilters.sizes = {
        [Op.overlap]: Array.isArray(sizes) ? sizes : [sizes],
      };
    }

    // Includes: shop, products (through pivot), discountCodes
    const include = [
      {
        model: models.Shop,
        as: "shop",
        include: [{ model: models.Image, as: "logo", attributes: ["url"] }],
      },
      {
        model: models.Product,
        as: "products",
        through: { attributes: [] }, // hide pivot fields
        where: productFilters, // apply product filters
        required: true, // ensures events must have products matching filters
        include: [
          { model: models.Image, as: "images" },
          { model: models.Category, as: "category" },
          { model: models.SubCategory, as: "subCategory" },
        ],
      },
      { model: models.DiscountCode, as: "discountCodes" },
    ];

    const { count, rows: events } = await models.Event.findAndCountAll({
      where: eventFilters,
      include,
      limit: parsedLimit,
      offset: skip,
      distinct: true, // ensures proper count when joining many products
    });

    res.status(200).json({
      success: true,
      events,
      pagination: {
        total: count,
        page: parsedPage,
        totalPages: Math.ceil(count / parsedLimit),
      },
      message: "Events retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

//get filtered shops
export const getFilteredShops = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = "0,10000",
      categories,
      countries,
      page = "1",
      limit = "12",
    } = req.query;

    const parsedPriceRange = String(priceRange).split(",").map(Number);
    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Number(limit) || 12);
    const skip = (parsedPage - 1) * parsedLimit;

    // Filters for shops
    const shopFilters: any = {};

    if (categories) {
      shopFilters.category = {
        [Op.in]: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (countries) {
      shopFilters["$seller.country$"] = {
        [Op.in]: Array.isArray(countries)
          ? countries
          : String(countries).split(","),
      };
    }

    // Product-related filters
    const productFilters: any = {
      salePrice: {
        [Op.gte]: parsedPriceRange[0],
        [Op.lte]: parsedPriceRange[1],
      },
    };

    // Includes: seller, products, logo/banner, reviews, socialLinks, etc.
    const include = [
      {
        model: models.Seller,
        as: "seller",
        attributes: ["id", "firstName", "lastName", "email", "country"],
        include: [{ model: models.Image, as: "avatar", attributes: ["url"] }],
      },
      {
        model: models.Product,
        as: "products",
        where: productFilters,
        required: false, // shop can still show even if no product matches filter
        include: [
          { model: models.Image, as: "images" },
          { model: models.Category, as: "category" },
          { model: models.SubCategory, as: "subCategory" },
        ],
      },
      { model: models.Image, as: "logo", attributes: ["url"] },
      { model: models.Image, as: "banner", attributes: ["url"] },
      { model: models.ShopReview, as: "shop_reviews" },
      { model: models.ShopSocialLink, as: "socialLinks" },
      { model: models.Event, as: "events" },
      { model: models.DiscountCode, as: "discountCodes" },
    ];

    const { count, rows: shops } = await models.Shop.findAndCountAll({
      where: shopFilters,
      include,
      limit: parsedLimit,
      offset: skip,
      distinct: true, // ✅ ensures count isn’t inflated by product joins
    });

    res.status(200).json({
      success: true,
      shops,
      pagination: {
        total: count,
        page: parsedPage,
        totalPages: Math.ceil(count / parsedLimit),
      },
      message: "Shops retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

//search product
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      query = "",
      page = "1",
      limit = "20",
    } = req.query as { query?: string; page?: string; limit?: string };

    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Number(limit) || 20);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build search filter
    const filters: any = {
      isDeleted: false,
      status: "active",
    };

    if (query) {
      filters[Op.or] = [
        { title: { [Op.iLike]: `%${query}%` } },
        { brand: { [Op.iLike]: `%${query}%` } },
        { shortDescription: { [Op.iLike]: `%${query}%` } },
        { detailedDescription: { [Op.iLike]: `%${query}%` } },
        { tags: { [Op.overlap]: [query.toLowerCase()] } }, // tags array
      ];
    }

    const include = [
      {
        model: models.Shop,
        as: "shop",
        include: [{ model: models.Image, as: "logo", attributes: ["url"] }],
      },
      { model: models.Image, as: "images" },
      { model: models.Category, as: "category" },
      { model: models.SubCategory, as: "subCategory" },
      { model: models.Event, as: "events" },
      { model: models.ProductReview, as: "product_reviews" },
      { model: models.DiscountCode, as: "discountCodes" },
    ];

    const { count, rows: products } = await models.Product.findAndCountAll({
      where: filters,
      include,
      limit: parsedLimit,
      offset: skip,
      distinct: true, // ✅ avoids inflated count due to includes
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total: count,
        page: parsedPage,
        totalPages: Math.ceil(count / parsedLimit),
      },
      message: "Products retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

//top shops
export const getTopShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      page = "1",
      limit = "10",
      sortBy = "followerCount", // 👈 default sort
      order = "DESC", // DESC = highest first
    } = req.query as {
      page?: string;
      limit?: string;
      sortBy?: string;
      order?: string;
    };

    const parsedPage = Math.max(1, Number(page) || 1);
    const parsedLimit = Math.max(1, Number(limit) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // ✅ allowed fields for sorting
    const validSortFields = [
      "followerCount",
      "ratings",
      "reviewCount",
      "topSales",
    ];
    const sortField = validSortFields.includes(sortBy!)
      ? sortBy!
      : "followerCount";

    const { count, rows: shops } = await models.Shop.findAndCountAll({
      include: [
        { model: models.Image, as: "logo", attributes: ["url"] },
        { model: models.Image, as: "banner", attributes: ["url"] },
        {
          model: models.Product,
          as: "products",
          attributes: [
            "id",
            "title",
            "salePrice",
            "totalSales",
            "averageRating",
          ],
        },
      ],
      limit: parsedLimit,
      offset: skip,
      order: [[sortField, order as string]],
    });

    res.status(200).json({
      success: true,
      shops,
      pagination: {
        total: count,
        page: parsedPage,
        totalPages: Math.ceil(count / parsedLimit),
      },
      message: "Top shops retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// 👉 Create review
export const createReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, rating, review } = req.body;
    const userId = req.user.id;

    const existing = await models.ProductReview.findOne({
      where: { productId, userId },
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "You already reviewed this product" });
    }

    const newReview = await models.ProductReview.create({
      productId,
      userId,
      rating,
      review,
    });
    await recalcRatings(productId);

    res
      .status(201)
      .json({ success: true, review: newReview, message: "Review created" });
  } catch (error) {
    return next(error);
  }
};

// 👉 Update review
export const updateReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;

    const existing = await models.ProductReview.findOne({
      where: { id, userId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    await existing.update({ rating, review });
    await recalcRatings(existing.productId);

    res
      .status(200)
      .json({ success: true, review: existing, message: "Review updated" });
  } catch (error) {
    return next(error);
  }
};

// 👉 Delete review
export const deleteReview = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await models.ProductReview.findOne({
      where: { id, userId },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    const productId = existing.productId;
    await existing.destroy();
    await recalcRatings(productId);

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    return next(error);
  }
};

// 👉 Get all reviews for a product
export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;

    const reviews = await models.ProductReview.findAll({
      where: { productId },
      include: [
        {
          model: models.User,
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};
