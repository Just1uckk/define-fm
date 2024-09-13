export enum DISPOSITION_SEARCHES_API_ERRORS {
	'NotFound' = 'NotFound',
	'DuplicateEntityException' = 'DuplicateEntityException',
}

export function getDispositionSearchApiErrorMessage(message: string): string {
	const [messageType] = message.split(':');

	return DISPOSITION_SEARCHES_API_ERRORS[messageType] || message || '';
}
