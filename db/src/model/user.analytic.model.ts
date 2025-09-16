import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";
import { User } from "./user.model";

export class UserAnalytics extends Model<
  InferAttributes<UserAnalytics>,
  InferCreationAttributes<UserAnalytics>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<User["id"]>;

  declare totalViews: CreationOptional<number>;
  declare totalCartAdds: CreationOptional<number>;
  declare totalPurchases: CreationOptional<number>;

  declare lastActiveAt: Date;
  declare sessionCount: CreationOptional<number>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel = (sequelize: Sequelize) => {
    UserAnalytics.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        lastActiveAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        totalViews: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        totalCartAdds: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        totalPurchases: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        sessionCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: "user_analytics",
        timestamps: true,
      }
    );
  };

  static associate(models: any) {
    UserAnalytics.belongsTo(models.User, { foreignKey: "userId", as: "user" });
  }
}
