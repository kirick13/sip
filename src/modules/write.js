
export default function write(base_path) {
	return new TransformStream({
		async transform(file, controller) {
			const fileCopy = file.clone();
			fileCopy.location.base = base_path;
			await fileCopy.write();

			controller.enqueue(file);
		},
	});
}
