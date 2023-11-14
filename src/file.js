
import { mkdir }             from 'node:fs/promises';
import {
	dirname,
	format as formatPath,
	// join as joinPath,
	parse as parsePath,
	resolve as resolvePath } from 'node:path';
import { PATH_ROOT }         from './vars.js';

const PROTECTOR = Symbol('NEW_PROTECTOR');

class SipFileLocation {
	#root = PATH_ROOT;

	#base = null;
	#dir = null;
	#name = null;
	#ext = null;

	constructor(base, path) {
		this.#base = base;

		const {
			dir,
			name,
			ext,
		} = parsePath(path);

		this.#dir = dir;
		this.#name = name;
		this.#ext = ext;
	}

	get root() {
		return this.#root;
	}

	get base() {
		return this.#base;
	}

	set base(value) {
		this.#base = value;
	}

	get dir() {
		return this.#dir;
	}

	set dir(value) {
		this.#dir = value;
	}

	get name() {
		return this.#name;
	}

	set name(value) {
		this.#name = value;
	}

	get ext() {
		return this.#ext;
	}

	set ext(value) {
		if (value.length > 0) {
			const parts = value.split('.').splice(1);

			if (parts.length > 1) {
				this.#ext = '.' + parts.pop();
				this.#name += '.' + parts.join('.');

				return;
			}
		}

		this.#ext = value;
	}

	get path() {
		return formatPath({
			dir: resolvePath(
				this.#root,
				this.#base,
				this.#dir,
			),
			name: this.#name,
			ext: this.#ext,
		});
	}
}

export class SipFile {
	location;
	contents;

	constructor(base_path, path, protector) {
		if (protector !== PROTECTOR) {
			throw new Error('Do not use new SipFile() directly, use createSipFile() method instead.');
		}

		this.location = new SipFileLocation(base_path, path);
	}

	async write() {
		await mkdir(
			dirname(this.location.path),
			{ recursive: true },
		);

		await Bun.write(
			this.location.path,
			this.contents,
		);
	}

	clone() {
		const sipFile = new SipFile(
			this.location.root,
			'',
			PROTECTOR,
		);

		sipFile.location.dir = this.location.dir;
		sipFile.location.name = this.location.name;
		sipFile.location.ext = this.location.ext;

		sipFile.contents = this.contents;

		return sipFile;
	}
}

export async function createSipFile(base_path, path) {
	const sipFile = new SipFile(
		base_path,
		path,
		PROTECTOR,
	);

	const file = Bun.file(sipFile.location.path);
	sipFile.contents = await file.arrayBuffer();

	return sipFile;
}
