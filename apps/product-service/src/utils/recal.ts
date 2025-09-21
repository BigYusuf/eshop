import { Sequelize } from "sequelize";

import { models } from "@./db";

// Helper to recalc ratings for a product + its shop
export async function recalcRatings(productId: string) {
  const product = await models.Product.findByPk(productId, {
    include: ["shop"],
  });
  if (!product) return;

  // Aggregate product reviews
  const stats: any = await models.ProductReview.findOne({
    where: { productId },
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("id")), "reviewCount"],
      [Sequelize.fn("AVG", Sequelize.col("rating")), "averageRating"],
    ],
    raw: true,
  });

  const reviewCount = Number(stats?.reviewCount || 0);
  const averageRating = Number(stats?.averageRating || 0);

  await product.update({ reviewCount, averageRating });

  // Update shop stats too
  if (product.shopId) {
    const shopStats: any = await models.Product.findOne({
      where: { shopId: product.shopId },
      attributes: [
        [Sequelize.fn("SUM", Sequelize.col("reviewCount")), "reviewCount"],
        [Sequelize.fn("AVG", Sequelize.col("averageRating")), "ratings"],
      ],
      raw: true,
    });

    await models.Shop.update(
      {
        reviewCount: Number(shopStats?.reviewCount || 0),
        ratings: Number(shopStats?.ratings || 0),
      },
      { where: { id: product.shopId } }
    );
  }
}
