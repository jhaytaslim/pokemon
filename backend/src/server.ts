import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { specs } from "./swagger"; // New import
import routes from "./routes";
import { initFavoritesRepo } from "./controllers/favorites";
import { PrismaClient } from "@prisma/client";
import { AppConfig } from "../config";

const app = express();

app.use(cors());
app.use(express.json());

// Swagger/OpenAPI setup (new)
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);
app.use("/api-docs.json", (_req, res) => res.json(specs)); // Raw spec

app.use("/api", routes);
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));

// Init Prisma and Repo on startup
const prisma = new PrismaClient();
initFavoritesRepo(); // Assumes repo uses global or injected prisma

app.listen(AppConfig.PORT, () => {
  console.log(`Server running on port http://localhost:${AppConfig.PORT}/api`);
  console.log(
    `Swagger docs available at http://localhost:${AppConfig.PORT}/api-docs`
  );
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
});
