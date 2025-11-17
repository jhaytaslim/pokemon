/**
 * Utility functions for fetching and extracting Pokémon evolution chains from PokéAPI.
 * Limits recursion to prevent deep chains (e.g., 3 levels max).
 * Used in PokemonModal for displaying evolutions.
 */

/**
 * Recursively extracts evolution names from the chain data.
 * @param chain - The evolution chain object from PokéAPI (species + evolves_to array)
 * @param maxDepth - Maximum recursion depth (default 3)
 * @param depth - Current depth (internal, starts at 0)
 * @returns Array of evolution names (strings)
 */
export function extractEvolutionChain(
  chain: {
    species: { name: string };
    evolves_to: Array<{
      species: { name: string };
      evolves_to: Array<any>;
    }>;
  },
  maxDepth: number = 3,
  depth: number = 0
): string[] {
  const evolutions: string[] = [];

  if (depth >= maxDepth) {
    return evolutions; // Stop recursion
  }

  // Add current species name
  if (chain.species) {
    evolutions.push(chain.species.name);
  }

  // Recurse into branches
  if (chain.evolves_to && chain.evolves_to.length > 0) {
    chain.evolves_to.forEach((evo) => {
      evolutions.push(...extractEvolutionChain(evo, maxDepth, depth + 1));
    });
  }

  return evolutions;
}

/**
 * Async wrapper to fetch full evolution chain if needed.
 * @param speciesUrl - URL to Pokémon species endpoint
 * @returns Promise<string[]> - Array of evolution names
 */
export async function fetchEvolutionChain(
  speciesUrl: string
): Promise<string[]> {
  try {
    const response = await fetch(speciesUrl);
    const species = await response.json();

    if (!species.evolution_chain?.url) {
      return []; // No evolutions
    }

    const chainResponse = await fetch(species.evolution_chain.url);
    const chainData = await chainResponse.json();

    return extractEvolutionChain(chainData.chain, 3);
  } catch (error) {
    console.error("Failed to fetch evolution chain:", error);
    return [];
  }
}

/**
 * Utility to get evolution display text (e.g., "Evolves to: Ivysaur → Venusaur").
 * @param evolutions - Array of names
 * @returns Formatted string for UI
 */
export function formatEvolutionText(evolutions: string[]): string {
  if (evolutions.length <= 1) {
    return "No evolutions available.";
  }
  return `Evolves to: ${evolutions.slice(1).join(" → ")}`;
}
