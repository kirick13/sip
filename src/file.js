
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

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

export class SipFile {
	static TYPE_ARRAY_BUFFER = Symbol('TYPE_ARRAY_BUFFER');
	static TYPE_STRING = Symbol('TYPE_STRING');
	static TYPE_NODEJS_BUFFER = Symbol('TYPE_NODEJS_BUFFER');

	static convert(source, type) {
		switch (type) {
			case SipFile.TYPE_ARRAY_BUFFER:
				if (source instanceof ArrayBuffer) {
					return source;
				}

				if (
					ArrayBuffer.isView(source)
					|| source instanceof Buffer
				) {
					return source.buffer;
				}

				if (typeof source === 'string') {
					return textEncoder.encode(source).buffer;
				}

				throw new Error('Cannot convert file contents to string.');

			case SipFile.TYPE_STRING:
				if (typeof source === 'string') {
					return source;
				}

				if (
					source instanceof ArrayBuffer
					|| ArrayBuffer.isView(source)
				) {
					return textDecoder.decode(source);
				}

				if (source instanceof Buffer) {
					return this.contents.toString();
				}

				throw new Error('Cannot convert file contents to string.');

			case SipFile.TYPE_NODEJS_BUFFER:
				if (source instanceof Buffer) {
					return source;
				}

				if (
					source instanceof ArrayBuffer
					|| ArrayBuffer.isView(source)
					|| typeof source === 'string'
				) {
					return Buffer.from(
						source,
					);
				}

				throw new Error('Cannot convert file contents to NodeJS Buffer.');
			default:
				throw new Error(`Unknown type "${type}" given.`);
		}
	}

	location;
	contents;

	constructor(base_path, path, protector) {
		if (protector !== PROTECTOR) {
			throw new Error('Do not use new SipFile() directly, use createSipFile() method instead.');
		}

		this.location = new SipFileLocation(base_path, path);
	}

	get(type) {
		return SipFile.convert(
			this.contents,
			type,
		);
	}

	set(source) {
		this.contents = SipFile.convert(
			source,
			SipFile.TYPE_ARRAY_BUFFER,
		);
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
