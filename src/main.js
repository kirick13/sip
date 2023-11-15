
export function pipeline(...args) {
	return {
		module: () => import('./modules/pipeline.js'),
		args,
	};
}

export function read(...args) {
	return {
		module: () => import('./modules/read.js'),
		args,
	};
}

export function write(...args) {
	return {
		module: () => import('./modules/write.js'),
		args,
	};
}

export function gzip(...args) {
	return {
		module: () => import('./modules/gzip.js'),
		args,
	};
}

export function use(...args) {
	return {
		module: () => import('./modules/use.js'),
		args,
	};
}

export { SipFile } from './file.js';

