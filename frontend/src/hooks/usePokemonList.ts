import { useState, useEffect } from "react";
import axios from "axios";

interface Pokemon {
  name: string;
  url: string;
}

export const usePokemonList = () => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/pokemon`
        );
        setPokemonList(data.results || []);
      } catch (err) {
        setError("Failed to load Pokémon");
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, []);

  return { pokemonList, loading, error };
};
