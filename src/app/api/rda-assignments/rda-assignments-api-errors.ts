export enum RDA_ASSIGNMENTS_API_ERRORS {}

export function getRdaAssignmentsApiErrorMessage(message: string): string {
	const [messageType] = message.split(':');

	return RDA_ASSIGNMENTS_API_ERRORS[messageType] || '';
}
