export const AppConfig = {
  PORT: process.env.PORT || 4001,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "mongodb://localhost:27017/pokemon_favorites?retryWrites=true&w=majority",
};
