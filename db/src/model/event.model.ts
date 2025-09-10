import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { Shop } from "./shop.model";

export class Event extends Model<
  InferAttributes<Event>,
  InferCreationAttributes<Event>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description?: string;
  declare startingDate: Date;
  declare endingDate: Date;
  declare shopId: ForeignKey<Shop["id"]>;

  static initModel(sequelize: Sequelize) {
    Event.init(
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
      { sequelize, tableName: "events" }
    );
    return Event;
  }

  static associate(models: any) {
    Event.belongsTo(models.Shop, { foreignKey: "shopId", as: "shop" });

    Event.belongsToMany(models.Product, {
      through: models.ProductEvent,
      foreignKey: "eventId",
      as: "products",
    });

    Event.hasMany(models.DiscountCode, {
      foreignKey: "eventId",
      as: "discountCodes",
    });
  }
}
