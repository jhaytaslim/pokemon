import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

interface PokemonDetails {
  abilities: { ability: { name: string } }[];
  types: { type: { name: string } }[];
  evolutions: string[];
}

const PokemonModal: React.FC<{ pokemonName: string; onClose: () => void }> = ({
  pokemonName,
  onClose,
}) => {
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/pokemon/${pokemonName}`
        );
        setDetails({
          abilities: data.abilities,
          types: data.types,
          evolutions: data.evolutions || [],
        });
      } catch (error) {
        console.error("Failed to fetch details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [pokemonName]);

  if (loading) return <div className="pokemon-modal__loading">Loading...</div>;

  return (
    <AnimatePresence>
      <motion.div
        className="pokemon-modal"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="pokemon-modal__overlay" onClick={onClose} />
        <motion.div
          className="pokemon-modal__content"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
        >
          {/* FIXED: New header */}
          <div className="pokemon-modal__header">
            <h2 className="pokemon-modal__title">{pokemonName}</h2>
            <button className="pokemon-modal__close-btn" onClick={onClose}>
              ×
            </button>
          </div>

          {/* FIXED: New body with sections */}
          <div className="pokemon-modal__body">
            <section className="pokemon-modal__section">
              <h3>Abilities</h3>
              <ul>
                {details?.abilities.map((a) => (
                  <li key={a.ability.name}>{a.ability.name}</li>
                ))}
              </ul>
            </section>
            <section className="pokemon-modal__section">
              <h3>Types</h3>
              <ul>
                {details?.types.map((t) => (
                  <li key={t.type.name}>{t.type.name}</li>
                ))}
              </ul>
            </section>
            {details?.evolutions && details?.evolutions?.length > 0 && (
              <section className="pokemon-modal__section">
                <h3>Evolutions</h3>
                <ul>
                  {details.evolutions.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* FIXED: New footer */}
          <div className="pokemon-modal__footer">
            <button onClick={onClose} className="bg-blue-500 text-white">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PokemonModal;
