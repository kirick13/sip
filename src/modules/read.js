
import micromatch             from 'micromatch';
import { readdir }            from 'node:fs/promises';
import {
	resolve as resolvePath,
	sep as path_separator   } from 'node:path';
import { createSipFile }      from '../file.js';
import { PATH_ROOT }          from '../vars.js';

const NAMES_IGNORE_LIST = new Set([
	'.',
	'..',
	'.git',
	'node_modules',
]);

function getGlobsBasePath(globs) {
	let glob_common_parts = null;

	for (const glob of globs) {
		if (glob.startsWith('!')) {
			continue;
		}

		if (glob_common_parts === null) {
			glob_common_parts = globs[0].split(path_separator);
			for (const [ index, part ] of glob_common_parts.entries()) {
				if (
					part.includes('*')
					|| part.includes('?')
					|| part.includes('(')
					|| part.includes('[')
					|| part.includes('{')
				) {
					glob_common_parts.splice(index);

					break;
				}
			}
		}
		else {
			for (const [ index, part ] of glob.split(path_separator).entries()) {
				if (part !== glob_common_parts[index]) {
					glob_common_parts.splice(index);
					break;
				}
			}
		}
	}

	return (glob_common_parts ?? []).join(path_separator);
}

async function readDirectory(path, result = [], level = 0) {
	const entries = await readdir(
		path,
		{
			withFileTypes: true,
		},
	);

	for (const entry of entries) {
		if (NAMES_IGNORE_LIST.has(entry.name)) {
			continue;
		}

		const path_entry = resolvePath(
			path,
			entry.name,
		);

		if (entry.isDirectory()) {
			// eslint-disable-next-line no-await-in-loop
			await readDirectory(
				path_entry,
				result,
				level + 1,
			);
		}
		else {
			result.push(
				path_entry.slice(
					PATH_ROOT.length + 1,
				),
			);
		}
	}

	return result;
}

export default async function read(...globs) {
	const base_path = getGlobsBasePath(globs);

	const paths = await readDirectory(PATH_ROOT);
	const paths_matched = micromatch(
		paths,
		globs,
	);

	for (const [ index, path ] of paths_matched.entries()) {
		if (path.startsWith(base_path)) {
			paths_matched[index] = path.slice(base_path.length + 1);
		}
	}

	return new ReadableStream({
		async pull(controller) {
			if (paths_matched.length === 0) {
				controller.close();
			}
			else {
				const file = await createSipFile(
					base_path,
					paths_matched.shift(),
				);

				controller.enqueue(file);
			}
		},
	});
}
