import express, { Router } from "express";
import {
  createDiscountCodes,
  deleteDiscountCode,
  getCategories,
  getDiscountCodeById,
  getDiscountCodes,
  updateDiscountCode,
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
productroute.put("/update-discount-code", isAuth, isSeller, updateDiscountCode);
productroute.delete("/delete-discount-code/:id", isAuth, deleteDiscountCode);

// productroute.post("/create-product", isAuth, isSeller, createProduct);

export default productroute;
