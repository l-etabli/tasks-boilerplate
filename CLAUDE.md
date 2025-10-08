# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Key Development Commands

- **Development**: `pnpm dev` - Start development server
- **Build**: `pnpm build` - Build all packages and apps
- **Lint & Format**: `pnpm check:fix` - Fix linting and formatting issues
- **Type Check**: `pnpm typecheck` - Run TypeScript type checking
- **Full Check**: `pnpm fullcheck` - Run all checks including tests
- **Database Migration**: `pnpm db:up` - Run database migrations
- **Database Creation**: `pnpm db:create` - Create new database migration

### Package-specific Commands

- **Web App**: `pnpm web <command>` - Run commands in the web app
- **Core Package**: `pnpm core <command>` - Run commands in the core package

## Architecture Overview

This is a monorepo built with **Clean Architecture** principles using:

- **Turbo** for build orchestration
- **pnpm** for package management
- **Biome** for linting and formatting
- **Kysely** for database operations
- **TanStack Start** for the web application

### Core Architecture

The codebase follows **Clean Architecture** with clear separation of concerns:

**Core Package (`packages/core/`):**
- `domain/entities.ts` - Core business entities (User, Task, Subscription)
- `domain/useCases.ts` - Business logic use cases
- `domain/ports.ts` - Interfaces for external dependencies
- `adapters/` - Infrastructure implementations (PostgreSQL, in-memory)

**Database Package (`packages/db/`):**
- Kysely-based PostgreSQL setup
- Migration files in `migrations/`
- Database connection and schema definitions

**Web Application (`apps/web/`):**
- TanStack Start-based React application
- TRPC for API layer
- TanStack Router for routing
- Better-auth for authentication
- Sentry integration for error tracking

### Key Architectural Principles

1. **Dependency Injection**: Use explicit dependency injection patterns
2. **Repository Pattern**: Keep persistence logic in repositories
3. **Use Cases**: Business logic orchestration without infrastructure dependencies
4. **Entity-First Design**: Most business logic should be in entities
5. **Functional Programming**: Prefer pure functions and immutable data structures

### Repository Structure

```
apps/
  web/                    # Main web application
packages/
  core/                   # Business logic and domain entities
  db/                     # Database setup and migrations
  ui/                     # Shared UI components (shadcn/ui)
  sentry/                 # Sentry integration package
  trousse/                # Use case building utilities
  typescript-config/      # Shared TypeScript configurations
```

## Development Guidelines

### Code Style
- Use functional programming over classes
- Prefer pure functions and immutable data structures
- Use TypeScript strict mode, avoid `any`
- Use camelCase for functions/variables, PascalCase for types
- Use union types over enums
- Prefer named exports over default exports

### Testing
- Write unit tests for use cases with in-memory repositories
- Integration tests for adapter implementations
- Use Arrange-Act-Assert pattern
- Test edge cases explicitly
- No mocks - use explicit dependency injection

### Error Handling
- Use descriptive error messages
- Handle all error cases explicitly
- Never swallow errors silently
- Validate all inputs and sanitize user data

## Git Workflow

**IMPORTANT: NEVER commit or push code without explicit user permission.**

When you have completed changes that seem like a good point to commit:
1. Ask: "This seems like a good point to commit, should I do it?"
2. Wait for user agreement before running any git write commands
3. NEVER use `git commit`, `git push`, `git add`, or any other git commands that modify the repository without explicit user approval

**Allowed git commands** (read-only operations that don't require permission):
- `git status` - Check repository status
- `git diff` - View changes
- `git log` - View commit history
- `git show` - View commit details
- Any other read-only git operations

### Git Hooks
- **Pre-commit**: Runs `pnpm check:fix` on staged files
- **Pre-push**: Runs `pnpm fullcheck` (all checks including tests)