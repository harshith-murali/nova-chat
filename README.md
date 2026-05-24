# Nova Chat

Nova Chat is an authenticated AI chat workspace built with Next.js App Router, React 19, Prisma, Better Auth, and the Vercel AI SDK. It provides persistent chat threads, selectable Anthropic/OpenRouter models, streaming assistant responses, and a polished productivity-focused interface with light and dark themes.

The product direction is captured in [docs/PRD.md](docs/PRD.md).

## Highlights

- Authenticated workspace with protected chat routes.
- Persistent conversations stored in PostgreSQL through Prisma.
- Thread sidebar with pinned, archived, renamed, deleted, and searchable chats.
- Streaming AI responses from Anthropic or OpenRouter.
- OpenRouter free-model discovery with a fallback model path.
- Local model selection persistence in the chat UI.
- Message persistence for user and assistant turns.
- Attachment data model for files associated with messages.
- Better Auth email/password and GitHub OAuth configuration.
- Tailwind CSS v4 theme tokens, shadcn-style UI primitives, and rich AI rendering components.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS v4, shadcn-style components, Base UI, Radix UI, lucide-react |
| AI | Vercel AI SDK, Anthropic provider, OpenRouter REST streaming |
| Auth | Better Auth with Prisma adapter |
| Database | PostgreSQL, Prisma 7, `@prisma/adapter-pg` |
| Data fetching | Server Actions, Route Handlers, TanStack Query |
| Tooling | TypeScript, ESLint, npm |

## Prerequisites

- Node.js 20.9 or newer.
- npm.
- PostgreSQL database.
- At least one AI provider key:
  - `ANTHROPIC_API_KEY` for Claude models.
  - `OPENROUTER_API_KEY` for OpenRouter models.
- Optional GitHub OAuth application for social sign-in.

This project uses Next.js 16. The local agent instructions explicitly note that this version may differ from older Next.js conventions, so check `node_modules/next/dist/docs/` before making framework-level changes.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

If `.env.example` does not exist yet, create `.env` with the variables shown below.

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

BETTER_AUTH_SECRET="replace-with-a-long-random-secret"
BETTER_AUTH_URL="http://localhost:3000"

GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

ANTHROPIC_API_KEY=""
OPENROUTER_API_KEY=""
```

Run database migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Build the app for production. |
| `npm run start` | Run the production build. |
| `npm run lint` | Run ESLint. |

Useful Prisma commands:

| Command | Description |
| --- | --- |
| `npx prisma migrate dev` | Apply local migrations and create a new migration when the schema changes. |
| `npx prisma generate` | Generate the Prisma client into `src/generated/prisma`. |
| `npx prisma studio` | Open Prisma Studio for local database inspection. |

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma and the `pg` adapter. |
| `BETTER_AUTH_SECRET` | Recommended | Secret used by Better Auth for signing/encryption. |
| `BETTER_AUTH_URL` | Recommended | Canonical app URL for Better Auth callbacks. Use `http://localhost:3000` locally. |
| `GITHUB_CLIENT_ID` | Optional | GitHub OAuth client ID for social sign-in. |
| `GITHUB_CLIENT_SECRET` | Optional | GitHub OAuth client secret for social sign-in. |
| `ANTHROPIC_API_KEY` | Optional | Enables Anthropic/Claude streaming responses. |
| `OPENROUTER_API_KEY` | Optional | Enables OpenRouter model discovery and streaming responses. |

At least one AI provider key is needed for real assistant responses. Without a provider key, the API returns a readable configuration error.

## Application Routes

| Route | Purpose |
| --- | --- |
| `/sign-in` | Authentication page with email/password and GitHub sign-in UI. |
| `/sign-up` | Account creation page with email/password and GitHub sign-up UI. |
| `/` | Protected root workspace entry. |
| `/chat` | Protected new-chat workspace. |
| `/chat/[chatId]` | Protected existing chat thread. |
| `/api/auth/[...all]` | Better Auth route handler. |
| `/api/chat` | AI streaming route for Anthropic and OpenRouter. |
| `/api/ai/get-models` | Model metadata endpoint for selector UI. |

## Project Structure

