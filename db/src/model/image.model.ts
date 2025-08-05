import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  //   CreationOptional,
} from "sequelize";

export class Image extends Model<
  InferAttributes<Image>,
  InferCreationAttributes<Image>
> {
  declare id: string;
  declare file_id: string;
  declare url: string;
  declare userId?: string;

  static initModel(sequelize: Sequelize) {
    Image.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        file_id: DataTypes.STRING,
        url: DataTypes.STRING,
        userId: {
          type: DataTypes.UUID,
          allowNull: true,
          unique: true,
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
