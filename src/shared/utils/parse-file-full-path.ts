export function parseFileFullPath(path: string, fileName: string) {
	let trimmedPath = path.replace(fileName, '');
	const delimetr = trimmedPath.charAt(trimmedPath.length - 1);

	trimmedPath = trimmedPath.slice(0, -1);

	return trimmedPath.split(delimetr);
}
