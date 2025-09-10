import sequelize from "./sequelize.js";
import redis from "./redis.js";
import { User } from "./model/user.model.js";
import { Image } from "./model/image.model.js";
import { Seller } from "./model/seller.model.js";
import { Shop } from "./model/shop.model.js";
import { ShopSocialLink } from "./model/shop.links.model.js";
import { ShopReview } from "./model/shopReview.model.js";
import { Category, SubCategory } from "./model/product.category.model.js";
import { DiscountCode } from "./model/discount.code.model.js";
import { Product } from "./model/product.model.js";
import { Event } from "./model/event.model.js";
import { initDb } from "./iniDb.js";
import { ProductEvent } from "./model/product.event.model.js";
import { ProductReview } from "./model/product.review.model.js";

const models = {
  User,
  Seller,
  Shop,
  Category,
  SubCategory,
  Product,
  Image,
  ShopSocialLink,
  ShopReview,
  DiscountCode,
  ProductEvent,
  ProductReview,
  Event,
};

// init models
Object.values(models).forEach((m) => m.initModel(sequelize));
// setup associations
Object.values(models).forEach((m) => m.associate?.(models));

export { sequelize, redis, models, initDb };
