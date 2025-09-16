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

export class ProductInteractionHistory extends Model<
  InferAttributes<ProductInteractionHistory>,
  InferCreationAttributes<ProductInteractionHistory>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;
  declare productId: ForeignKey<Product["id"]>;

  declare action:
    | "product_view"
    | "add_to_wishlist"
    | "remove_from_wishlist"
    | "add_to_cart"
    | "remove_from_cart"
    | "purchase";

  declare timestamp: CreationOptional<Date>;

  static initModel = (sequelize: Sequelize) => {
    ProductInteractionHistory.init(
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
          allowNull: false,
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
        timestamp: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "product_interaction_history",
        modelName: "ProductInteractionHistory",
        timestamps: false,
      }
    );
  };

  static associate(models: any) {
    ProductInteractionHistory.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    ProductInteractionHistory.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  }
}
