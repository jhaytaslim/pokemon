import swaggerJSDoc from "swagger-jsdoc";
import { AppConfig } from "../config";

/**
 * Swagger/OpenAPI configuration options.
 */
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pokémon Favorites API",
      version: "1.0.0",
      description:
        "API for browsing Pokémon and managing favorites, proxying PokéAPI with MongoDB persistence.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      servers: [
        {
          url: `http://localhost:${AppConfig.PORT}/api`,
          description: "Development server",
        },
        {
          url: "https://pokemon-favorites-backend.onrender.com/api",
          description: "Production server",
        },
      ],
    },
    components: {
      schemas: {
        Favorite: {
          type: "object",
          properties: {
            id: { type: "integer" },
            pokemonId: { type: "integer" },
            name: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["pokemonId", "name"],
        },
        AddFavoriteRequest: {
          type: "object",
          properties: {
            pokemonId: { type: "integer" },
            name: { type: "string" },
          },
          required: ["pokemonId", "name"],
        },
        PokemonListItem: {
          type: "object",
          properties: {
            name: { type: "string" },
            url: { type: "string" },
          },
        },
        PokemonListResponse: {
          type: "object",
          properties: {
            count: { type: "integer" },
            next: { type: "string", nullable: true },
            previous: { type: "string", nullable: true },
            results: {
              type: "array",
              items: { $ref: "#/components/schemas/PokemonListItem" },
            },
          },
        },
        PokemonDetails: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            abilities: { type: "array", items: { type: "object" } },
            types: { type: "array", items: { type: "object" } },
            species: { type: "object" },
            evolutions: { type: "array", items: { type: "string" } },
            sprites: { type: "object" },
          },
        },
      },
    },
    tags: [
      { name: "Pokémon", description: "PokéAPI proxy endpoints" },
      { name: "Favorites", description: "Favorites management" },
    ],
  },
  apis: ["./src/controllers/*.ts"], // Scans JSDoc in controllers
};

export const specs = swaggerJSDoc(options);
