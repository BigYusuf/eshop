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
import { Event } from "./event.model";

export class ProductEvent extends Model<
  InferAttributes<ProductEvent>,
  InferCreationAttributes<ProductEvent>
> {
  declare id: CreationOptional<string>;
  declare productId: ForeignKey<Product["id"]>;
  declare eventId: ForeignKey<Event["id"]>;

  static initModel(sequelize: Sequelize) {
    ProductEvent.init(
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
        eventId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      { sequelize, tableName: "product_events_pivot" }
    );
    return ProductEvent;
  }

  static associate(models: any) {
    ProductEvent.belongsTo(models.Product, { foreignKey: "productId" });
    ProductEvent.belongsTo(models.Event, { foreignKey: "eventId" });
  }
}
