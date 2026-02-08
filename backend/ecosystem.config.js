module.exports = {
  apps: [
    {
      name: 'itca-backend',
      script: './dist/main.js',
      cwd: '/var/www/itca/backend',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/pm2/itca-backend-error.log',
      out_file: '/var/log/pm2/itca-backend-out.log',
      log_file: '/var/log/pm2/itca-backend.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
    },
  ],
};
