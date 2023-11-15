
import { SipFile } from '../file.js';

export default function use(callback) {
	return new TransformStream({
		async transform(file, controller) {
			const result = await callback(file);

			if (result instanceof SipFile) {
				controller.enqueue(result);
			}
			else if (result !== null) {
				controller.enqueue(file);
			}
		},
	});
}
