const swaggerAutogen = require("swagger-autogen");

const doc = {
  info: {
    title: "Product Service API",
    description: "Automatically generated swagger docs",
    version: "1.0.0",
  },
  host: "localhost:5200",
  baseUrl:"product",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointFile = ["./routes/product.routes.ts"];

swaggerAutogen()(outputFile, endpointFile, doc);
