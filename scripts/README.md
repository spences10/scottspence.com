# Scripts Architecture Documentation

## Overview

This document maps the current task execution patterns in this
codebase and highlights architectural inconsistencies that should be
addressed.

## Current Patterns

### Pattern 1: Standalone Scripts (scripts/)

**Location**: `/scripts/`

**Current files**:

- `generate-newsletter.ts` - Generates newsletter from Bluesky/GitHub
  data

**Characteristics**:

- Runs directly via Node.js/tsx
- No authentication
- No HTTP interface
- Local execution only
- Not easily triggered by cron/webhooks
- **Problem**: No npm script defined in package.json, making it
  orphaned

**Example execution** (if npm script existed):

```bash
npm run generate-newsletter
# or
tsx scripts/generate-newsletter.ts
```

### Pattern 2: HTTP API Endpoints (api/ingest/)

**Location**: `/src/routes/api/ingest/`

**Main dispatcher**: `+server.ts`

**Available tasks** (12 total):

- `update_popular_posts` - Update popular posts metrics
- `update_posts` - Update posts data
- `update_embeddings` - Update post embeddings
- `update_related_posts` - Update related posts table
- `index_now` - Submit URLs to IndexNow
- `update_stats` - Update statistics
- `export_training_data` - Export data for training
- `backup_database` - Backup database
- `pull_database` - Pull database from remote
- `restore_database` - Restore database from backup
- `newsletter_send` - Send current month's newsletter
- `adhoc_newsletter_send` - Auto-discover and send unsent newsletters

**Characteristics**:

- HTTP POST endpoints with token authentication
- Can be triggered from anywhere (localhost/production)
- Centralized task registry in `+server.ts`
- Easy to trigger via cron/webhooks/GitHub Actions
- Documented with curl examples

**Example execution**:

```bash
# Production
curl -X POST https://scottspence.com/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"task": "update_posts", "token": "your-secret-token"}'

# Localhost
curl -X POST http://localhost:5173/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"task": "update_posts", "token": "your-secret-token"}'
```

## The Architectural Disconnect

### Newsletter Workflow Split

The newsletter workflow is currently split across both patterns:

1. **Generate** (`scripts/generate-newsletter.ts`) - Creates
   newsletter file
   - Uses standalone script pattern
   - Not in API registry
   - No HTTP interface

2. **Send** (`api/ingest/newsletter-send.ts`) - Sends existing
   newsletter
   - Uses API pattern
   - In API registry
   - HTTP accessible

This creates inconsistency where:

- Most tasks use the API pattern
- Newsletter generation uses the script pattern
- Newsletter sending uses the API pattern

## Recommendation: Unify Everything in api/ingest/

All tasks should follow the API pattern for consistency and
accessibility.

### Benefits of Unification

1. **Consistency** - All tasks in one place with same execution
   pattern
2. **Accessibility** - Trigger via curl from anywhere
3. **Automation** - Easy to set up cron jobs or GitHub Actions
4. **Documentation** - Lives alongside other task examples
5. **Authentication** - Token-based security for all tasks
6. **Discoverability** - Centralized task registry

### Migration Plan

To unify `generate_newsletter`:

1. Create `src/routes/api/ingest/generate-newsletter.ts`:

   ```typescript
   import { generate_newsletter } from '$lib/newsletter/generator'

   export const generate_newsletter_task = async () => {
   	return await generate_newsletter()
   }
   ```

2. Add to task registry in `src/routes/api/ingest/+server.ts`:

   ```typescript
   const tasks: TaskType = {
   	// ... existing tasks
   	generate_newsletter: {
   		function: generate_newsletter_task,
   		expects_fetch: false,
   	},
   }
   ```

3. Remove `scripts/generate-newsletter.ts`

4. Execute via API:
   ```bash
   curl -X POST http://localhost:5173/api/ingest \
     -H "Content-Type: application/json" \
     -d '{"task": "generate_newsletter", "token": "your-token"}'
   ```

### Complete Newsletter Workflow

After unification, the complete newsletter workflow via API:

```bash
# 1. Generate newsletter from latest data
curl -X POST https://scottspence.com/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"task": "generate_newsletter", "token": "your-token"}'

# 2. Review generated newsletter file (manual step)
# Edit content/newsletters/YYYY-MM.md
# Set published: true when ready

# 3. Send newsletter
curl -X POST https://scottspence.com/api/ingest \
  -H "Content-Type: application/json" \
  -d '{"task": "adhoc_newsletter_send", "token": "your-token"}'
```

## Future Considerations

Once unified:

- Remove `scripts/` folder entirely
- Update documentation references
- Update any CI/CD workflows
- Consider adding more tasks to API pattern
- Document all available tasks in one place

## References

- API dispatcher: `src/routes/api/ingest/+server.ts`
- Newsletter generator: `src/lib/newsletter/generator.ts`
- Newsletter sender: `src/lib/newsletter/sender.ts`
