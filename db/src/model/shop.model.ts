import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

export class Shop extends Model<
  InferAttributes<Shop>,
  InferCreationAttributes<Shop>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description?: string;
  declare address?: string;
  declare openingHours?: string;
  declare website?: string;
  declare socialLinks?: string;
  declare ratings?: number;
  declare category?: number;

  declare imageId?: ForeignKey<string>; // shop avatar/logo
  declare bannerImageId?: ForeignKey<string>; // optional banner

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize) {
    Shop.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        category: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        openingHours: {
          type: DataTypes.STRING,
          allowNull: true,
        },
     
        address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        ratings: {
          type: DataTypes.FLOAT,
          defaultValue: 0,
        },
        imageId: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        bannerImageId: {
          type: DataTypes.UUID,
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
        tableName: "shops",
        timestamps: true,
      }
    );
  }
   static associate(models: any) {
    Shop.belongsTo(models.Seller, { as: "seller" });
    Shop.belongsTo(models.Image, { as: "logo", foreignKey: "imageId" });
    Shop.belongsTo(models.Image, { as: "banner", foreignKey: "bannerImageId" });
    
    Shop.hasMany(models.ShopReview, { as: "shop_reviews" });
    Shop.hasMany(models.ShopSocialLink, { as: "socialLinks" });
  }
}
