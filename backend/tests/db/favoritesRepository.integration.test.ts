import { MongoMemoryServer } from "mongodb-memory-server";
import { PrismaClient } from "@prisma/client";
import { FavoritesRepository } from "../../src/repositories/favoritesRepository";
import { Favorite } from "../../src/types";

describe("FavoritesRepository Integration Tests", () => {
  let mongod: MongoMemoryServer;
  let prisma: PrismaClient;
  let repository: FavoritesRepository;
  let favorites: Favorite[] = [];

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    // Update Prisma env or pass to client
    process.env.DATABASE_URL = mongoUri;
    prisma = new PrismaClient();
    await prisma.$connect();
    repository = new FavoritesRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await prisma.favorite.deleteMany();
    favorites = [];
  });

  it("should add a favorite and retrieve it", async () => {
    const pokemonId = 1;
    const name = "bulbasaur";
    await repository.addFavorite(pokemonId, name);

    const retrieved = await repository.getFavorites();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].pokemonId).toBe(pokemonId);
    expect(retrieved[0].name).toBe(name);
  });

  it("should remove a favorite", async () => {
    await repository.addFavorite(1, "bulbasaur");
    await repository.removeFavorite(1);

    const retrieved = await repository.getFavorites();
    expect(retrieved).toHaveLength(0);
  });

  it("should check if a Pokémon is a favorite", async () => {
    await repository.addFavorite(1, "bulbasaur");
    const isFav = await repository.isFavorite(1);
    expect(isFav).toBe(true);

    const notFav = await repository.isFavorite(999);
    expect(notFav).toBe(false);
  });

  it("should handle duplicate adds gracefully (upsert)", async () => {
    await repository.addFavorite(1, "bulbasaur");
    await repository.addFavorite(1, "bulbasaur"); // Should not duplicate

    const retrieved = await repository.getFavorites();
    expect(retrieved).toHaveLength(1);
  });
});
