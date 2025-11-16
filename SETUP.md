# Setup Guide

Complete step-by-step guide for setting up this Clean Architecture template for your project.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** ≥ 22.21.1 ([download](https://nodejs.org/))
- **pnpm** 10.22.0 (install: `npm install -g pnpm@10.22.0`)
- **Docker** (for local PostgreSQL) ([download](https://www.docker.com/))
- **Git** (for version control)

Verify installations:
```bash
node --version    # Should be ≥ 22.21.1
pnpm --version    # Should be 10.22.0
docker --version  # Any recent version
```

## Step-by-Step Setup

### 1. Create Your Project from Template

#### Option A: Use GitHub Template
1. Click "Use this template" on the GitHub repository
2. Create a new repository with your project name
3. Clone your new repository:
   ```bash
   git clone https://github.com/your-username/your-project-name.git
   cd your-project-name
   ```

#### Option B: Clone Directly
```bash
git clone <template-repo-url> your-project-name
cd your-project-name
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"
```

### 2. Rename Project Namespace

**IMPORTANT:** This template uses `@tasks/` as the package namespace. You must replace this with your own namespace.

#### Find and Replace

Replace `@tasks/` with your namespace (e.g., `@myapp/`, `@company/`, etc.) in:

1. **All package.json files** (8 files):
   - `/package.json`
   - `/apps/web/package.json`
   - `/packages/core/package.json`
   - `/packages/db/package.json`
   - `/packages/ui/package.json`
   - `/packages/trousse/package.json`
   - `/packages/test/package.json`
   - `/packages/typescript-config/package.json`

2. **All import statements** across the codebase (TypeScript/TSX files)

3. **Dockerfile** (line with `--filter=@tasks/web`)

4. **README.md** (example imports)

#### Using VS Code
1. Open the project in VS Code
2. Press `Cmd+Shift+F` (Mac) or `Ctrl+Shift+F` (Windows/Linux)
3. Search: `@tasks/`
4. Replace: `@myapp/` (your chosen namespace)
5. Click "Replace All"

#### Using Command Line (macOS/Linux)
```bash
# Replace @tasks/ with @myapp/ in all files
find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "Dockerfile" -o -name "*.md" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.output/*" \
  -exec sed -i '' 's/@tasks\//@myapp\//g' {} +
```

#### Using Command Line (Linux)
```bash
# Replace @tasks/ with @myapp/ in all files
find . -type f \( -name "*.json" -o -name "*.ts" -o -name "*.tsx" -o -name "Dockerfile" -o -name "*.md" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.output/*" \
  -exec sed -i 's/@tasks\//@myapp\//g' {} +
```

### 3. Install Dependencies

```bash
pnpm install
```

This will:
- Install all workspace dependencies
- Set up git hooks (lefthook)
- Link workspace packages

### 4. Configure Environment Variables

#### Create Environment File
```bash
cp .env.sample .env
```

#### Required Configuration

Edit `.env` and configure the following required variables:

##### Database
```env
DATABASE_URL=postgresql://user:pg_password@localhost:5432/db
```

For local development, use the default (matches docker-compose.yml).
For production, use a managed PostgreSQL service (Neon, Supabase, AWS RDS, etc.).

##### Better Auth
```env
BETTER_AUTH_SECRET=<generate-this>
BETTER_AUTH_URL=http://localhost:3000
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

For production, change `BETTER_AUTH_URL` to your production domain.

##### Google OAuth
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Setup steps:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or select existing)
3. Navigate to: **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env`

##### Environment Type
```env
ENVIRONMENT=local
```

Options: `local`, `development`, `staging`, `production`

#### Optional Configuration

##### Email (Recommended for Production)
```env
EMAIL_GATEWAY=inMemory  # Use inMemory for dev, resend for production
```

For production with [Resend](https://resend.com):
```env
EMAIL_GATEWAY=resend
EMAIL_RESEND_API_KEY=re_your-api-key
EMAIL_FROM=noreply@yourdomain.com
```

##### File Storage (Optional)
```env
FILE_GATEWAY=inMemory  # Use inMemory for dev, s3 for production
```

For production with S3-compatible storage:
```env
FILE_GATEWAY=s3
S3_ENDPOINT=https://s3.amazonaws.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_PUBLIC_BUCKET=your-public-bucket
S3_PRIVATE_BUCKET=your-private-bucket
S3_PUBLIC_URL=https://your-cdn-url.com
```

Compatible with: AWS S3, Cloudflare R2, MinIO, DigitalOcean Spaces, etc.

##### Sentry (Optional)
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

Get from [sentry.io](https://sentry.io) → Create Project → Copy DSN

##### Umami Analytics (Optional)
```env
UMAMI_SCRIPT_URL=https://your-umami-instance.com/script.js
UMAMI_WEBSITE_ID=your-website-id
```

Get from your Umami instance or [cloud.umami.is](https://cloud.umami.is)

### 5. Database Setup

#### Start PostgreSQL (Local Development)

Using Docker Compose:
```bash
docker-compose up postgres -d
```

This starts PostgreSQL on `localhost:5432` with credentials matching `.env.sample`.

To check logs:
```bash
docker-compose logs postgres
```

#### Run Migrations

```bash
pnpm db:up
```

This creates:
- Better Auth tables (users, sessions, organizations, invitations, etc.)
- Tasks table
- All necessary indexes and constraints

#### Verify Database

```bash
# Connect to database
docker exec -it tasks-postgres-1 psql -U user -d db

# List tables
\dt

# Exit
\q
```

### 6. First Run

Start the development server:
```bash
pnpm dev
```

The application will start on http://localhost:3000

Verify everything works:
1. Open http://localhost:3000
2. Try signing in with Google OAuth
3. Check that the UI loads correctly

### 7. Verify Setup

Run all checks to ensure everything is configured correctly:

```bash
pnpm fullcheck
```

This runs:
- **Linting & Formatting** (Biome)
- **Type checking** (TypeScript)
- **Tests** (Vitest with in-memory adapters)

All should pass before proceeding.

## GitHub Configuration (For CI/CD)

If you want to use the included CI/CD workflows, configure these GitHub repository secrets:

### Required for CI/CD

Go to: Repository → Settings → Secrets and variables → Actions

**For Turbo Remote Cache (Optional but Recommended):**
- `TURBO_TOKEN` - Get from [Vercel](https://vercel.com/docs/monorepos/remote-caching)
- `TURBO_REMOTE_CACHE_SIGNATURE_KEY` - For cache verification

### Required for Coolify Deployment (Optional)

Only needed if using Coolify for deployment:
- `COOLIFY_API_URL` - Your Coolify instance URL
- `COOLIFY_RESOURCE_UUID` - Resource UUID from Coolify
- `COOLIFY_API_TOKEN` - API token from Coolify

**If not using Coolify:**
Remove or comment out the Coolify deployment section in `.github/workflows/ci.yml` (lines 104-107).

### Production Secrets

For production deployment, set these as environment variables in your hosting platform:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- All optional services you're using (Resend, S3, Sentry, Umami)

## Production Deployment

### Using Docker

1. **Build image:**
   ```bash
   docker build -t your-app .
   ```

2. **Run container:**
   ```bash
   docker run -p 3000:3000 --env-file .env.production your-app
   ```

### Using Coolify

1. Connect your repository to Coolify
2. Set environment variables in Coolify dashboard
3. Deploy - CI/CD will automatically build and deploy

### Database Migrations (Production)

Before deploying a new version with schema changes:
```bash
pnpm db:up:prod
```

This runs migrations against your production database (ensure `DATABASE_URL` points to production).

## Common Issues

### Port 3000 already in use
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

### Docker PostgreSQL won't start
```bash
# Remove existing container
docker-compose down
docker volume rm tasks_postgres_data
docker-compose up postgres -d
```

### TypeScript errors after namespace rename
```bash
# Clear build cache and reinstall
rm -rf node_modules .next .output apps/web/.next
pnpm install
pnpm typecheck
```

### Migrations fail
```bash
# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up postgres -d
pnpm db:up
```

### Git hooks not running
```bash
# Reinstall hooks
pnpm exec lefthook install
```

## Next Steps

After setup is complete:

1. **Customize the domain model** - Edit entities in `packages/core/src/domain/entities/`
2. **Add use cases** - Create business logic in `packages/core/src/domain/use-cases/`
3. **Build UI** - Add routes in `apps/web/src/routes/`
4. **Configure i18n** - Update translations in `apps/web/src/i18n/`
5. **Add tests** - Write tests alongside your use cases

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation and development guidelines.

## Getting Help

- Review [CLAUDE.md](./CLAUDE.md) for architecture details
- Check [README.md](./README.md) for common commands
- Review existing code examples (use cases, tests, components)
- Check package documentation:
  - [TanStack Start](https://tanstack.com/start)
  - [Kysely](https://kysely.dev)
  - [better-auth](https://better-auth.com)
  - [shadcn/ui](https://ui.shadcn.com)
