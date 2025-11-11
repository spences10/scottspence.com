# Remote Functions Demo Notes (Rich Harris, "Remote Control")

## Plugin & Architecture Context

- Remote functions are SvelteKit’s most aggressive use of the
  Vite/Rollup plugin hooks; the transform hook loads modules
  server-side to introspect exports, assigns IDs, and generates
  endpoints per remote export
- Guard plugins still protect server-only modules by inspecting
  `resolveId`/`load` graphs; remote modules obey those same
  constraints so private env vars stay server-bound

## Counter Demo

- Remote module holds canonical state (`let count = 0`) plus a `query`
  (`getCount`) and `command` (`increment`)
- Templates can `await getCount()` multiple times; Svelte treats
  template expressions as pure so the awaits run concurrently and
  dedupe automatically
- Commands return the updated query payload, so the client receives
  refreshed `getCount` data in the same response (single-flight
  mutation)
- Optimistic UI: `command().updates(getCount().withOverride(fn))`
  applies immediate feedback; failures roll back automatically (demo
  flips a coin and throws)
- Latency simulation via `await sleep(1000)` highlights why optimistic
  overrides matter; `increment.pending` can still power loading states
  if needed

## Weather Demo (Batching)

- Per-city forecasts initially triggered one request each; converting
  `getForecast` to `query.batch` sends all visible cities in one call
- Batch handler returns a lookup closure; UI toggles ("Show all") stay
  client-driven while data fetching becomes as efficient as server
  components without losing client state flexibility

## Forms Demo

- Remote `form` exports supply `form`, `form.fields`, and `.enhance`
  helpers to native `<form>` tags, handling method/action, event
  listeners, value binding, and `aria-invalid`
- Schema example nests objects and type-restricts range inputs;
  `.as('range')` enforces numeric fields and autopopulates
  value/constraints
- Form issues stream through `field.issues()`; CSS targets
  `[aria-invalid]` for subtle error styling (red glow in demo)
- `form.enhance` plus `submit().updates(...)` gives optimistic toggles
  (todo example) without removing server validation or progressive
  enhancement
- Programmatic validation (e.g., verifying credentials) uses the
  `invalid.field('message')` helper to push errors into the right
  field bucket

## Operational Lessons

- Remote commands/forms should validate every input because clients
  may be on older bundles or attackers may poke generated endpoints
- Link queries to mutations explicitly; without
  `refresh()`/`updates()` you’ll see stale UI even though the server
  state changed
- Use optimistic overrides for high-latency mutations but always plan
  for rollback; the demo’s random failure proved rollbacks happen
  automatically
- Use batching where groups of similar queries may execute in the same
  tick (e.g., expanding multiple cards)
- Remote forms can act as the “crown jewels” of the API surface: they
  wire validation, ARIA, and submission state so you spend less time
  re-implementing form plumbing

## Open Issues / Roadmap Mentions

- Caching, auto-refresh, and cross-tab sync need more polish;
  real-time designs are in progress
- Environment API changes should eventually make the plugin
  implementation less hacky, but today remote functions rely on
  creative use of `writeBundle`, `load`, and `resolveId`
