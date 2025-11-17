import React, { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion"; // For subtle animations

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  initialValue?: string;
}

/**
 * SearchBar component for filtering Pokémon by name.
 * Debounces input to avoid excessive re-renders.
 * @param onSearch - Callback to update search term in parent
 * @param placeholder - Optional placeholder text
 * @param initialValue - Optional initial search value
 */
const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search Pokémon...",
  initialValue = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);

  // Debounce search term (300ms delay)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Notify parent of debounced change
  useEffect(() => {
    onSearch(debouncedTerm);
  }, [debouncedTerm, onSearch]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase()); // Normalize to lowercase for filtering
  };

  const handleClear = () => {
    setSearchTerm("");
  };

  return (
    <motion.div
      className="search-bar"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="search-bar__input-wrapper">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="search-bar__input"
          aria-label="Search Pokémon by name"
        />
        {searchTerm && (
          <motion.button
            className="search-bar__clear-btn"
            onClick={handleClear}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Clear search"
          >
            ×
          </motion.button>
        )}
      </div>
      {debouncedTerm && (
        <motion.p
          className="search-bar__results-count"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={debouncedTerm} // Remount for animation
        >
          Showing results for "{debouncedTerm}"
        </motion.p>
      )}
    </motion.div>
  );
};

export default SearchBar;
