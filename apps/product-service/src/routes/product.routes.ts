import express, { Router } from "express";
import {
  createDiscountCodes,
  createProduct,
  createReview,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  deleteReview,
  getAllProducts,
  getCategories,
  getDiscountCodeById,
  getDiscountCodes,
  getFilteredEvents,
  getFilteredProducts,
  getFilteredShops,
  getProductDetails,
  getShopProducts,
  getTopShops,
  restoreProduct,
  searchProducts,
  updateDiscountCode,
  updateReview,
  uploadProductImage,
} from "../controllers/product.controller";
import { isAuth, isSeller } from "@packages/middleware/isAuthenticated";

const productroute: Router = express.Router();
// categories
productroute.get("/get-categories", getCategories);

// discount code
productroute.get("/get-discount-codes", isAuth, getDiscountCodes);
productroute.get("/get-discount-code/:id", isAuth, getDiscountCodeById);
productroute.post(
  "/create-discount-code",
  isAuth,
  isSeller,
  createDiscountCodes
);
productroute.put(
  "/update-discount-code/:id",
  isAuth,
  isSeller,
  updateDiscountCode
);
productroute.delete("/delete-discount-code/:id", isAuth, deleteDiscountCode);
productroute.post(
  "/upload-product-image",
  isAuth,
  isSeller,
  uploadProductImage
);
productroute.delete(
  "/delete-product-image",
  isAuth,
  isSeller,
  deleteProductImage
);

productroute.post("/create-product", isAuth, isSeller, createProduct);
productroute.patch(
  "/delete-product/:productId",
  isAuth,
  isSeller,
  deleteProduct
);
productroute.patch(
  "/restore-product/:productId",
  isAuth,
  isSeller,
  restoreProduct
);
productroute.get("/get-shop-products", isAuth, isSeller, getShopProducts);
productroute.get("/get-all-products", getAllProducts);
productroute.get("/get-product/:slug", getProductDetails);
productroute.get("/get-filtered-products", getFilteredProducts);
productroute.get("/get-filtered-offers", getFilteredEvents);
productroute.get("/get-filtered-shops", getFilteredShops);
productroute.get("/search-products", searchProducts);
productroute.get("/top-shops", getTopShops);

productroute.post("/create-poduct-review", isAuth, createReview); // create review
productroute.put("/update-product-review/:id", isAuth, updateReview); // update review
productroute.delete("/delete-product-review/:id", isAuth, deleteReview); // delete review

export default productroute;
