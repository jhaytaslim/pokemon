import { Router } from "express";
import * as pokemonController from "../controllers/pokemon";
import * as favoritesController from "../controllers/favorites";

const router = Router();

router.get("/pokemon", pokemonController.getPokemonList);
router.get("/pokemon/:id", pokemonController.getPokemonDetails);

router.post("/favorites", favoritesController.addFavorite);
router.delete("/favorites/:pokemonId", favoritesController.removeFavorite);
router.get("/favorites", favoritesController.getFavorites);

export default router;
