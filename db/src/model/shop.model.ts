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
  declare ratings?: number;
  declare followerCount?: number;
  declare reviewCount?: number;
  declare topSales?: number;
  declare category?: string; // or ENUM

  declare sellerId: ForeignKey<string>;
  declare imageId?: ForeignKey<string>;
  declare bannerImageId?: ForeignKey<string>;

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
        openingHours: DataTypes.STRING,
        address: DataTypes.STRING,
        ratings: {
          type: DataTypes.FLOAT,
          defaultValue: 0,
        },
        followerCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        reviewCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        topSales: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        sellerId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        imageId: DataTypes.UUID,
        bannerImageId: DataTypes.UUID,
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
    Shop.belongsTo(models.Seller, {
      foreignKey: "sellerId",
      as: "seller",
      onDelete: "CASCADE",
    });

    Shop.hasMany(models.Product, {
      foreignKey: "shopId",
      as: "products",
      onDelete: "CASCADE",
    });

    Shop.hasMany(models.Event, { foreignKey: "shopId", as: "events" });

    Shop.hasMany(models.DiscountCode, {
      foreignKey: "shopId",
      as: "discountCodes",
    });

    Shop.belongsTo(models.Image, { as: "logo", foreignKey: "imageId" });
    Shop.belongsTo(models.Image, { as: "banner", foreignKey: "bannerImageId" });

    Shop.hasMany(models.ShopReview, {
      foreignKey: "shopId",
      as: "shop_reviews",
    });

    Shop.hasMany(models.ShopSocialLink, {
      foreignKey: "shopId",
      as: "socialLinks",
    });
    
    Shop.hasMany(models.ShopFollower, {
      foreignKey: "shopId",
      as: "followers",
      onDelete: "CASCADE",
    });
  }
}
