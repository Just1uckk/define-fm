export enum USERS_API_ERRORS {
	EntityNotFoundException = 'EntityNotFoundException',
	DuplicateEntityException = 'DuplicateEntityException',
}

export function getUsersApiErrorMessage(message: string): string {
	const [messageType] = message.split(':');

	return USERS_API_ERRORS[messageType] || message || message;
}
