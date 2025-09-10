import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

export class Image extends Model<
  InferAttributes<Image>,
  InferCreationAttributes<Image>
> {
  declare id: CreationOptional<string>;
  declare fileId: string;
  declare url: string;

  // Type-only declarations (not in init!)
  declare sellerId?: ForeignKey<string>;
  declare userId?: ForeignKey<string>;
  declare productId?: ForeignKey<string>;
  declare shopId?: ForeignKey<string>; // optional direct link if needed

  static initModel(sequelize: Sequelize) {
    Image.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        fileId: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        url: {
          type: DataTypes.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "images",
        timestamps: false,
      }
    );
  }

  static associate(models: any) {
    Image.belongsTo(models.Seller, {
      foreignKey: { allowNull: true },
      onDelete: "CASCADE",
    });

    Image.belongsTo(models.User, {
      foreignKey: { allowNull: true },
      onDelete: "CASCADE",
    });
    // Product images (1 Product → many Images)
    Image.belongsTo(models.Product, {
      foreignKey: "productId",
      as: "product",
      onDelete: "CASCADE",
    });
    Image.hasOne(models.Shop, { as: "shopLogo", foreignKey: "imageId" });
    Image.hasOne(models.Shop, {
      as: "shopBanner",
      foreignKey: "bannerImageId",
    });
  }
}
