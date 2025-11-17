import React, { useState, useEffect, useRef } from "react"; // Add useRef
import { motion } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites"; // Adjust import if needed
import { usePokemonList } from "@/hooks/usePokemonList";
import PokemonModal from "@/components/PokemonModal";
import SearchBar from "@/components/SearchBar";

const PokemonList: React.FC = () => {
  const { pokemonList, loading, error } = usePokemonList();
  const {
    isFavorite,
    addFavorite,
    removeFavorite,
    loading: favLoading,
  } = useFavorites();
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(20); // Lazy load threshold

  // FIXED: Use useRef + useEffect for observer (replaces useCallback ref)
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && visibleCount < pokemonList.length) {
          setVisibleCount((prev) => prev + 10);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [visibleCount, pokemonList.length]); // Re-run if deps change

  const filteredList = pokemonList
    .filter(
      (p) =>
        !filterFavorites ||
        isFavorite(parseInt(p.url.split("/").slice(-2, -1)[0]))
    )
    .filter((p) => p.name.includes(searchTerm.toLowerCase()))
    .slice(0, visibleCount);

  if (loading)
    return <div className="pokemon-list__loading">Loading Pokémon...</div>;
  if (error) return <div className="pokemon-list__error">Error: {error}</div>;

  return (
    <div className="pokemon-list">
      <div className="pokemon-list__header">
        <SearchBar onSearch={setSearchTerm} />
        <button
          className="pokemon-list__filter-btn"
          onClick={() => setFilterFavorites(!filterFavorites)}
        >
          {filterFavorites ? "Show All" : "Favorites Only"}
        </button>
      </div>
      <ul className="pokemon-list__items">
        {filteredList.map((pokemon, index) => {
          const id = parseInt(pokemon.url.split("/").slice(-2, -1)[0]);
          const isFav = isFavorite(id);
          return (
            <motion.li
              key={pokemon.name}
              className={`pokemon-list__item ${isFav ? "pokemon-list__item--favorite" : ""}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                alt={pokemon.name}
                className="pokemon-list__item-img"
                loading="lazy"
              />
              <span className="pokemon-list__item-name">{pokemon.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFav) removeFavorite(id);
                  else addFavorite({ pokemonId: id, name: pokemon.name });
                }}
                disabled={favLoading}
                className="pokemon-list__favorite-btn"
              >
                {isFav ? "❤️" : "🤍"}
              </button>
              <button onClick={() => setSelectedPokemon(pokemon.name)}>
                View Details
              </button>
            </motion.li>
          );
        })}
        {visibleCount < pokemonList.length && (
          <div ref={loaderRef} className="pokemon-list__loader">
            Loading more...
          </div> // FIXED: Use ref={loaderRef}
        )}
      </ul>
      {selectedPokemon && (
        <PokemonModal
          pokemonName={selectedPokemon}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
    </div>
  );
};

export default PokemonList;
