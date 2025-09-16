import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { User } from "./user.model";
import { Product } from "./product.model";
import { Shop } from "./shop.model";

export class UserAnalyticsHistory extends Model<
  InferAttributes<UserAnalyticsHistory>,
  InferCreationAttributes<UserAnalyticsHistory>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare productId: ForeignKey<Product["id"]> | null;
  declare shopId: ForeignKey<Shop["id"]> | null;

  declare action:
    | "product_view"
    | "add_to_wishlist"
    | "remove_from_wishlist"
    | "add_to_cart"
    | "remove_from_cart"
    | "purchase";

  declare country: string | null;
  declare city: string | null;
  declare ipAddress: string | null;
  declare deviceType: string | null; // mobile, desktop, tablet
  declare os: string | null; // Windows, iOS, Android
  declare browser: string | null;
  declare userAgent: string | null;

  declare timestamp: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize) {
    UserAnalyticsHistory.init(
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
        productId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        shopId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        action: {
          type: DataTypes.ENUM(
            "product_view",
            "add_to_wishlist",
            "remove_from_wishlist",
            "add_to_cart",
            "remove_from_cart",
            "purchase"
          ),
          allowNull: false,
        },
        country: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        city: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        ipAddress: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        deviceType: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        os: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        browser: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        userAgent: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        timestamp: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: "user_analytics_history",
        modelName: "UserAnalyticsHistory",
        timestamps: true,
      }
    );
  }

  static associate(models: any) {
    UserAnalyticsHistory.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    UserAnalyticsHistory.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
    UserAnalyticsHistory.belongsTo(models.Shop, {
      foreignKey: "shopId",
      as: "shop",
    });
  }
}
