const rootPath = process.env.ROOT_PATH;

if (!rootPath) {
  console.error(
    "Must provide ROOT_PATH environment variable pointing to root path of repository",
  );
  process.exit(1);
}

const config = {
  rootPath,
} as const;

export default config;
