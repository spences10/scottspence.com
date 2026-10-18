CREATE TABLE IF NOT EXISTS task_runs (
	id TEXT PRIMARY KEY,
	task_name TEXT NOT NULL,
	trigger TEXT NOT NULL CHECK (trigger IN ('manual', 'scheduled')),
	status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'interrupted', 'skipped')),
	scheduled_at INTEGER,
	queued_at INTEGER NOT NULL,
	started_at INTEGER,
	finished_at INTEGER,
	duration_ms INTEGER,
	deployment_id TEXT NOT NULL,
	owner_id TEXT NOT NULL,
	owner_pid INTEGER NOT NULL,
	owner_host TEXT NOT NULL,
	error_message TEXT
);

CREATE INDEX IF NOT EXISTS task_runs_task_time ON task_runs(task_name, queued_at DESC);
CREATE INDEX IF NOT EXISTS task_runs_status_time ON task_runs(status, queued_at DESC);
CREATE INDEX IF NOT EXISTS task_runs_deployment_time ON task_runs(deployment_id, queued_at DESC);
CREATE INDEX IF NOT EXISTS task_runs_owner ON task_runs(owner_id, status);

CREATE TABLE IF NOT EXISTS task_events (
	id INTEGER PRIMARY KEY,
	run_id TEXT NOT NULL REFERENCES task_runs(id) ON DELETE CASCADE,
	created_at INTEGER NOT NULL,
	level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
	message TEXT NOT NULL,
	details_json TEXT CHECK (details_json IS NULL OR json_valid(details_json))
);

CREATE INDEX IF NOT EXISTS task_events_run_time ON task_events(run_id, created_at, id);
