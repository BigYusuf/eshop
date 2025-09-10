import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

export class DiscountCode extends Model<
  InferAttributes<DiscountCode>,
  InferCreationAttributes<DiscountCode>
> {
  declare id: CreationOptional<string>;
  declare publicName: string;
  declare discountType: "percentage" | "fixed"; // stricter typing
  declare discountCode: string;
  declare discountValue: number;

  declare shopId: ForeignKey<string>;

  // timeline (can match productEvent timeline or be independent)
  declare startDate?: Date;
  declare endDate?: Date;

  static initModel(sequelize: Sequelize) {
    DiscountCode.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        publicName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        discountType: {
          type: DataTypes.ENUM("percentage", "fixed"),
          allowNull: false,
        },
        discountCode: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        discountValue: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        startDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        endDate: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "discount_codes",
        timestamps: true, // keep createdAt / updatedAt
      }
    );
  }

  static associate(models: any) {
    // Shop owns discount codes
    DiscountCode.belongsTo(models.Shop, { as: "shop", foreignKey: "shopId" });

    // Event <-> DiscountCode (many-to-many)
    DiscountCode.belongsToMany(models.Event, {
      through: "event_discounts",
      foreignKey: "discountId",
      otherKey: "eventId",
      as: "events",
    });

    // Discounts also apply to products directly (if needed)
    DiscountCode.belongsToMany(models.Product, {
      through: "product_discounts",
      foreignKey: "discountCodeId",
      otherKey: "productId",
      as: "products",
    });
  }
}
