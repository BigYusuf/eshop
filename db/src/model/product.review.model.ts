import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { Product } from "./product.model";
import { User } from "./user.model";

export class ProductReview extends Model<
  InferAttributes<ProductReview>,
  InferCreationAttributes<ProductReview>
> {
  declare id: CreationOptional<string>;
  declare productId: ForeignKey<Product["id"]>;
  declare userId: ForeignKey<User["id"]>;
  declare rating: number;
  declare review?: string;

  static initModel(sequelize: Sequelize) {
    ProductReview.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        productId: { type: DataTypes.UUID, allowNull: false },
        userId: { type: DataTypes.UUID, allowNull: false },
        rating: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: { min: 1, max: 5 },
        },
        review: { type: DataTypes.TEXT },
      },
      { sequelize, tableName: "product_reviews" }
    );
    return ProductReview;
  }

  static associate(models: any) {
    ProductReview.belongsTo(models.Product, { foreignKey: "productId" });
    ProductReview.belongsTo(models.User, { foreignKey: "userId" });
  }
}
