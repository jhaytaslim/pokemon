import api from "@/services/api";
import { Favorite } from "@/types";
import axios from "axios";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface FavoritesContextType {
  favorites: Favorite[];
  addFavorite: (pokemon: Favorite) => void;
  removeFavorite: (pokemonId: number) => void;
  isFavorite: (pokemonId: number) => boolean;
  loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context)
    throw new Error("useFavorites must be used within FavoritesProvider");
  return context;
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const addFavorite = async (pokemon: Favorite) => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/favorites`, pokemon);
      setFavorites((prev) => [...prev, pokemon]);
    } catch (error) {
      console.error("Failed to add favorite");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (pokemonId: number) => {
    setLoading(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/favorites/${pokemonId}`
      );
      setFavorites((prev) => prev.filter((f) => f.pokemonId !== pokemonId));
    } catch (error) {
      console.error("Failed to remove favorite");
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (pokemonId: number) =>
    favorites.some((f) => f.pokemonId === pokemonId);

  // Load favorites on mount
  // React.useEffect(() => {
  //   const fetchFavorites = async () => {
  //     try {
  //       const { data } = await axios.get(
  //         `${import.meta.env.VITE_API_URL}/favorites`
  //       );
  //       setFavorites(data);
  //     } catch (error) {
  //       console.error("Failed to load favorites");
  //     }
  //   };
  //   fetchFavorites();
  // }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const { data } = (await api.get("/favorites")) || {};
        // const { data } =
        //   (await axios.get(`${import.meta.env.VITE_API_URL}/favorites`)) || {};

        if (Array.isArray(data)) {
          setFavorites(data);
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error("API Error:", err); // Log full error
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite, loading }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
