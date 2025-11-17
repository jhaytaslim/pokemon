import supertest from "supertest";
import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import { PrismaClient } from "@prisma/client";
import routes from "../../src/routes";
import { initFavoritesRepo } from "../../src/controllers/favorites";
import { FavoritesRepository } from "../../src/repositories/favoritesRepository";
import type { Test } from "supertest"; // use Test type only

let app: express.Application;
let mongod: MongoMemoryServer;
let prisma: PrismaClient;
let request: ReturnType<typeof supertest>; // Use inferred return type from supertest to match TestAgent/Test

/**
 * Global setup for integration tests.
 * Starts in-memory MongoDB and initializes app.
 */
beforeAll(async () => {
  // Start in-memory MongoDB
  mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  process.env.DATABASE_URL = mongoUri.replace(
    "mongodb://",
    "mongodb://localhost:"
  ); // Adjust for local

  // Init Prisma
  prisma = new PrismaClient();
  await prisma.$connect();

  // Setup Express app
  app = express();
  app.use(express.json());
  app.use("/api", routes);

  // Init repo with test Prisma
  const testRepo = new FavoritesRepository(prisma);
  // Mock global repo init for tests
  jest
    .spyOn(require("../../src/controllers/favorites"), "initFavoritesRepo")
    .mockImplementation(async () => {
      (require("../../src/controllers/favorites") as any).favoritesRepo =
        testRepo;
    });
  await initFavoritesRepo();

  // Supertest instance (with string URL enforcement)
  request = supertest(app); // FIXED: Direct assignment—no cast needed
});

/**
 * Cleanup after all tests.
 */
afterAll(async () => {
  await prisma.$disconnect();
  await mongod.stop();
});

/**
 * Clean DB before each test.
 */
beforeEach(async () => {
  await prisma.favorite.deleteMany();
});

describe("API Integration Tests", () => {
  describe("Pokémon Proxy Endpoints", () => {
    it("GET /api/pokemon should return first 150 Pokémon", async () => {
      const response = await request.get("/api/pokemon");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("results");
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBe(150);
      expect(response.body.results[0]).toHaveProperty("name", "bulbasaur");
    });

    it("GET /api/pokemon/:id should return Pokémon details with evolutions", async () => {
      const response = await request.get("/api/pokemon/1"); // Explicit string path

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("id", 1);
      expect(response.body).toHaveProperty("name", "bulbasaur");
      expect(response.body).toHaveProperty("abilities");
      expect(response.body).toHaveProperty("types");
      expect(response.body).toHaveProperty("evolutions");
      expect(Array.isArray(response.body.evolutions)).toBe(true);
      expect(response.body.evolutions).toContain("bulbasaur"); // Base form
      expect(response.body.evolutions).toContain("ivysaur"); // Evolution
    });

    it("GET /api/pokemon/:id should handle invalid ID gracefully", async () => {
      const response = await request.get("/api/pokemon/9999"); // Explicit string

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty(
        "error",
        "Failed to fetch Pokémon details"
      );
    });
  });

  describe("Favorites Endpoints", () => {
    it("POST /api/favorites should add a favorite", async () => {
      const newFavorite = { pokemonId: 1, name: "bulbasaur" };
      const response = await request.post("/api/favorites").send(newFavorite);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("message", "Added to favorites");

      // Verify in DB
      const dbFavorites = await prisma.favorite.findMany();
      expect(dbFavorites).toHaveLength(1);
      expect(dbFavorites[0].pokemonId).toBe(1);
      expect(dbFavorites[0].name).toBe("bulbasaur");
    });

    it("POST /api/favorites should handle duplicates (upsert)", async () => {
      const newFavorite = { pokemonId: 1, name: "bulbasaur" };
      await request.post("/api/favorites").send(newFavorite); // First add
      const response = await request.post("/api/favorites").send(newFavorite); // Duplicate

      expect(response.status).toBe(201); // Still 201 as per impl

      const dbFavorites = await prisma.favorite.findMany();
      expect(dbFavorites).toHaveLength(1); // No duplicate
    });

    it("DELETE /api/favorites/:pokemonId should remove a favorite", async () => {
      // Add first
      await request
        .post("/api/favorites")
        .send({ pokemonId: 1, name: "bulbasaur" });
      const response = await request.delete("/api/favorites/1"); // Explicit string

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Removed from favorites");

      // Verify removed
      const dbFavorites = await prisma.favorite.findMany();
      expect(dbFavorites).toHaveLength(0);
    });

    it("GET /api/favorites should return all favorites", async () => {
      await request
        .post("/api/favorites")
        .send({ pokemonId: 1, name: "bulbasaur" });
      await request
        .post("/api/favorites")
        .send({ pokemonId: 4, name: "charmander" });

      const response = await request.get("/api/favorites");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty("pokemonId", 1);
      expect(response.body[0]).toHaveProperty("name", "bulbasaur");
      // Ordered by createdAt desc
      expect(response.body[0].createdAt).toBeDefined();
    });

    it("GET /api/favorites should return empty array if none", async () => {
      const response = await request.get("/api/favorites");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("Swagger Endpoints", () => {
    it("GET /api-docs should serve Swagger UI", async () => {
      const response = await request.get("/api-docs");

      expect(response.status).toBe(200);
      expect(response.text).toContain("Swagger UI"); // Basic check for UI
    });

    it("GET /api-docs.json should serve OpenAPI spec", async () => {
      const response = await request.get("/api-docs.json");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("openapi", "3.0.0");
      expect(response.body).toHaveProperty(
        "info.title",
        "Pokémon Favorites API"
      );
      expect(response.body.components.schemas).toHaveProperty("Favorite");
    });
  });

  describe("Error Handling", () => {
    it("POST /api/favorites should handle invalid body", async () => {
      const response = await request
        .post("/api/favorites")
        .send({ invalid: "data" });

      expect(response.status).toBe(500); // As per controller catch
      expect(response.body).toHaveProperty("error");
    });
  });
});
