
import { ensureDefaultCategories } from "./lib/initializeSiteConfig";
import sequelize from "./sequelize";

export const initDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully.");

    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true});
    }

    // Ensure default categories (only runs if none exist)
    await ensureDefaultCategories();

    console.log("✅ All tables are synced.");
  } catch (error) {
    console.error("❌ Error with PostgreSQL connection or syncing:", error);
    process.exit(1); // exit the app if DB connection fails
  }
};
