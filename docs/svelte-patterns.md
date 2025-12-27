# Svelte Patterns

Learnings from building features in this codebase.

## Remote Functions + Polling (No Flicker)

### Wrong - causes UI flicker

```svelte
<script>
	import { get_data } from './data.remote'

	// BAD: Creates new promise every reactive update
	let result = $derived.by(async () => await get_data())

	$effect(() => {
		const interval = setInterval(() => {
			// This triggers $derived.by to re-run
		}, 30_000)
		return () => clearInterval(interval)
	})
</script>

<!-- BAD: Shows pending state on EVERY update -->
{#await result}
	<span>Loading...</span>
{:then data}
	{data.value}
{/await}
```

### Correct - pending only on initial load

```svelte
<script>
	import { get_data } from './data.remote'

	// GOOD: Query is cached, same reference
	const data = get_data()

	$effect(() => {
		const interval = setInterval(() => data.refresh(), 30_000)
		return () => clearInterval(interval)
	})
</script>

<!-- GOOD: pending only shows on first load -->
<svelte:boundary>
	{#snippet pending()}
		<span>Loading...</span>
	{/snippet}

	{@const result = await data}
	{result.value}
</svelte:boundary>
```

### Key differences

| Pattern                              | Promise creation | Pending shows |
| ------------------------------------ | ---------------- | ------------- |
| `$derived.by(async...)` + `{#await}` | Every update     | Every time    |
| `query()` + `<svelte:boundary>`      | Once (cached)    | Initial only  |

### Why it works

- `query()` returns a cached promise - same reference each time
- `.refresh()` updates the cached result in place
- `<svelte:boundary pending>` only triggers on initial suspension
- Subsequent refreshes update UI without showing loading state

## Bot Traffic Stats

From Dec 2025 analytics implementation:

- ~73% of raw events were bots (395k of 539k)
- Bot detection via user agent parsing + behaviour flags
- Purging bots reclaimed ~200MB from DB
- Consider: track bot_views separately in rollups, or just exclude

## Related

- `docs/local-analytics.md` - analytics architecture
- `svelte-skills-kit` - updated with these patterns
