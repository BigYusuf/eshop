
import { models } from "@./db";
import { Sequelize } from "sequelize";

export const updateUserAnalytics = async (event: any) => {
  try {
    if (!event.userId) return;

    // 1. Save event in history (detailed log)
    await models.UserAnalyticsHistory.create({
      userId: event.userId,
      productId: event.productId || null,
      shopId: event.shopId || null,
      action: event.action,
      country: event.country || null,
      city: event.city || null,
      ipAddress: event.ipAddress || null,
      deviceType: event.deviceType || null,
      os: event.os || null,
      browser: event.browser || null,
      userAgent: event.userAgent || null,
      timestamp: new Date(),
    });

    // 2. Update summary stats
    const existingData = await models.UserAnalytics.findOne({
      where: { userId: event.userId },
    });

    const extraFields: Record<string, any> = {
      lastActiveAt: new Date(),
    };

    // Optionally keep "last known" device/location in UserAnalytics
    if (event.country) extraFields.country = event.country;
    if (event.city) extraFields.city = event.city;
    if (event.ipAddress) extraFields.ipAddress = event.ipAddress;
    if (event.deviceType) extraFields.deviceType = event.deviceType;
    if (event.os) extraFields.os = event.os;
    if (event.browser) extraFields.browser = event.browser;
    if (event.userAgent) extraFields.userAgent = event.userAgent;

    // Increment counters depending on event type
    let updates: Record<string, any> = {};
    if (event.action === "product_view") {
      updates.totalViews = (existingData?.totalViews || 0) + 1;
    } else if (event.action === "add_to_cart") {
      updates.totalCartAdds = (existingData?.totalCartAdds || 0) + 1;
    } else if (event.action === "purchase") {
      updates.totalPurchases = (existingData?.totalPurchases || 0) + 1;
    }

    if (existingData) {
      await models.UserAnalytics.update(
        {
          ...updates,
          ...extraFields,
          sessionCount: (existingData.sessionCount || 0) + 1,
        },
        { where: { userId: event.userId } }
      );
    } else {
      await models.UserAnalytics.create({
        userId: event.userId,
        totalViews: event.action === "product_view" ? 1 : 0,
        totalCartAdds: event.action === "add_to_cart" ? 1 : 0,
        totalPurchases: event.action === "purchase" ? 1 : 0,
        lastActiveAt: new Date(),
        sessionCount: 1,
        ...extraFields,
      });
    }
  } catch (error) {
    console.error("updateUserAnalytics error:", error);
  }
};

export const updateProductAnalytics = async (event: any) => {
  try {
    if (!event.productId) return;

    const updateFields: Record<string, any> = {};

    switch (event.action) {
      case "product_view":
        updateFields.views = Sequelize.literal('"views" + 1');
        updateFields.lastViewedAt = new Date();
        break;

      case "add_to_wishlist":
        updateFields.wishlistCount = Sequelize.literal('"wishlistCount" + 1');
        break;

      case "remove_from_wishlist":
        updateFields.wishlistCount = Sequelize.literal('"wishlistCount" - 1');
        break;

      case "add_to_cart":
        updateFields.cartCount = Sequelize.literal('"cartCount" + 1');
        break;

      case "remove_from_cart":
        updateFields.cartCount = Sequelize.literal('"cartCount" - 1');
        break;

      case "purchase":
        updateFields.purchases = Sequelize.literal('"purchases" + 1');
        break;

      default:
        return; // unsupported action
    }

    // 1️⃣ Update aggregate analytics
    await models.ProductAnalytics.upsert({
      productId: event.productId,
      lastViewedAt: event.action === "product_view" ? new Date() : null,
      ...updateFields,
    });

    // 2️⃣ Save history (who & when)
    if (event.userId) {
      await models.ProductInteractionHistory.create({
        userId: event.userId,
        productId: event.productId,
        action: event.action,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error("Error updating product analytics:", error);
  }
};

