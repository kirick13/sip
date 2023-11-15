
export async function runTask({ module, args }) {
	const task_module = await module();
	const result = await task_module.default(...args);

	let writable = null;
	let readable = null;

	if (result instanceof WritableStream) {
		writable = result;
	}
	else if (result instanceof ReadableStream) {
		readable = result;
	}
	else if (
		result instanceof TransformStream
		|| (
			result.writable instanceof WritableStream
			|| result.readable instanceof ReadableStream
		)
	) {
		({ writable, readable } = result);
	}
	else {
		throw new TypeError('Invalid task result.');
	}

	return {
		writable,
		readable,
	};
}
