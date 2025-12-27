# Remote Functions Overview

## Enabling & Placement

- Requires `kit.experimental.remoteFunctions = true` plus optional
  `compilerOptions.experimental.async = true` for template-level
  `await`
- Remote modules must end with `.remote.js` / `.remote.ts`, can live
  anywhere under `src/` except `src/lib/server`
- Functions always execute on the server, so they can reach
  server-only modules and env vars while exposing only the validated
  surface area to the client

## Function Types

### `query`

- Read dynamic data; return values behave like cached promises usable
  directly in Svelte templates (`await getPosts()`)
- Methods: `refresh()`, `set(value)`, `withOverride(fn)`, `.loading`,
  `.error`, `.current`
- Accept optional Standard Schema for arguments; results serialized
  with `devalue`
- Run concurrently inside templates (per Rich Harris talk), so
  repeated `await getCount()` calls do not waterfall

### `query.batch`

- Debounces n+1 patterns by sending every call in the same macrotask
  to the server together (Rich’s weather demo)
- Handler receives array of inputs and returns a resolver
  `(input, index) => result`

### `form`

- Binds server logic to native `<form>` elements with full progressive
  enhancement
- `form.fields` expose `.as(type, option)` helpers that set `name`,
  `type`, value bindings, and `aria-invalid`
- Integrates schema validation plus programmatic
  `invalid.field('message')`
- `.result` contains ephemeral `{ success: ... }` payloads for UI
  confirmation
- `.enhance` wraps the submission, enabling hooks like optimistic
  `submit().updates(...)`, overrides, custom toasts, etc.
- `buttonProps` supports per-button destinations via `formaction`

### `command`

- Imperative writer usable anywhere (event handlers, stores); cannot
  run during render
- Accepts Standard Schema argument and returns a promise augmented
  with `.updates(...queries)` for single-flight revalidation and
  overrides
- Inside the handler you can call `query.refresh()` or
  `query.set(...)` when you already know the new value

### `prerender`

- Precomputes data at build time for CDN delivery; great for
  mostly-static catalogs
- Use `inputs` to enumerate arguments until async SSR lands;
  `dynamic: true` keeps functions callable at runtime with uncrawled
  inputs

## Validation & Safety

- Always pass Standard Schema (Valibot, Zod, ArkType, etc.) to
  `query`, `command`, `form`, and `prerender`
- Handle bad input by implementing `handleValidationError` to
  customize the default 400 response
- Use `'unchecked'` only when you control every caller and accept the
  risk of hostile payloads
- Remote functions inherit the page’s `RequestEvent` via
  `getRequestEvent`, but `route/params/url` refer to the caller, not
  the generated endpoint—never use them as authorization gates

## Caching, Refreshing & Optimistic UI

- SvelteKit caches queries while they are referenced on the page;
  identical calls share an instance (`getPosts() === getPosts()`)
- Use `query.refresh()`, `.set(value)`, or `.withOverride(fn)` to keep
  UI warm while commands/forms run
- Combine `command(...).updates(getQuery(arg))` with `withOverride`
  for Rich’s single-flight mutation demo (counter button)
- Optimistic overrides automatically roll back on rejection (see
  transcript example with random failure)

## Forms & Single-flight Mutations

- Server responses include the list of touched queries so the client
  can refresh them in one request (no request waterfall)
- `form.enhance`’s `submit().updates(...)` enables optimistic
  revalidation while keeping the mutation single-flight
- Validation issues stream live via `field.issues()`; CSS can target
  `[aria-invalid="true"]`

## Redirects & Errors

- `query`, `form`, and `prerender` may throw `redirect()`; `command`
  should return a `{ redirect }` payload instead if absolutely
  necessary
- Errors bubble to the nearest `<svelte:boundary>` / `+error.svelte`;
  `form` submissions show validation issues inline without throwing

## Useful Hooks & APIs

- `getRequestEvent()` exposes cookies, locals, fetch, etc., though you
  cannot set custom headers (except cookies via `form`/`command`)
- `handleValidationError` for friendly 400s, `handleError` for
  everything else
- `transport` hook can serialize custom types beyond JSON for remote
  responses
