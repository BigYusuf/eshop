import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in the environment variables.");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // set to console.log to debug SQL
});

// Test the connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected successfully.");

    await sequelize.sync({ alter: true }); // use force: true for dev reset
    console.log("✅ All tables are synced.");
  } catch (error) {
    console.error("❌ Error with PostgreSQL connection or syncing:", error);
    process.exit(1); // exit the app if DB connection fails
  }
})();

export default sequelize;
