const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..", "..");

function readRepoFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function listMigrationFiles() {
  const migrationsDir = path.join(repoRoot, "supabase", "migrations");

  return fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => ({
      file,
      content: fs.readFileSync(path.join(migrationsDir, file), "utf8"),
    }));
}

module.exports = {
  readRepoFile,
  listMigrationFiles,
};
