module.exports = {
  apps: [
    {
      name: "dev",
      script: "dist/server.js",
      instances: 2,
      autorestart: false,
      watch: ["dist"],
      ignore_watch: ['.git', 'node_modules', 'logs', 'src'],
      restart_delay: 500,
      merge_logs: true,
      node_args: '-r ts-node/register -r tsconfig-paths/register',
      env: {
        NODE_ENV: "development"
      }
    },
    {
      name: "prod",
      script: "dist/server.js",
      instances: 0,
      merge_logs: true,
      node_args: '-r ts-node/register -r tsconfig-paths/register',
      env: {
        NODE_ENV: "production"
      }
    }
  ],
};
