import sequelize from "./sequelize.js";
import redis from "./redis.js";
import { User } from "./model/user.model.js";
import { Image } from "./model/image.model.js";

User.initModel(sequelize);
Image.initModel(sequelize);

User.hasOne(Image, { foreignKey: "userId", as: "avatar" });
Image.belongsTo(User, { foreignKey: "userId", as: "users" });

export { sequelize, redis, User, Image };
