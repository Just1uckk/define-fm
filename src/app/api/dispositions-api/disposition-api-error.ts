export enum DISPOSITIONS_API_ERRORS {
	'NotFound' = 'NotFound',
	'DuplicateEntityException' = 'DuplicateEntityException',
}

export function getDispositionsApiErrorMessage(message: string): string {
	const [messageType] = message.split(':');

	return DISPOSITIONS_API_ERRORS[messageType] || message || '';
}
