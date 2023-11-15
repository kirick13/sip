
import { runTask } from '../run-task.js';

export default async function pipeline(...tasks) {
	let writable = null;
	let readable = null;

	const tasks_promises = [];
	for (const task of tasks) {
		tasks_promises.push(
			runTask(task),
		);
	}

	const tasks_results = await Promise.all(tasks_promises);

	for (const [ index, task_result ] of tasks_results.entries()) {
		if (task_result.writable instanceof WritableStream) {
			if (index === 0) {
				writable = task_result.writable;
			}
			else if (readable === null) {
				throw new Error('Invalid pipeline: got WritableStream, but there are no ReadableStream to pipe.');
			}
			else {
				readable.pipeTo(task_result.writable);
			}
		}

		if (task_result.readable instanceof ReadableStream) {
			readable = task_result.readable;
		}
		else {
			readable = null;
		}
	}

	return {
		writable,
		readable,
	};
}
