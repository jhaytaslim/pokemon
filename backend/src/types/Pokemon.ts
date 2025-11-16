/**
 * Basic Pokémon list item from PokéAPI /pokemon endpoint.
 */
export interface PokemonListItem {
  name: string;
  url: string;
}

/**
 * Full Pokémon details from /pokemon/{id}.
 */
export interface PokemonDetails {
  id: number;
  name: string;
  abilities: Array<{
    ability: {
      name: string;
    };
    is_hidden: boolean;
    slot: number;
  }>;
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  species: {
    name: string;
    url: string;
  };
  evolutions: string[]; // Simplified evolution names (bonus feature)
  sprites: {
    front_default: string;
  };
}

/**
 * Response for Pokémon list endpoint.
 */
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}
