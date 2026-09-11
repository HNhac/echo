module.exports = {
  apps: [
    {
      name: "echo-api",
      cwd: __dirname + "/..",
      script: "npm",
      args: "run start:api",
      env: { NODE_ENV: "production" },
    },
    {
      name: "echo-web",
      cwd: __dirname + "/..",
      script: "npm",
      args: "run start:web",
      env: { NODE_ENV: "production" },
    },
    {
      name: "echo-cms",
      cwd: __dirname + "/..",
      script: "npm",
      args: "run start:cms",
      env: { NODE_ENV: "production" },
    },
  ],
};
