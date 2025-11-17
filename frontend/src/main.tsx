import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // NEW: Import React Query
import App from "./App.tsx";
import { FavoritesProvider } from "./context/FavoritesContext";
import "./styles/global.css";

const queryClient = new QueryClient(); // NEW: Create QueryClient instance

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {" "}
      {/* NEW: Wrap with QueryClientProvider */}
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