```txt
.
|-- docs/
|   `-- PRD.md
|-- prisma/
|   |-- migrations/
|   `-- schema.prisma
|-- public/
|   |-- nova-logo.svg
|   `-- apple-icon.svg
|-- src/
|   |-- app/
|   |   |-- (auth)/
|   |   |-- (root)/
|   |   `-- api/
|   |-- components/
|   |   |-- ai-elements/
|   |   |-- auth/
|   |   |-- providers/
|   |   `-- ui/
|   |-- hooks/
|   |-- lib/
|   `-- modules/
|       |-- authentication/
|       `-- chat/
`-- package.json
```

## Architecture Notes

### Authentication

Authentication is configured in `src/lib/auth.ts` using Better Auth with the Prisma adapter. Protected workspace routes call `requireAuth()` from `src/modules/authentication/actions/index.ts`, which redirects unauthenticated users to `/sign-in`.

The sign-in page currently exposes email/password and GitHub sign-in. GitHub OAuth requires `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.

### Database

The Prisma schema lives in `prisma/schema.prisma`. The primary product models are:

- `User`
- `Session`
- `Account`
- `Verification`
- `Chat`
- `Message`
- `Attachment`

The generated Prisma client is configured to output to `src/generated/prisma`, and `src/lib/db.ts` wires Prisma through `@prisma/adapter-pg`.

### Chat Workflow

Chat data mutations live in `src/modules/chat/actions/index.ts` as server actions. They handle:

- Creating chats with the first user message.
- Fetching chat lists and message history.
- Appending user and assistant messages.
- Renaming, pinning, archiving, and deleting chats.
- Updating and deleting messages.

The main workspace UI is composed by `ChatSession`, `ChatSidebar`, `ChatMessageView`, `ChatMessageForm`, and `ModelSelector` under `src/modules/chat/components`.

### AI Providers

`src/app/api/chat/route.ts` is the main streaming endpoint.

- Anthropic requests use the Vercel AI SDK and `@ai-sdk/anthropic`.
- OpenRouter requests use the OpenRouter chat completions API directly and emit AI SDK UI-message stream events.
- `src/modules/chat/lib/models.ts` owns model defaults and normalization.
- `src/modules/chat/lib/openrouter.ts` fetches and caches free OpenRouter chat-text models.

The default Anthropic model is `claude-sonnet-4-20250514`. The default OpenRouter fallback is `openrouter/free`.

### UI System

Reusable UI primitives are in `src/components/ui`. AI-specific renderers and controls are in `src/components/ai-elements`. Global theme styles and Tailwind CSS v4 tokens are in `src/app/globals.css`.

## Development Workflow

1. Read the relevant local Next.js 16 docs before changing App Router, route handler, caching, or environment-variable behavior.
2. Keep server-only secrets in `.env`; do not expose provider keys with `NEXT_PUBLIC_`.
3. Update `prisma/schema.prisma` first for data model changes, then run `npx prisma migrate dev`.
4. Prefer existing UI primitives in `src/components/ui` before adding new controls.
5. Run `npm run lint` before handing off changes.

## Deployment

Nova Chat can be deployed to any platform that supports Next.js, Node.js, and PostgreSQL.

Before deploying:

1. Provision a PostgreSQL database.
2. Configure all required environment variables.
3. Run Prisma migrations against the production database.
4. Build the app with `npm run build`.
5. Start it with `npm run start` or the host platform's Next.js runtime.

For Vercel, set the environment variables in the project dashboard and ensure migrations are applied as part of your release process.

## Troubleshooting

| Problem | Check |
| --- | --- |
| Sign-in redirects fail | Confirm `BETTER_AUTH_URL` matches the app URL and OAuth callback URLs. |
| GitHub sign-in fails | Confirm GitHub OAuth credentials and callback configuration. |
| Database connection fails | Confirm `DATABASE_URL`, database reachability, and migration status. |
| Prisma client import fails | Run `npx prisma generate`. |
| Anthropic responses fail | Confirm `ANTHROPIC_API_KEY` is set and the selected model is supported. |
| OpenRouter responses fail | Confirm `OPENROUTER_API_KEY`; free model availability can change and the app may fall back to `openrouter/free`. |
| Model selector is sparse | OpenRouter model metadata is fetched from the provider and cached for one hour. |

## Roadmap

The PRD tracks future product scope, including notification backends, editable profile settings, workspace preferences, usage analytics, shared conversation links, multimodal attachment processing, and user-managed provider API keys.
