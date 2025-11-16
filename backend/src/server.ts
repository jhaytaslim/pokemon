import express from "express";
import cors from "cors";
import routes from "./routes";
import { initFavoritesRepo } from "./controllers/favorites";
import { PrismaClient } from "@prisma/client";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use("/api", routes);

// Init Prisma and Repo on startup
const prisma = new PrismaClient();
initFavoritesRepo(); // Assumes repo uses global or injected prisma

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
});
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
