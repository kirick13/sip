
import { createGzip }               from 'node:zlib';
import { createReadableNodeStream } from '../utils.js';

function gzipBuffer(source, options) {
	return new Promise((resolve, reject) => {
		const sink = new Bun.ArrayBufferSink();

		createReadableNodeStream(
			Buffer.from(source),
		).pipe(
			createGzip(options),
		).on(
			'data',
			(chunk) => {
				sink.write(chunk);
			},
		).on(
			'end',
			() => {
				resolve(
					sink.end(),
				);
			},
		).on(
			'error',
			(error) => {
				reject(error);
			},
		);
	});
}

export default function gzip(options) {
	return new TransformStream({
		async transform(file, controller) {
			file.location.ext += '.gz';
			file.contents = await gzipBuffer(
				file.contents,
				options,
			);

			controller.enqueue(file);
		},
	});
}
