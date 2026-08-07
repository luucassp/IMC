# Deploy

Arquitetura em produção:

```
Front (Netlify)  ──>  Backend (Render)  ──>  PostgreSQL (Supabase/Neon)
```

## 1. Banco — PostgreSQL (Supabase, free)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **Project Settings → Database**, copie a **Connection string** (URI).
   Use a conexão direta (porta `5432`).
3. Guarde como `DATABASE_URL`, no formato:
   `postgresql://postgres:SENHA@db.SEUREF.supabase.co:5432/postgres`

> Neon ([neon.tech](https://neon.tech)) funciona igual, se preferir.

## 2. Backend — Render (free)

1. Em [render.com](https://render.com): **New → Blueprint** e aponte para este repo
   (o `server/render.yaml` já configura o serviço).
2. Defina as variáveis quando pedir:
   - `DATABASE_URL` → a do passo 1
   - `CORS_ORIGIN` → a URL do front (preencha depois do passo 3; pode reeditar)
   - `GOOGLE_CLIENT_ID` → opcional (login com Google)
   - `JWT_SECRET` → o Render gera sozinho
3. O build roda `prisma db push` (cria as tabelas) e sobe a API.
4. Anote a URL pública (ex.: `https://sltreiners-api.onrender.com`).

> Railway é alternativa: build `npm install && npm run build`, start `npm start`,
> rode `npx prisma db push` uma vez, e defina as mesmas variáveis.

## 3. Front — Netlify

1. Em [netlify.com](https://netlify.com): **Add new site → Import from Git**, escolha o repo.
2. O `netlify.toml` já define build (`npm run build`) e publish (`dist`).
3. Em **Site settings → Environment variables**, defina:
   - `VITE_API_URL` → a URL do backend (passo 2)
   - `VITE_GOOGLE_CLIENT_ID` → opcional (mesmo id do Google)
4. Deploy. Anote a URL do site (ex.: `https://sltreiners.netlify.app`).

## 4. Fechar o ciclo

1. Volte ao Render e ajuste `CORS_ORIGIN` para a URL do Netlify.
2. (Se usar Google) No Google Cloud Console, autorize a origem do Netlify.

## Rodando localmente com Postgres

```bash
# suba um Postgres local (Docker) — ou use a URL do Supabase no .env
docker run --name sltreiners-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sltreiners -p 5432:5432 -d postgres

cd server
cp .env.example .env          # ajuste DATABASE_URL e JWT_SECRET
npm install
npm run db:push               # cria as tabelas
npm start
```
