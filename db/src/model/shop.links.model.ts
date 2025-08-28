import {
  DataTypes,
  Model,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";

export class ShopSocialLink extends Model<
  InferAttributes<ShopSocialLink>,
  InferCreationAttributes<ShopSocialLink>
> {
  declare id: CreationOptional<string>;
  declare platform: string; // e.g., "instagram", "twitter"
  declare url: string;
  declare shopId: ForeignKey<string>;

  static initModel(sequelize: Sequelize) {
    ShopSocialLink.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        platform: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        url: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        shopId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "shop_social_links",
        timestamps: true,
      }
    );
  }
  static associate(models: any) {
    ShopSocialLink.belongsTo(models.Shop, { as: "shop" });
  }
}
