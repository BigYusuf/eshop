import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { Product } from "./product.model";

export class ProductAnalytics extends Model<
  InferAttributes<ProductAnalytics>,
  InferCreationAttributes<ProductAnalytics>
> {
  declare id: CreationOptional<string>;
  declare productId: ForeignKey<Product["id"]>;

  declare views: CreationOptional<number>;
  declare wishlistCount: CreationOptional<number>;
  declare cartCount: CreationOptional<number>;
  declare purchases: CreationOptional<number>;

  declare lastViewedAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel = (sequelize: Sequelize) => {
    ProductAnalytics.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        productId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        views: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        wishlistCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        cartCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        purchases: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
             lastViewedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: "product_analytics",
        timestamps: true,
      }
    );
  };
  static associate(models: any) {
    ProductAnalytics.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
    });
  }
}
