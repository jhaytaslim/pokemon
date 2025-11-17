
# Pokémon Favorites App

## Overview

The Pokémon Favorites App is a full-stack web application that allows users to browse the first 150 Pokémon from the PokéAPI, view detailed information (abilities, types, and evolution chains), and manage a personal favorites list. Favorites are persisted in a MongoDB database using Prisma ORM. The app features a clean, responsive UI with animations, search/filtering, and lazy loading.

* **Frontend** : React with TypeScript, Vite for bundling, Tailwind CSS for styling, and Framer Motion for animations.
* **Backend** : Node.js with Express, TypeScript, Prisma for DB interactions, and Swagger for API docs.
* **Database** : MongoDB (replica set for transactions).
* **Package Manager** : pnpm (workspace monorepo).
* **Local Dev** : Docker Compose for full stack (MongoDB, backend, frontend).
* **Deployment** : Render (backend as Web Service, frontend as Static Site).

The app is production-ready, testable, and extensible. Live demo: [Frontend](https://pokemon-favorites-frontend.onrender.com) | [Backend API Docs](https://pokemon-favorites-backend.onrender.com/api-docs).

## Features

### Frontend

* Scrollable grid of 150 Pokémon with lazy loading and smooth animations.
* Modal details view on click: abilities, types, and limited evolution chain.
* Add/remove favorites with heart icon toggle (optimistic UI).
* Filter to show only favorites.
* Search bar with debounced input for name filtering.
* Responsive design (mobile/desktop) with BEM + Tailwind.

### Backend

* Proxy endpoints for PokéAPI (list Pokémon, get details with evolutions).
* REST API for favorites: GET/POST/DELETE /api/favorites.
* Persistence with Prisma + MongoDB (upsert for no-duplicates).
* Swagger/OpenAPI docs at /api-docs (interactive Try It Out).
* Error handling and logging.

### Bonus

* Unit/integration tests (Jest backend, Vitest frontend).
* Dockerized local setup (one-command stack).
* TypeScript end-to-end for type safety.
* CI-ready (GitHub Actions optional).

## Tech Stack

| Layer                | Technologies                                                                   |
| -------------------- | ------------------------------------------------------------------------------ |
| **Frontend**   | React 18, TypeScript, Vite, Tailwind CSS v3, Framer Motion, Axios, React Query |
| **Backend**    | Node.js 20, Express, TypeScript, Prisma v5, Swagger                            |
| **Database**   | MongoDB 7.0 (replica set)                                                      |
| **Tools**      | pnpm (monorepo), Docker Compose, Jest/Vitest                                   |
| **Deployment** | Render, Vercel (frontend alt)                                                  |

## Prerequisites

* **Node.js** : v18+ (recommend v20; install via [nvm](https://github.com/nvm-sh/nvm)).
* **pnpm** : v8+ (npm i -g pnpm).
* **Docker** : Desktop + Compose v2+ (for local stack).
* **MongoDB Atlas** : Free account for prod DB (optional for local Docker).
* **Git** : For cloning.

## Local Setup

### Option 1: Docker Compose (Recommended - Full Stack)

One-command setup with MongoDB, backend, and frontend.

1. Clone repo:
   text

   ```
   git clone <repo-url> pokemon-favorites-app
   cd pokemon-favorites-app
   ```
2. Copy .env.example to .env and update:
   text

   ```
   # Ports (host:container)
   BACKEND_PORT=4001
   FRONTEND_PORT=3000
   MONGO_PORT=27017

   # DB credentials
   MONGO_ROOT_USERNAME=root
   MONGO_ROOT_PASSWORD=example
   MONGO_DB_NAME=pokemon_favorites

   # Backend env
   BACKEND_DATABASE_URL=mongodb://$$ {MONGO_ROOT_USERNAME}: $${MONGO_ROOT_PASSWORD}@mongo:27017/${MONGO_DB_NAME}?authSource=admin&retryWrites=true&w=majority&replicaSet=rs0

   # Frontend env
   VITE_API_URL=http://localhost:4001/api
   ```
3. Start stack:
   text

   ```
   docker compose up -d --build
   ```
4. Access:

   * Frontend: [http://localhost:3000](http://localhost:3000)
   * Backend API: [http://localhost:4001/api](http://localhost:4001/api)
   * Swagger Docs: [http://localhost:4001/api-docs](http://localhost:4001/api-docs)
   * Mongo: localhost:27017 (mongosh for inspection)
5. Stop:
   text

   ```
   docker compose down
   ```

   Add --volumes to reset DB.

### Option 2: Manual (No Docker)

Run services separately.

#### Backend

1. cd backend
2. pnpm install
3. Update .env (as above, without Docker internals).
4. Start local MongoDB (brew: brew services start mongodb/brew/mongodb-community).
5. pnpm prisma generate && pnpm prisma db push
6. pnpm dev[](http://localhost:4001)

#### Frontend

1. cd frontend
2. pnpm install
3. Update .env (VITE_API_URL=[http://localhost:4001/api](http://localhost:4001/api))
4. pnpm dev[](http://localhost:3000)

## Usage

### App

1. Open [http://localhost:3000](http://localhost:3000).
2. Browse Pokémon list (search/filter).
3. Click "View Details" for modal.
4. Toggle hearts for favorites (filter to view).

### API

Test with Swagger[](http://localhost:4001/api-docs) or curl:

text

```
# List favorites
curl http://localhost:4001/api/favorites

# Add favorite
curl -X POST http://localhost:4001/api/favorites -H "Content-Type: application/json" -d '{"pokemonId":1,"name":"bulbasaur"}'

# Remove favorite
curl -X DELETE http://localhost:4001/api/favorites/1

# Get Pokémon
curl http://localhost:4001/api/pokemon/1
```

## Project Structure

text

```
pokemon-favorites-app/
├── backend/                  # Node.js API
│   ├── Dockerfile
│   ├── prisma/schema.prisma  # DB models
│   ├── src/
│   │   ├── controllers/      # API handlers (favorites.ts, pokemon.ts)
│   │   ├── repositories/     # DB layer (favoritesRepository.ts)
│   │   ├── routes/           # Express routes (index.ts)
│   │   ├── server.ts         # Entry (with Swagger)
│   │   └── types/            # Interfaces (Favorite.ts, Pokemon.ts)
│   ├── tests/                # Jest (unit, integration, db)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React app
│   ├── Dockerfile
│   ├── src/
│   │   ├── components/       # UI (PokemonList.tsx, PokemonModal.tsx, SearchBar.tsx)
│   │   ├── hooks/            # Logic (usePokemonList.ts, useFavorites.ts)
│   │   ├── services/         # Axios (api.ts)
│   │   ├── styles/global.css # Tailwind + BEM
│   │   ├── utils/            # Helpers (evolutionFetcher.ts)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/                # Vitest
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── docker-compose.yml        # Local stack
├── .env.example              # Template
├── pnpm-workspace.yaml       # Monorepo
├── README.md
└── .gitignore
```

## Scripts

### Root (Monorepo)

* pnpm install: Install all.
* pnpm dev: Parallel dev (backend + frontend).

### Backend

* pnpm dev: Dev server (tsx watch).
* pnpm build: Compile (tsc).
* pnpm test: Tests (Jest).
* pnpm prisma generate: Prisma client.
* pnpm prisma db push: Schema sync.

### Frontend

* pnpm dev: Vite dev.
* pnpm build: Prod build.
* pnpm test: Tests (Vitest).
* pnpm lint: ESLint.

## Testing

* **Backend** : Jest for unit/integration/DB (pnpm test in backend).
* **Frontend** : Vitest + React Testing Library (pnpm test in frontend).
* Coverage: >95% targeted; run with --coverage.

## Deployment to Render

1. **Backend (Web Service)** :

* New > Web Service > Connect GitHub repo (root).
* Runtime: Docker (uses backend/Dockerfile).
* Env Vars:
  * DATABASE_URL: MongoDB Atlas URI (with replicaSet if needed).
  * PORT: 10000 (Render default).
* Deploy: Auto-builds; URL: https://backend.onrender.com.

1. **Frontend (Static Site)** :

* New > Static Site > Connect repo.
* Build Command: cd frontend && pnpm install && pnpm build.
* Publish Directory: frontend/dist.
* Env Vars: VITE_API_URL=https://backend.onrender.com/api.
* Deploy: URL: https://frontend.onrender.com.

1. **Database** : MongoDB Atlas (free M0).

* Create cluster, user, network access (0.0.0.0/0).
* URI: mongodb+srv://user:pass@cluster.mongodb.net/pokemon_favorites?retryWrites=true&w=majority.

Auto-deploys on push. Add health route for checks.

## Troubleshooting

* **Port Conflicts** : Edit .env, rebuild.
* **Prisma Errors** : Run pnpm prisma generate locally; check DATABASE_URL/replicaSet.
* **Build Fails** : Ensure root pnpm-lock.yaml updated (pnpm install from root).
* **API Returns HTML** : Backend down; verify VITE_API_URL/proxy.
* **Replica Set** : If Mongo logs "already initialized", ok—set ready.
* **OpenSSL Warnings** : Debian image fixes; ignore if generate succeeds.

## Contributing

1. Fork/clone repo.
2. pnpm install (root).
3. Branch: git checkout -b feature/add-feature.
4. Commit: git commit -m "Add feature".
5. Push/PR to main.

Use ESLint/Prettier. Run tests before PR.

## License

MIT License. See LICENSE for details.

---

Questions? Open an issue or contact [[your-email@example.com](mailto:your-email@example.com)]. Built with ❤️ for Pokémon fans!
