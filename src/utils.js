
import { Readable } from 'node:stream';

export function createReadableStream(content) {
	return new ReadableStream({
		start(controller) {
			controller.enqueue(content);
			controller.close();
		},
	});
}

export function createReadableNodeStream(content) {
	return new Readable({
		read() {
			this.push(content);
			this.push(null);
		},
	});
}
