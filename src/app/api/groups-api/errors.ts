export enum GROUP_API_ERRORS {
	'DuplicateEntityException' = 'DuplicateEntityException',
}

export function getGroupApiErrorMessage(message: string): string {
	const [messageType] = message.split(':');

	return GROUP_API_ERRORS[messageType] || '';
}
