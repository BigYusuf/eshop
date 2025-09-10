// model/product.model.ts
import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

export class Product extends Model<
  InferAttributes<Product>,
  InferCreationAttributes<Product>
> {
  declare id: CreationOptional<string>;
  declare title: string;
  declare shortDescription: string;
  declare detailedDescription?: string;
  declare warranty?: string;
  declare slug: string;
  declare tags: string[];
  declare cashOnDelivery: boolean;
  declare brand?: string;
  declare videoUrl?: string;
  declare status?: string;
  declare isDeleted?: boolean;

  declare colors: string[];
  declare sizes: string[];

  declare stock: number;
  declare salePrice: number;
  declare regularPrice: number;
  declare totalSales?: number;

  declare customSpecification?: Record<string, any>[]; // or Array<{ name: string; value: string }>
  declare customProperties?: Record<string, any>;

  declare averageRating?: number;
  declare reviewCount?: number;
  declare deletedAt?: Date | null;
  declare isFeatured?: boolean;

  // Foreign Keys
  declare shopId: ForeignKey<string>;
  declare categoryId: ForeignKey<string>;
  declare subCategoryId: ForeignKey<string>;

  // 🔑 initModel
  static initModel(sequelize: Sequelize) {
    Product.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        shortDescription: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        detailedDescription: DataTypes.TEXT,
        warranty: DataTypes.STRING,
        customSpecification: DataTypes.JSONB,
        slug: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        tags: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          allowNull: false,
          defaultValue: [],
        },
        cashOnDelivery: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        brand: DataTypes.STRING,
        videoUrl: DataTypes.STRING,
        colors: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: [],
        },
        sizes: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: [],
        },
        stock: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        salePrice: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        regularPrice: {
          type: DataTypes.FLOAT,
          allowNull: false,
        },
        customProperties: {
          type: DataTypes.JSONB,
        },
        totalSales: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        isFeatured: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        shopId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "shops",
            key: "id",
          },
        },
        averageRating: {
          type: DataTypes.FLOAT,
          defaultValue: 0,
        },
        reviewCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        isDeleted: {
          allowNull: false,
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        status: {
          type: DataTypes.STRING,
          defaultValue: "active",
        },
        deletedAt: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        tableName: "products",
        timestamps: true,
      }
    );
  }

  // 🔑 associate
  static associate(models: any) {
    // belongs to seller
    Product.belongsTo(models.Shop, {
      foreignKey: "shopId",
      as: "shop",
      onDelete: "CASCADE",
    });

    // belongs to category
    Product.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
      onDelete: "SET NULL",
    });

    // belongs to subCategory
    Product.belongsTo(models.SubCategory, {
      foreignKey: "subCategoryId",
      as: "subCategory",
      onDelete: "SET NULL",
    });

    // has many images
    Product.hasMany(models.Image, {
      foreignKey: "productId",
      as: "images",
      onDelete: "CASCADE",
    });

    // has many reviews
    Product.hasMany(models.ProductReview, {
      foreignKey: "productId",
      as: "product_reviews",
      // onDelete: "CASCADE",
    });

    // many-to-many with DiscountCode
    Product.belongsToMany(models.DiscountCode, {
      through: "product_discounts",
      as: "discountCodes",
      foreignKey: "productId",
      otherKey: "discountCodeId",
    });

    //  many-to-many with Event via ProductEvent
    Product.belongsToMany(models.Event, {
      through: models.ProductEvent,
      foreignKey: "productId",
      as: "events",
    });
  }
}
