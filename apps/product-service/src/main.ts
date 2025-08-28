import express from "express";
import cors from "cors";
// import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "@packages/error-handler/error-middleware";
import productRoute from "./routes/product.routes";
import swaggerUi from "swagger-ui-express";
const swaggerDoc = require("./swagger-output.json");
import "./jobs/product-cron-job";

// const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 5200;

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use(cookieParser());
app.get("/", (req, res) => {
  res.send({ message: "Hello Product API" });
});

//docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.get("/docs-json", (req, res) => {
  res.json(swaggerDoc);
});

//Routes
app.use("/api/product/", productRoute);

app.use(errorMiddleware);

const server = app.listen(port, () => {
  console.log(
    `Product service is running at http://localhost:${port}/api/product`
  );
  console.log(`Swagger docs is available at http://localhost:${port}/api-docs`);
});
server.on("error", (error) => {
  console.log("Server Error: ", error);
});
