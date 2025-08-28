import cron from "node-cron";
import { Op } from "sequelize";

import { models } from "@./db";

cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();

    // Delete products where 'deletedAt' is <= now
    const deletedCount = await models.Product.destroy({
      where: {
        isDeleted: true,
        deletedAt: { [Op.lte]: now },
      },
    });

    console.log(`${deletedCount} expired products permanently deleted`);
  } catch (error) {
    console.error("cron delete error:", error);
  }
});
