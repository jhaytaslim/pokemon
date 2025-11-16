import { PrismaClient } from "@prisma/client";
import {
  FavoritesRepository,
  IFavoritesRepository,
} from "../../src/repositories/favoritesRepository";
import { Favorite } from "../../src/types";

/**
 * Mock PrismaClient for unit tests.
 */
jest.mock("@prisma/client", () => {
  const mockPrisma = {
    favorite: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const MockedPrisma = PrismaClient as jest.MockedClass<typeof PrismaClient>;

describe("FavoritesRepository Unit Tests", () => {
  let repository: IFavoritesRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = new MockedPrisma();
    repository = new FavoritesRepository(mockPrisma);
    jest.clearAllMocks();
  });

  describe("addFavorite", () => {
    it("should add a new favorite using upsert", async () => {
      mockPrisma.favorite.upsert.mockResolvedValue({
        pokemonId: 1,
        name: "bulbasaur",
      } as any);

      await repository.addFavorite(1, "bulbasaur");

      expect(mockPrisma.favorite.upsert).toHaveBeenCalledWith({
        where: { pokemonId: 1 },
        update: {},
        create: { pokemonId: 1, name: "bulbasaur" },
      });
    });

    it("should handle existing favorite without error (upsert)", async () => {
      mockPrisma.favorite.upsert.mockResolvedValue({
        pokemonId: 1,
        name: "bulbasaur",
      } as any);

      await repository.addFavorite(1, "bulbasaur"); // First
      await repository.addFavorite(1, "bulbasaur"); // Duplicate

      expect(mockPrisma.favorite.upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe("removeFavorite", () => {
    it("should remove a favorite by pokemonId", async () => {
      mockPrisma.favorite.deleteMany.mockResolvedValue({ count: 1 } as any);

      await repository.removeFavorite(1);

      expect(mockPrisma.favorite.deleteMany).toHaveBeenCalledWith({
        where: { pokemonId: 1 },
      });
      expect(mockPrisma.favorite.deleteMany).toHaveReturnedWith({ count: 1 });
    });

    it("should handle non-existent favorite gracefully", async () => {
      mockPrisma.favorite.deleteMany.mockResolvedValue({ count: 0 } as any);

      await repository.removeFavorite(999);

      expect(mockPrisma.favorite.deleteMany).toHaveBeenCalledWith({
        where: { pokemonId: 999 },
      });
    });
  });

  describe("getFavorites", () => {
    it("should return all favorites ordered by createdAt desc", async () => {
      const mockFavorites: Favorite[] = [
        {
          id: 1,
          pokemonId: 1,
          name: "bulbasaur",
          createdAt: "2023-01-01T00:00:00.000Z",
        },
        {
          id: 2,
          pokemonId: 4,
          name: "charmander",
          createdAt: "2023-01-02T00:00:00.000Z",
        },
      ];
      mockPrisma.favorite.findMany.mockResolvedValue(
        mockFavorites.map((f) => ({
          id: f.id.toString(), // Mock ObjectId as string
          pokemonId: f.pokemonId,
          name: f.name,
          createdAt: new Date(f.createdAt),
        }))
      );

      const result = await repository.getFavorites();

      expect(mockPrisma.favorite.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });
      expect(result).toHaveLength(2);
      expect(result[0].pokemonId).toBe(4); // Newest first
      expect(result[0].createdAt).toBe("2023-01-02T00:00:00.000Z");
    });

    it("should return empty array if no favorites", async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([]);

      const result = await repository.getFavorites();

      expect(result).toEqual([]);
    });
  });

  describe("isFavorite", () => {
    it("should return true for existing favorite", async () => {
      mockPrisma.favorite.count.mockResolvedValue(1);

      const result = await repository.isFavorite(1);

      expect(mockPrisma.favorite.count).toHaveBeenCalledWith({
        where: { pokemonId: 1 },
      });
      expect(result).toBe(true);
    });

    it("should return false for non-existent favorite", async () => {
      mockPrisma.favorite.count.mockResolvedValue(0);

      const result = await repository.isFavorite(999);

      expect(result).toBe(false);
    });
  });

  describe("close", () => {
    it("should disconnect Prisma client", async () => {
      mockPrisma.$disconnect = jest.fn().mockResolvedValue(undefined);

      await repository["close"](); // Access private method via type assertion if needed

      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
});
