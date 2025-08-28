import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not defined in the environment variables."
  );
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false, // set to console.log to debug SQL
});


export default sequelize;
