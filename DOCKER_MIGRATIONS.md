# Docker Migration Guide

This guide explains how to run database migrations with the Docker setup.

## Overview

The Docker setup includes a dedicated migration service that runs database migrations using the full monorepo environment. The migration service:

- Uses the `base` stage from the Dockerfile (includes all dependencies and source code)
- Connects to the PostgreSQL database in Docker
- Runs `pnpm db:up` to apply migrations
- Exits after completion

## Local Development

### Run Migrations

```bash
# Start PostgreSQL first
docker compose up postgres -d

# Run migrations
docker compose run --rm migrate

# Start the web application
docker compose up web -d
```

### Complete Setup (with migrations)

```bash
# Stop any running services
docker compose down

# Start PostgreSQL and run migrations
docker compose up postgres -d
docker compose run --rm migrate

# Start the web application
docker compose up web -d
```

### Alternative: Run with Migration Profile

```bash
# Start everything including migrations
docker compose --profile migration up -d
```

## Production/CI Deployment

### CI Pipeline Example

```bash
# In your deployment script or CI pipeline
docker compose up postgres -d
docker compose run --rm migrate
docker compose up web -d
```

### Manual Production Deployment

```bash
# 1. Start database
docker compose up postgres -d

# 2. Run migrations
docker compose run --rm migrate

# 3. Start application
docker compose up web -d
```

## Migration Commands

| Command | Description |
|---------|-------------|
| `docker compose run --rm migrate` | Run migrations and exit |
| `docker compose --profile migration up -d` | Start with migrations included |
| `docker compose up postgres -d` | Start only PostgreSQL |
| `docker compose logs migrate` | View migration logs |

## Troubleshooting

### Migration Fails

1. Check PostgreSQL is running and healthy:
   ```bash
   docker compose ps postgres
   docker compose logs postgres
   ```

2. Verify database connection:
   ```bash
   docker compose exec postgres psql -U tasks_user -d tasks_db -c "\dt"
   ```

3. Check migration logs:
   ```bash
   docker compose logs migrate
   ```

### Reset Database

To start fresh with a clean database:

```bash
# Stop all services
docker compose down

# Remove database volume
docker volume rm tasks_postgres_data

# Start fresh
docker compose up postgres -d
docker compose run --rm migrate
docker compose up web -d
```

## Architecture Notes

- **Production containers**: Lean, only contain built application bundles
- **Migration container**: Full development environment with monorepo access
- **Database**: Shared PostgreSQL container for both migration and web services
- **CI/CD**: Migrations run as separate step before application deployment