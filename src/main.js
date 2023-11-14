
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

// const read_stream = new ReadableStream({
// 	start(controller) {
// 		controller.enqueue(data);
// 	},
// });

// const transform_stream = new TransformStream({
// 	transform(chunk, controller) {
// 		console.log('transform', chunk);
// 		console.log('transform is equal', chunk === data);

// 		controller.enqueue(chunk);
// 	},
// });

// const write_stream = new WritableStream({
// 	write(chunk) {
// 		console.log('writable', chunk);
// 		console.log('writable is equal', chunk === data);
// 	},
// });

// read_stream.pipeTo(transform_stream.writable);
// transform_stream.readable.pipeTo(write_stream);

// import { createSipFile } from './file.js';

// const sipFile = await createSipFile('./files/readme');

// sipFile.location.dir = 'files';
// sipFile.location.base = 'kirick.md';
// sipFile.contents = 'now string';
// console.log(sipFile);
// console.log(sipFile.location.base);

// await sipFile.write();

