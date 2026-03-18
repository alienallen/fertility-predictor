{
  "apps": [
    {
      "name": "fertility-predictor-backend",
      "script": "src/index.js",
      "cwd": "./backend",
      "instances": 1,
      "exec_mode": "fork",
      "watch": false,
      "max_memory_restart": "200M",
      "env": {
        "NODE_ENV": "development",
        "PORT": 3000
      },
      "env_production": {
        "NODE_ENV": "production",
        "PORT": 3000,
        "NOTIFICATION_ENABLED": "false"
      },
      "error_file": "./logs/error.log",
      "out_file": "./logs/out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "merge_logs": true,
      "autorestart": true,
      "max_restarts": 10,
      "min_uptime": "10s",
      "restart_delay": 1000
    }
  ]
}
