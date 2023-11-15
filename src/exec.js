#!/usr/bin/env node

import { join as joinPath } from 'node:path';
import { runTask }          from './run-task.js';
import { PATH_ROOT }        from './vars.js';

function stringifyTimeInterval(interval) {
	if (interval < 0) {
		return `${Number.parseFloat(interval.toFixed(3))} ms`;
	}

	if (interval < 1000) {
		return `${Math.round(interval)} ms`;
	}

	return `${Number.parseFloat((interval / 1000).toFixed(2))} s`;
}

const config = await import(
	joinPath(
		PATH_ROOT,
		'sip.config.js',
	)
);

const task = process.argv[2] ?? 'default';

console.log(`[sip] Initialization complete in ${stringifyTimeInterval(process.uptime() * 1000)}.`);

const ts = process.uptime();
console.log(`[sip] Started task "${task}"...`);

const { readable } = await runTask(
	config[task],
);

await new Promise((resolve) => {
	readable.pipeTo(
		new WritableStream({
			close() {
				resolve();
			},
		}),
	);
});

console.log(`[sip] Process finished in ${stringifyTimeInterval((process.uptime() - ts) * 1000)}.`);
