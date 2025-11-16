import { Request, Response } from "express";
import { FavoritesRepository } from "../repositories/favoritesRepository";
import { AddFavoriteRequest } from "../types"; // From types

let favoritesRepo: FavoritesRepository;

/**
 * Initializes the repository (called on server start).
 */
export async function initFavoritesRepo(): Promise<void> {
  favoritesRepo = new FavoritesRepository();
}

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Add a Pokémon to favorites
 *     tags: [Favorites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddFavoriteRequest'
 *     responses:
 *       201:
 *         description: Successfully added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Added to favorites
 *       500:
 *         description: Server error
 */
export const addFavorite = async (
  req: Request<{}, {}, AddFavoriteRequest>,
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
 * @swagger
 * /favorites/{pokemonId}:
 *   delete:
 *     summary: Remove a Pokémon from favorites
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: pokemonId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the Pokémon
 *     responses:
 *       200:
 *         description: Successfully removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Removed from favorites
 *       500:
 *         description: Server error
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
 * @swagger
 * /favorites:
 *   get:
 *     summary: Get all favorites
 *     tags: [Favorites]
 *     responses:
 *       200:
 *         description: List of favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Favorite'
 *       500:
 *         description: Server error
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
