export enum AUTH_API_ERRORS {
	'Invalid password reset token.' = 'set_new_password.form.validations.invalid_token',
	'Unauthorized' = 'log_in.form.errors.unauthorized',
}

export function getAuthApiErrorMessage(message: string): string {
	const [messageType] = message.split(':');

	return AUTH_API_ERRORS[messageType] || message || '';
}
