export enum DATA_SYNC_PROVIDER_API_ERRORS {
	'DuplicateEntityException' = 'DuplicateEntityException',
}

export function getDataSyncProviderApiErrorMessage(message: string): string {
	const [messageType] = message.split(':');

	return DATA_SYNC_PROVIDER_API_ERRORS[messageType] || message || '';
}
