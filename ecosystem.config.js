module.exports = {
  apps: [
    {
      name: "lotek-backend",
      cwd: "/var/www/losuje.pl/lotek/backend",
      script: "index.js",
      watch: false,
      autorestart: true,
      instances: "max", // Używa wszystkich dostępnych CPU cores
      exec_mode: "cluster", // Tryb cluster dla lepszej wydajności
      env: {
        NODE_ENV: "production",
        PORT: 3001
      },
      // Zaawansowane ustawienia stabilności
      max_memory_restart: "1G",
      restart_delay: 5000,
      max_restarts: 15,
      min_uptime: "15s",
      kill_timeout: 10000,
      listen_timeout: 10000,
      // Logi
      error_file: "/var/log/pm2/lotek-backend-error.log",
      out_file: "/var/log/pm2/lotek-backend-out.log",
      log_file: "/var/log/pm2/lotek-backend-combined.log",
      time: true,
      // Monitoring
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
  ],
  
  // Globalne ustawienia PM2
  deploy: {
    production: {
      user: "root",
      host: "51.77.220.61",
      ref: "origin/main",
      repo: "git@github.com:username/lotek.git",
      path: "/var/www/losuje.pl/lotek",
      "post-deploy": "npm install && pm2 reload ecosystem.config.js --env production"
    }
  }
};
