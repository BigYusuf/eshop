// models/shopFollower.model.ts
import { DataTypes, Model, Sequelize, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey, NonAttribute } from "sequelize";
import { User } from "./user.model";
import { Shop } from "./shop.model";

export class ShopFollower extends Model<
  InferAttributes<ShopFollower>,
  InferCreationAttributes<ShopFollower>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare shopId: ForeignKey<Shop["id"]>;

  declare user?: NonAttribute<User>;
  declare shop?: NonAttribute<Shop>;

  static initModel(sequelize: Sequelize) {
    ShopFollower.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        shopId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      { sequelize, tableName: "shop_followers" }
    );
    return ShopFollower;
  }

  static associate(models: any) {
    ShopFollower.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    ShopFollower.belongsTo(models.Shop, { foreignKey: "shopId", as: "shop" });
  }
}
