export enum AUTH_PROVIDER_API_ERRORS {
	'DuplicateEntityException' = 'DuplicateEntityException',
}

export function getAuthProviderApiErrorMessage(message: string): string {
	const [messageType] = message.split(':');

	return AUTH_PROVIDER_API_ERRORS[messageType] || message || '';
}
