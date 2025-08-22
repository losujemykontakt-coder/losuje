module.exports = {
  apps: [
    {
      name: "lotek-backend",
      cwd: "/var/www/losuje.pl/lotek/backend",
      script: "node_modules/.bin/dotenv",
      args: "-e /var/www/losuje.pl/lotek/backend/.env -- node index.js",
      watch: false,
      autorestart: true,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production"
      },
      error_file: "/var/log/pm2/lotek-backend-error.log",
      out_file: "/var/log/pm2/lotek-backend-out.log",
      log_file: "/var/log/pm2/lotek-backend-combined.log",
      time: true
    },
    {
      name: "lotek-frontend",
      cwd: "/var/www/losuje.pl/lotek/frontend",
      script: "node_modules/.bin/dotenv",
      args: "-e /var/www/losuje.pl/lotek/frontend/.env -- npm start",
      watch: false,
      autorestart: true,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production"
      },
      error_file: "/var/log/pm2/lotek-frontend-error.log",
      out_file: "/var/log/pm2/lotek-frontend-out.log",
      log_file: "/var/log/pm2/lotek-frontend-combined.log",
      time: true
    }
  ]
};
