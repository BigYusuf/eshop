import sequelize from "src/sequelize.js";
import { Image } from "./image.model.js";
import { User } from "./user.model.js";

User.initModel(sequelize);
Image.initModel(sequelize);

User.hasOne(Image, { foreignKey: "userId", as: "avatar" });
Image.belongsTo(User, { foreignKey: "userId", as: "users" });

export { sequelize, User, Image };
