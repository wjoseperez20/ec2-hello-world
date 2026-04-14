module.exports = {
  apps: [
    {
      name: "ec2-hello-world",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/home/ubuntu/ec2-hello-world",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      out_file: "/home/ubuntu/logs/ec2-hello-world-out.log",
      error_file: "/home/ubuntu/logs/ec2-hello-world-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      max_restarts: 10,
      min_uptime: "5s",
      restart_delay: 4000,
      max_memory_restart: "400M",
    },
  ],
};
