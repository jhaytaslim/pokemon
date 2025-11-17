import React from "react";
import PokemonList from "./components/PokemonList";
import { FavoritesProvider } from "./context/FavoritesContext";
import "./styles/global.css";

const App: React.FC = () => (
  <FavoritesProvider>
    <div className="app">
      <header className="app__header">
        <h1>Pokémon Favorites</h1>
      </header>
      <main className="app__main">
        <PokemonList />
      </main>
    </div>
  </FavoritesProvider>
);

export default App;
