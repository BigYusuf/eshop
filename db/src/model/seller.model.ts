import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

export class Seller extends Model<
  InferAttributes<Seller>,
  InferCreationAttributes<Seller>
> {
  declare id: CreationOptional<string>;
  declare firstName?: string;
  declare lastName?: string;
  declare email: string;
  declare password: string;
  declare phoneNumber: string;
  declare country?: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize) {
    Seller.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        password: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, unique: true, allowNull: false },
        phoneNumber: { type: DataTypes.STRING, allowNull: false },
        country: DataTypes.STRING,
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
        tableName: "sellers",
        timestamps: true,
      }
    );
  }
  static associate(models: any) {
    Seller.hasOne(models.Image, { as: "avatar", foreignKey: "sellerId" }); // auto-adds sellerId in images
    Seller.hasOne(models.Shop, { as: "shop", foreignKey: "sellerId" });
    Seller.hasMany(models.DiscountCode, {
      as: "discount_codes",
      foreignKey: "sellerId",
    });
  }
}
