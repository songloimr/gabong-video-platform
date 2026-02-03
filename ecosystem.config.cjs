/**
 * PM2 Ecosystem Configuration
 * Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    // ===========================================
    // Backend - NestJS API Server
    // ===========================================
    {
      name: 'gabong-backend',
      cwd: './backend',
      script: 'dist/main.js',
      interpreter: 'node',

      // Cluster mode - scale across CPU cores
      instances: 'max', // Or set specific number: 2, 4, etc.
      exec_mode: 'cluster',

      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',

      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      merge_logs: true,

      // Watch (disable in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
    },

    // ===========================================
    // Frontend - SvelteKit (adapter-node)
    // ===========================================
    {
      name: 'gabong-frontend',
      cwd: './frontend',
      script: 'build/index.js',
      interpreter: 'node',

      // Single instance (SvelteKit handles its own clustering if needed)
      instances: 1,
      exec_mode: 'fork',

      // Environment
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        ORIGIN: 'https://your-domain.com', // Required for CSRF protection
      },

      // Restart policy
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '512M',

      // Graceful shutdown
      kill_timeout: 5000,

      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      merge_logs: true,

      // Watch (disable in production)
      watch: false,
    },
  ],

  // ===========================================
  // Deploy Configuration (Optional - for pm2 deploy)
  // ===========================================
  deploy: {
    production: {
      user: 'deploy',
      host: ['server1.example.com'], // Add more hosts for multi-server
      ref: 'origin/main',
      repo: 'git@github.com:your-org/gabong-net.git',
      path: '/var/www/gabong-net',
      'pre-deploy-local': '',
      'post-deploy':
        'pnpm install --frozen-lockfile && pnpm run build:all && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};
