const test = require("node:test");
const assert = require("node:assert/strict");
const { listMigrationFiles } = require("./helpers");

test("user-scoped tables have RLS enabled in migrations", () => {
  const migrations = listMigrationFiles();
  const combinedSql = migrations.map((migration) => migration.content).join("\n");

  assert.match(combinedSql, /ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;/);
  assert.match(
    combinedSql,
    /ALTER TABLE telegram_settings ENABLE ROW LEVEL SECURITY;/,
  );
  assert.match(
    combinedSql,
    /ALTER TABLE public\.users ENABLE ROW LEVEL SECURITY;/,
  );
});

test("user-scoped tables restrict rows to auth.uid()", () => {
  const migrations = listMigrationFiles();
  const combinedSql = migrations.map((migration) => migration.content).join("\n");

  assert.match(combinedSql, /contacts[\s\S]*user_id = auth\.uid\(\)/);
  assert.match(
    combinedSql,
    /telegram_settings[\s\S]*user_id = auth\.uid\(\)/,
  );
  assert.match(combinedSql, /public\.users[\s\S]*id = auth\.uid\(\)/);
});
