import { PasswordSettings, ValidationPasswordErrors } from 'shared/types/users';

export const validatePassword = (
	value: string,
	passwordRequirements: PasswordSettings,
) => {
	const errors: ValidationPasswordErrors = {};

	const hasValue = !!value?.trim().length;
	const containDigit =
		passwordRequirements?.shouldContainDigit?.value === 'true'
			? RegExp('.*\\d.*').test(value)
			: true;
	const containSymbol =
		passwordRequirements?.shouldContainSymbol?.value === 'true'
			? RegExp('[!@#$%^&*()+_\\-=}{[\\]|:;"/?.><,`~]').test(value)
			: true;
	const containLower =
		passwordRequirements?.shouldContainLower?.value === 'true'
			? RegExp('.*[a-z].*').test(value)
			: true;
	const containUpper =
		passwordRequirements?.shouldContainUpper.value === 'true'
			? RegExp('.*[A-Z].*').test(value)
			: true;
	const minLength = value.length >= Number(passwordRequirements?.min.value);
	const maxLength = value.length <= Number(passwordRequirements?.max.value);

	if (!hasValue) errors.hasValue = 'validation_errors.field_is_required';
	if (!containDigit) errors.notContainDigit = true;
	if (!containSymbol) errors.notContainSymbol = true;
	if (!containLower) errors.notContainLower = true;
	if (!containUpper) errors.notContainUpper = true;
	if (!minLength) errors.minLength = true;
	if (!maxLength) errors.maxLength = true;

	return errors;
};
