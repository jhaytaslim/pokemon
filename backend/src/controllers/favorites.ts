import { Request, Response } from "express";
import { FavoritesRepository } from "../repositories/favoritesRepository";

let favoritesRepo: FavoritesRepository;

/**
 * Initializes the repository (called on server start).
 */
export async function initFavoritesRepo(): Promise<void> {
  favoritesRepo = new FavoritesRepository();
}

/**
 * Adds favorite.
 */
export const addFavorite = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pokemonId, name } = req.body;
  try {
    await favoritesRepo.addFavorite(pokemonId, name);
    res.status(201).json({ message: "Added to favorites" });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
};

/**
 * Removes favorite.
 */
export const removeFavorite = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { pokemonId } = req.params;
  try {
    await favoritesRepo.removeFavorite(parseInt(pokemonId));
    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};

/**
 * Gets all favorites.
 */
export const getFavorites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const favorites = await favoritesRepo.getFavorites();
    res.json(favorites);
  } catch (error) {
    console.error("DB Error:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
};
