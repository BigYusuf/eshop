import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

export class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description?: string;

  static initModel(sequelize: Sequelize) {
    Category.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "categories",
        timestamps: true,
      }
    );
  }
  static associate(models: any) {
    Category.hasMany(models.SubCategory, {
      foreignKey: "categoryId",
      as: "sub_categories",
    });
  }
}

export class SubCategory extends Model<
  InferAttributes<SubCategory>,
  InferCreationAttributes<SubCategory>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description?: string;

  declare categoryId: ForeignKey<string>;

  static initModel(sequelize: Sequelize) {
    SubCategory.init(
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
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "sub_categories",
        timestamps: true,
      }
    );
  }
  static associate(models: any) {
    SubCategory.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "categories",
    });
  }
}
