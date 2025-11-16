import { PrismaClient } from "@prisma/client";
import { Favorite } from "../types";

export interface IFavoritesRepository {
  addFavorite(pokemonId: number, name: string): Promise<void>;
  removeFavorite(pokemonId: number): Promise<void>;
  getFavorites(): Promise<Favorite[]>;
  isFavorite(pokemonId: number): Promise<boolean>;
}

export class FavoritesRepository implements IFavoritesRepository {
  private prisma: PrismaClient;

  constructor(prismaClient?: PrismaClient) {
    this.prisma = prismaClient || new PrismaClient();
  }

  async addFavorite(pokemonId: number, name: string): Promise<void> {
    /**
     * Adds a Pokémon to favorites if not already present.
     * @param pokemonId - The Pokémon's ID
     * @param name - The Pokémon's name
     */
    await this.prisma.favorite.upsert({
      where: { pokemonId },
      update: {},
      create: { pokemonId, name },
    });
  }

  async removeFavorite(pokemonId: number): Promise<void> {
    /**
     * Removes a Pokémon from favorites.
     * @param pokemonId - The Pokémon's ID
     */
    await this.prisma.favorite.deleteMany({ where: { pokemonId } });
  }

  async getFavorites(): Promise<Favorite[]> {
    /**
     * Retrieves all favorites, ordered by creation date.
     * @returns Array of favorites
     */
    const favorites = await this.prisma.favorite.findMany({
      orderBy: { createdAt: "desc" },
    });
    return favorites.map((f) => ({
      id: parseInt(f.id),
      pokemonId: f.pokemonId,
      name: f.name,
      createdAt: f.createdAt.toISOString(),
    }));
  }

  async isFavorite(pokemonId: number): Promise<boolean> {
    /**
     * Checks if a Pokémon is in favorites.
     * @param pokemonId - The Pokémon's ID
     * @returns True if favorite
     */
    const count = await this.prisma.favorite.count({ where: { pokemonId } });
    return count > 0;
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
