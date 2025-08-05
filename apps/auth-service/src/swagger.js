const swaggerAutogen = require("swagger-autogen");

const doc = {
  info: {
    title: "Auth Service API",
    description: "Automatically generated swagger docs",
    version: "1.0.0",
  },
  host: "localhost:5100",
  baseUrl:"auth",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointFile = ["./routes/auth.routes.ts"];

swaggerAutogen()(outputFile, endpointFile, doc);
