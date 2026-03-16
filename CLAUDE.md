# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# First-time setup: install deps, generate Prisma client, run migrations
npm run setup

# Development server (uses Turbopack)
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/__tests__/file-system.test.ts

# Reset database
npm run db:reset

# Regenerate Prisma client after schema changes
npx prisma generate

# Run a new migration after schema changes
npx prisma migrate dev
```

## Architecture

### Overview

UIGen is an AI-powered React component generator. Users describe a component in chat; the AI writes JSX/TSX code into a **virtual file system** (in-memory, nothing written to disk); a live preview renders the result in a sandboxed iframe.

### Key Data Flow

1. User sends a message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. The route calls `streamText` (Vercel AI SDK) with two tools: `str_replace_editor` and `file_manager`
3. The AI uses those tools to create/edit files in the `VirtualFileSystem`
4. Tool calls are streamed to the client and handled by `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`) via `onToolCall`
5. `FileSystemContext` triggers a `refreshTrigger` that causes `PreviewFrame` to re-render
6. `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) calls `createImportMap` → transforms all JSX/TSX with `@babel/standalone` → generates blob URLs → injects an `<importmap>` into a sandboxed `<iframe>`

### Virtual File System

`VirtualFileSystem` (`src/lib/file-system.ts`) is the core abstraction. It maintains a tree of `FileNode` objects in memory. Key methods:
- `serialize()` / `deserializeFromNodes()` — convert to/from plain JSON for network transport and persistence
- `replaceInFile()` / `insertInFile()` — text editing operations used by the AI tools

### AI Tools

- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — view/create/edit/delete files (text editor style)
- `file_manager` (`src/lib/tools/file-manager.ts`) — rename, move, list files

### LLM Provider

`src/lib/provider.ts` exports `getLanguageModel()`. If `ANTHROPIC_API_KEY` is set, it uses `claude-haiku-4-5` via `@ai-sdk/anthropic`. Otherwise it falls back to `MockLanguageModel`, a hardcoded stub that returns static component code without making any API calls.

### Preview Pipeline

`src/lib/transform/jsx-transformer.ts` handles:
- Transforming JSX/TSX to plain JS using `@babel/standalone`
- Building an ES module import map with blob URLs for local files and `https://esm.sh/` URLs for third-party packages
- Generating the full preview HTML document (includes Tailwind CDN, error boundary, React 19)

### Authentication & Persistence

- JWT-based auth stored in an `httpOnly` cookie (`src/lib/auth.ts`, uses `jose`)
- `src/middleware.ts` protects routes
- Database: Prisma + SQLite (`prisma/dev.db`). Prisma client is generated to `src/generated/prisma/`
- Schema defined in `prisma/schema.prisma` — two models: `User` (id, email, password) and `Project` (id, name, userId, messages, data); `Project.userId` is an optional FK with cascade delete
- `Project` model stores `messages` and `data` (file system state) as JSON strings
- Anonymous work (unauthenticated sessions) is tracked in `sessionStorage` via `src/lib/anon-work-tracker.ts`

### Contexts

- `FileSystemContext` — owns the `VirtualFileSystem` instance; exposes `handleToolCall` which applies AI tool results to it
- `ChatContext` — wraps the Vercel AI SDK `useChat` hook; passes serialized file system state with every request body

### Testing

Vitest + jsdom + React Testing Library. Tests live in `__tests__/` directories alongside the code they test.
