import sequelize from "./sequelize.js";
import redis from "./redis.js";
import { User } from "./model/user.model.js";
import { Image } from "./model/image.model.js";
import { Seller } from "./model/seller.model.js";
import { Shop } from "./model/shop.model.js";
import { ShopSocialLink } from "./model/shopLinks.model.js";
import { ShopReview } from "./model/shopReview.model.js";

User.initModel(sequelize);
Image.initModel(sequelize);
Seller.initModel(sequelize);
Shop.initModel(sequelize);
ShopReview.initModel(sequelize);
ShopSocialLink.initModel(sequelize);

// User - Profile Images
User.hasMany(Image, { foreignKey: "userId", as: "avatar" });
Image.belongsTo(User, { foreignKey: "userId" });

// Seller - Profile Images
Seller.hasMany(Image, { foreignKey: "sellerId", as: "avatar" });
Image.belongsTo(Seller, { foreignKey: "sellerId" });

// User → Image
// User.belongsTo(Image, { foreignKey: "imageId", as: "avatar" });
// Image.hasMany(User, { foreignKey: "imageId", as: "users" }); // hasOne if you want unique per image

// Shop → Logo Image (1:1)
Shop.belongsTo(Image, { foreignKey: "imageId", as: "logo" });
// 
// Shop → Banner Image (1:1)
Shop.belongsTo(Image, { foreignKey: "bannerImageId", as: "banner" });

// Seller → Image
// Seller.belongsTo(Image, { foreignKey: "imageId", as: "images" });
// Image.hasMany(Seller, { foreignKey: "imageId", as: "sellers" });

// Seller → Shop
Seller.hasOne(Shop, { foreignKey: "sellerId", as: "shop" });
Shop.belongsTo(Seller, { foreignKey: "sellerId", as: "seller" });

Shop.hasMany(ShopSocialLink, { foreignKey: "shopId", as: "socialLinks" });
ShopSocialLink.belongsTo(Shop, { foreignKey: "shopId" });

// User → ShopReviews
User.hasMany(ShopReview, { foreignKey: "userId", as: "shop_reviews" });
ShopReview.belongsTo(User, { foreignKey: "userId", as: "user" });

// Shop → ShopReviews
Shop.hasMany(ShopReview, { foreignKey: "shopId", as: "shop_reviews" });
ShopReview.belongsTo(Shop, { foreignKey: "shopId", as: "shop" });

export { sequelize, redis, User, Seller, Image, ShopReview, Shop, ShopSocialLink };
