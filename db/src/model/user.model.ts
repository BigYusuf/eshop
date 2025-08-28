import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<string>;
  declare firstName?: string;
  declare lastName?: string;
  declare email: string;
  declare password: string;
  declare following?: string[];
  // declare imageId?: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize) {
    User.init(
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
        following: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          defaultValue: [],
        },
        // imageId: DataTypes.STRING,
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
        tableName: "users",
        timestamps: true,
      }
    );
  }
  static associate(models: any) {
    User.hasOne(models.Image, { as: "avatar" });
    User.hasMany(models.ShopReview, { as: "shop_reviews" });
  }
}
