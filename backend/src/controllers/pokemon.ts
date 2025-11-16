import axios from "axios";
import { Request, Response } from "express";
import { PokemonListResponse, PokemonDetails } from "../types";

/**
 * @swagger
 * /pokemon:
 *   get:
 *     summary: Fetch first 150 Pokémon
 *     tags: [Pokémon]
 *     responses:
 *       200:
 *         description: Pokémon list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PokemonListResponse'
 *       500:
 *         description: Proxy error
 */
export const getPokemonList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { data } = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=150"
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Pokémon list" });
  }
};

/**
 * @swagger
 * /pokemon/{id}:
 *   get:
 *     summary: Get Pokémon details including evolutions
 *     tags: [Pokémon]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Pokémon ID or name
 *     responses:
 *       200:
 *         description: Pokémon details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PokemonDetails'
 *       500:
 *         description: Proxy error
 */
export const getPokemonDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  try {
    const { data: pokemon } = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${id}`
    );
    let evolutions: any[] = [];
    if (pokemon.species.url) {
      const { data: species } = await axios.get(pokemon.species.url);
      if (species.evolution_chain.url) {
        const { data: chain } = await axios.get(species.evolution_chain.url);
        evolutions = extractEvolutionChain(chain.chain, 3); // Limit depth
      }
    }
    res.json({ ...pokemon, evolutions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Pokémon details" });
  }
};

function extractEvolutionChain(chain: any, maxDepth: number, depth = 0): any[] {
  const evos: any[] = [];
  if (depth >= maxDepth) return evos;
  if (chain.species) evos.push(chain.species.name);
  if (chain.evolves_to.length > 0) {
    chain.evolves_to.forEach((evo: any) => {
      evos.push(...extractEvolutionChain(evo, maxDepth, depth + 1));
    });
  }
  return evos;
}
