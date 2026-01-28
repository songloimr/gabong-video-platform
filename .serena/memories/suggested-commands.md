# Gabong Platform - Suggested Commands

## Backend Commands (NestJS)

### Development
```bash
cd backend

# Install dependencies
npm install

# Start development server with hot reload
npm run start:dev

# Start debug mode
npm run start:debug

# Build project
npm run build

# Run production build
npm run start:prod
```

### Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### Code Quality
```bash
# Run ESLint and auto-fix
npm run lint

# Format code with Prettier
npm run format
```

## Frontend Commands (SvelteKit)

### Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check TypeScript and Svelte
npm run check

# Check in watch mode
npm run check:watch

# Run ESLint
npm run lint
```

### Database (Drizzle) - Currently in frontend folder
```bash
cd frontend

# Push schema to database
npm run db:push

# Generate migration
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

## Drizzle ORM Commands (Backend - after setup)

```bash
cd backend

# Generate migrations
npx drizzle-kit generate:pg

# Push schema to database (development)
npx drizzle-kit push:pg

# Open Drizzle Studio
npx drizzle-kit studio
```

## System Commands (Darwin/macOS)

### Navigation
```bash
# List directory contents
ls
ls -la

# Change directory
cd backend
cd ../frontend

# Go to project root
cd /Users/songloimr/SideProjects/gabong-net
```

### Git Commands
```bash
# Check git status
git status

# View diff
git diff

# View staged changes
git diff --staged

# Add files
git add .
git add <file>

# Commit changes
git commit -m "message"

# Push to remote
git push

# Create new branch
git checkout -b feature/branch-name

# Switch branch
git checkout main
```

### File Search
```bash
# Find files by pattern
find . -name "*.ts"
find . -name "*.svelte"

# Search in files (using ripgrep if available)
rg "search-term" .
rg "function" src/
```

## Process Management (Production)

### PM2
```bash
# Start all apps
pm2 start ecosystem.config.js

# Start specific app
pm2 start backend/src/main.js --name gabong-backend

# List all processes
pm2 list

# Stop app
pm2 stop gabong-backend

# Restart app
pm2 restart gabong-backend

# View logs
pm2 logs gabong-backend

# Monitor
pm2 monit
```

### Nginx
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# View nginx status
sudo systemctl status nginx

# View nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## PostgreSQL Commands
```bash
# Connect to database
psql -U user -d gabong

# Create database
createdb gabong

# Drop database
dropdb gabong

# Backup database
pg_dump gabong > backup.sql

# Restore database
psql gabong < backup.sql

# List databases
psql -l
```

## Environment Setup

### Backend (.env)
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

### Frontend (.env)
```bash
cd frontend
cp .env.example .env
# Edit .env with your values
```

## Common Workflows

### Full Development Setup
```bash
# Backend
cd backend
npm install
npx drizzle-kit push:pg
npm run start:dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Before Committing
```bash
# Backend
cd backend
npm run lint
npm run format
npm run test

# Frontend
cd frontend
npm run lint
npm run check
```

### Production Deployment
```bash
# Backend
cd backend
npm run build
pm2 restart gabong-backend

# Frontend
cd frontend
npm run build
pm2 restart gabong-frontend
```
