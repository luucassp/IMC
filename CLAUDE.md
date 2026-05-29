# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Front-end (root)
```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build
```

### Back-end (server/)
```bash
cd server
cp .env.example .env          # set JWT_SECRET; DATABASE_URL defaults to SQLite
npm install
npx prisma migrate dev        # create DB and generate Prisma Client
npm run build && npm start    # API at http://localhost:3333
npm run start:dev             # API with file watch
```

### Prisma
```bash
cd server
npx prisma migrate dev        # apply pending migrations + generate client
npx prisma generate           # regenerate client without migrating
```

No test suite exists yet — manual testing only.

## Architecture

This is a full-stack personal fitness app. The front-end is a React SPA built with Vite; the back-end is a NestJS REST API backed by Prisma + SQLite (swappable to PostgreSQL by changing `provider` and `DATABASE_URL`).

### Front-end flow (`src/`)

`App.jsx` is the root orchestrator. It drives a four-stage view machine:
1. **Auth** — unauthenticated users land on `Auth.jsx` (email/password or Google OAuth)
2. **Onboarding** — users without a saved profile fill `Onboarding.jsx` (multi-step form)
3. **Resultado** — IMC + training recommendation (`Resultado.jsx`)
4. **Plano** — full training plan with session tracking, rest timer, load log, dashboard (`Plano.jsx`)

The token is persisted in `localStorage` via `src/lib/storage.js`. On load, `App` re-validates the token against `GET /auth/me` and fetches the profile; a bad token clears state and drops back to the Auth screen.

Pure client-side logic lives in `src/lib/`:
- `imc.js` — BMI calculation + WHO classification
- `recomendacao.js` — rule engine that maps profile fields + BMI to a training recommendation object
- `plano.js` — builds the weekly plan structure from the recommendation
- `fadiga.js` — intensity modifier based on the "how are you today?" input
- `semana.js` — weekly status tracking and missed-session rescheduling logic
- `tempo.js` — rest interval parsing/formatting
- `api.js` — thin `fetch` wrapper; all calls receive `token` explicitly from App state (no global auth context)

`src/data/planos.js` is the static library of training days and split templates. `src/data/onboarding.js` defines the dropdown options for the multi-step onboarding form.

### Back-end (`server/src/`)

NestJS modules map cleanly to domain concerns:
- `auth/` — register, login, Google OAuth (`POST /auth/google` validates an ID token via `google-auth-library`), JWT issuance/validation via `passport-jwt`
- `perfil/` — `GET /perfil` + `PUT /perfil` (upsert), protected by `JwtAuthGuard`
- `treino/` — three controllers sharing one `TreinoService`:
  - `historico.controller.ts` — `GET /historico`, `POST /historico` (completed sessions)
  - `registro.controller.ts` — `GET /registros`, `POST /registros` (set-level load × reps)
  - `dashboard.controller.ts` — `GET /dashboard` (aggregated frequency + progression data)
- `prisma/` — `PrismaService` wraps the Prisma client, exposed globally via `PrismaModule`

`@CurrentUser()` is a custom param decorator in `auth/current-user.decorator.ts` that extracts the JWT payload from the request.

Global `ValidationPipe` with `whitelist: true, transform: true` is applied in `main.ts` — DTOs use `class-validator` decorators and numeric fields are auto-coerced.

### Database schema key points

- `Perfil.equipamentos` and `Perfil.restricoes` are stored as JSON-serialized strings because SQLite has no native array type. Deserialize before use.
- `User.senhaHash` is nullable to support social-login-only accounts.
- All child models (`Perfil`, `Historico`, `Registro`) cascade-delete when the user is deleted.

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | `server/.env` | SQLite path or Postgres URL |
| `JWT_SECRET` | `server/.env` | JWT signing key |
| `PORT` | `server/.env` | API port (default 3333) |
| `GOOGLE_CLIENT_ID` | `server/.env` | Google OAuth (optional) |
| `VITE_API_URL` | `.env.local` (root) | Front-end API base URL (default `http://localhost:3333`) |
| `VITE_GOOGLE_CLIENT_ID` | `.env.local` (root) | Shows Google button in Auth when set |

The Google login button only renders when `VITE_GOOGLE_CLIENT_ID` is present. Without it, email/password auth works normally and `POST /auth/google` returns 503.

### `legacy/`

Original plain-HTML/CSS/JS BMI calculator — preserved for reference, not part of the React app.
