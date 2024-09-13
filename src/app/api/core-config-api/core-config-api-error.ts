export enum CORE_CONFIG_API_ERRORS {}

export function getCoreConfigApiErrorMessage(message: string): string {
	const [messageType] = message.split(':');

	return CORE_CONFIG_API_ERRORS[messageType] || message || '';
}
