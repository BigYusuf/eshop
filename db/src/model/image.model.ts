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

  declare shopId?: ForeignKey<string>;
  declare sellerId?: ForeignKey<string>;
  declare userId?: ForeignKey<string>;

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
        shopId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "shops",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        sellerId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "sellers", // or "users" if seller is part of user table
            key: "id",
          },
          onDelete: "CASCADE",
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: {
            model: "users",
            key: "id",
          },
          onDelete: "CASCADE",
        },
      },
      {
        sequelize,
        tableName: "images",
        timestamps: false,
      }
    );
  }
}
