/**
 * Interface for a Favorite Pokémon entry in the database.
 * Matches Prisma Favorite model.
 */
export interface Favorite {
  id: number; // Note: Parsed from MongoDB ObjectId for simplicity
  pokemonId: number;
  name: string;
  createdAt: string; // ISO string
}

/**
 * Request body for adding a favorite.
 */
export interface AddFavoriteRequest {
  pokemonId: number;
  name: string;
}
