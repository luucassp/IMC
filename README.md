# IMC + Treino

App de treino personalizado que começa pelo cálculo de IMC. O usuário passa por
um **onboarding** (perfil físico), recebe uma **recomendação** por regras
(divisão, frequência, reps, descanso, ênfase) e acessa o **plano completo** com
exercícios, cronômetro de descanso, registro de carga e dashboard de evolução.

Projeto em evolução, construído passo a passo a partir da calculadora de IMC
original (preservada em [`legacy/`](./legacy)).

## Funcionalidades

- Onboarding multi-etapas (perfil físico)
- Cálculo e classificação de IMC (padrão OMS)
- Recomendação de treino por regras (objetivo, nível, disponibilidade, IMC)
- Plano completo: dias, exercícios e progressão (UI do bloco de treino)
- Cronômetro de descanso por exercício (RF06)
- Registro de carga × reps por série e histórico de sessões (RF04/RF05)
- Dashboard de evolução: consistência semanal e progressão de carga (RF07)
- Trocar o objetivo a qualquer momento (RF08)
- Persistência local (localStorage), sem necessidade de refazer o onboarding

## Stack

- **Front-end**: React 18 + Vite (raiz do repositório)
- **Back-end**: NestJS + Prisma + SQLite (em [`server/`](./server)); SQLite no dev,
  pronto para PostgreSQL em produção (basta trocar `provider` e `DATABASE_URL`)
- **Auth**: JWT (e-mail/senha, senha com hash bcrypt)

> Login, perfil, histórico e registros de carga passam pela API, por usuário.
> No front, o `localStorage` guarda apenas o token de sessão.

## Como rodar

> Suba o **back-end** primeiro; o front precisa dele para login e perfil.

### Front-end (raiz)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de produção em dist/
```

Por padrão o front aponta para `http://localhost:3333`. Para mudar, crie um
`.env.local` na raiz com `VITE_API_URL=...`.

### Back-end (server/)

```bash
cd server
cp .env.example .env          # ajuste JWT_SECRET; DATABASE_URL já aponta p/ SQLite
npm install
npx prisma migrate dev        # cria o banco e gera o Prisma Client
npm run build && npm start    # API em http://localhost:3333
# ou: npm run start:dev       # com watch
```

#### Endpoints

| Método | Rota             | Auth | Descrição                          |
| ------ | ---------------- | ---- | ---------------------------------- |
| POST   | `/auth/register` | —    | Cria conta → `{ token, user }`     |
| POST   | `/auth/login`    | —    | Autentica → `{ token, user }`      |
| GET    | `/auth/me`       | JWT  | Dados do usuário autenticado       |
| GET    | `/perfil`        | JWT  | Perfil físico (ou `null`)          |
| PUT    | `/perfil`        | JWT  | Cria/atualiza o perfil físico      |
| GET    | `/historico`     | JWT  | Sessões concluídas (mais recentes) |
| POST   | `/historico`     | JWT  | Registra uma sessão concluída      |
| GET    | `/registros`     | JWT  | Séries registradas (carga × reps)  |
| POST   | `/registros`     | JWT  | Registra uma série                 |

## Estrutura

```
src/
  components/
    Auth.jsx         # tela de login / registro
    Onboarding.jsx   # questionário multi-etapas (perfil físico)
    Resultado.jsx    # IMC + classificação + recomendação + trocar objetivo
    Plano.jsx        # plano completo (treino, progressão, semana, evolução)
    RestTimer.jsx    # cronômetro de descanso flutuante
    MiniGrafico.jsx  # gráfico de barras em SVG (sem dependências)
  data/
    onboarding.js    # opções dos campos (objetivos, níveis, equipamentos...)
    planos.js        # biblioteca de dias de treino + templates de divisão
  lib/
    api.js           # cliente HTTP da API (auth + perfil)
    imc.js           # cálculo e classificação de IMC (padrão OMS)
    recomendacao.js  # motor de recomendação por regras
    plano.js         # monta o plano e a semana a partir da recomendação
    storage.js       # token de sessão no localStorage
    tempo.js         # parsing/format de descanso
    estatisticas.js  # agregações do dashboard (frequência, progressão)
  App.jsx
  main.jsx
legacy/              # calculadora de IMC original (HTML/CSS/JS puro)

server/
  prisma/
    schema.prisma    # modelos User e Perfil
    migrations/      # migrations versionadas
  src/
    auth/            # registro, login, JWT (estratégia, guard, decorator)
    perfil/          # CRUD do perfil físico (protegido por JWT)
    treino/          # histórico de sessões + registros de carga (JWT)
    prisma/          # PrismaService/Module
    main.ts          # bootstrap (CORS + ValidationPipe)
    app.module.ts
```

## Próximos passos

- OAuth (Google/Apple) e troca de SQLite por PostgreSQL gerenciado.
- Substituir as regras fixas por personalização adaptativa.
- Ajuste por fadiga e reorganização automática da semana ao faltar treino.
