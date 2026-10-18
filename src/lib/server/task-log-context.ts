import { AsyncLocalStorage } from 'node:async_hooks';
import type {
	TaskLogDetails,
	TaskLogLevel,
	TaskLogStore,
} from '../sqlite/task-logs';

export const task_log_context = new AsyncLocalStorage<
	| {
			store: TaskLogStore;
			run_id: string;
	  }
	| undefined
>();

// Explicit task events only. Never intercept console output or record payloads.
export function log_task_event(
	level: TaskLogLevel,
	message: string,
	details?: TaskLogDetails,
) {
	const context = task_log_context.getStore();
	if (!context) return;
	try {
		context.store.event(context.run_id, level, message, details);
	} catch {
		console.warn('[task logs] Could not write a task event');
	}
}
