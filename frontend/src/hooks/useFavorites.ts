import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"; // Assumes React Query setup (bonus for caching)
import api from "@/services/api"; // Axios instance
import { Favorite } from "@/types";

/**
 * Custom hook for managing favorites: fetch, add, remove, and check status.
 * Uses React Query for mutations and queries.
 * @returns Object with favorites data, mutations, and utils
 */
export const useFavorites = () => {
  const queryClient = useQueryClient();
  const [filterFavorites, setFilterFavorites] = useState(false); // Local filter state (can be global)

  // Query: Fetch favorites list
  const {
    data: favorites = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<Favorite[]>({
    queryKey: ["favorites"],
    queryFn: async () => {
      const { data } = await api.get("/favorites");
      return data;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Mutation: Add favorite
  const addMutation = useMutation({
    mutationFn: async (favorite: Omit<Favorite, "id" | "createdAt">) => {
      await api.post("/favorites", favorite);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] }); // Refetch list
    },
    onError: (err) => {
      console.error("Failed to add favorite:", err);
      // Could add toast notification here
    },
  });

  // Mutation: Remove favorite
  const removeMutation = useMutation({
    mutationFn: async (pokemonId: number) => {
      await api.delete(`/favorites/${pokemonId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
    onError: (err) => {
      console.error("Failed to remove favorite:", err);
    },
  });

  const isFavorite = (pokemonId: number): boolean => {
    if (!Array.isArray(favorites)) return false;
    return favorites.some((f) => f.pokemonId === pokemonId);
  };

  // Effect: Initial load (optional, as query handles it)
  useEffect(() => {
    refetch();
  }, []);

  return {
    favorites,
    loading: loading || addMutation.isPending || removeMutation.isPending,
    error,
    addFavorite: addMutation.mutate,
    removeFavorite: removeMutation.mutate,
    isFavorite,
    filterFavorites,
    setFilterFavorites,
    refetchFavorites: refetch,
  };
};
