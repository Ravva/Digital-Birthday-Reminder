const test = require("node:test");
const assert = require("node:assert/strict");
const { readRepoFile } = require("./helpers");

test("middleware refreshes auth with getUser instead of getSession", () => {
  const middleware = readRepoFile("src/middleware.ts");

  assert.match(middleware, /supabase\.auth\.getUser\(\)/);
  assert.doesNotMatch(middleware, /supabase\.auth\.getSession\(\)/);
});

test("send-notifications route enforces rate limiting and 429 responses", () => {
  const route = readRepoFile("src/app/api/send-notifications/route.ts");

  assert.match(route, /getRateLimit/);
  assert.match(route, /status:\s*429/);
  assert.match(route, /X-RateLimit-Limit/);
});

test("signup uses admin client for users table writes", () => {
  const actions = readRepoFile("src/app/actions.ts");

  assert.match(actions, /createAdminClient/);
  assert.match(actions, /adminSupabase\.from\("users"\)\.insert/);
});

test("service role env name is documented consistently", () => {
  const envExample = readRepoFile(".env.example");
  const readme = readRepoFile("README.md");

  assert.match(envExample, /SUPABASE_SERVICE_ROLE_KEY=/);
  assert.match(readme, /SUPABASE_SERVICE_ROLE_KEY=/);
});
