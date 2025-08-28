import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { Seller } from "./seller.model";

export class ProductEvent extends Model<
  InferAttributes<ProductEvent>,
  InferCreationAttributes<ProductEvent>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description?: string;
  declare startingDate: Date;
  declare endingDate: Date;
  declare sellerId: ForeignKey<Seller["id"]>;

  static initModel(sequelize: Sequelize) {
    ProductEvent.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.TEXT },
        startingDate: { type: DataTypes.DATE, allowNull: false },
        endingDate: { type: DataTypes.DATE, allowNull: false },
      },
      { sequelize, tableName: "product_events" }
    );
    return ProductEvent;
  }

  static associate(models: any) {
    // Event created by a seller
    ProductEvent.belongsTo(models.Seller, { foreignKey: "sellerId" });

    // Event applies to many products
    ProductEvent.belongsToMany(models.Product, {
      through: "ProductEventProducts",
      foreignKey: "eventId",
      otherKey: "productId",
    });

    // Event has many discount codes
    ProductEvent.hasMany(models.DiscountCode, { foreignKey: "eventId" });
  }
}
