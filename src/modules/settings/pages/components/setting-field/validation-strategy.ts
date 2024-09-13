import i18n from 'app/settings/i18n/i18n';

import { ICoreConfig } from 'shared/types/core-config';

export const validationStrategies = {
	required: {
		validate: (value: string | number | Array<any>) => {
			if (value === undefined) return false;
			if (typeof value === 'string') return value.trim().length > 0;
			if (Array.isArray(value)) return value.length !== 0;

			return true;
		},
		error: 'validation_errors.field_is_required',
	},
	regex: {
		validate: (value: string | number, regex: string) =>
			new RegExp(regex).test(String(value)),
		error: 'validation_errors.field_is_invalid',
	},
	max_value: {
		validate: (value: number | Array<any>, max: number) => {
			if (Array.isArray(value)) return value.length <= max;

			return value <= max;
		},
		error: (max: number) =>
			i18n.t('validation_errors.max_value', {
				length: max,
			}),
	},
	min_value: {
		validate: (value: number | Array<any>, min: number) => {
			if (Array.isArray(value)) return value.length >= min;

			return value >= min;
		},
		error: (min: number) =>
			i18n.t('validation_errors.min_value', {
				length: min,
			}),
	},
	max_length: {
		validate: (value: string, max: number) => value.trim().length <= max,
		error: (max: number) =>
			i18n.t('validation_errors.max_length', {
				length: max,
			}),
	},
	min_length: {
		validate: (value: string, min: number) => value.trim().length >= min,
		error: (min: number) =>
			i18n.t('validation_errors.min_length', {
				length: min,
			}),
	},
};

function validateField(
	value: string | number | Array<any>,
	rules: ICoreConfig['presentation']['validation'],
	valueType?: ICoreConfig['configType'],
): { isValid: boolean; error: string } {
	const isValueNumber = valueType === 'Number';
	const isValueString = valueType === 'String';

	const result = {
		isValid: true,
		error: '',
	};

	if (rules.required) {
		result.isValid = validationStrategies['required'].validate(
			isValueNumber ? Number(value) : value,
		);
		result.error = !result.isValid
			? validationStrategies['required'].error
			: '';
		if (!result.isValid) return result;
	}

	if (Array.isArray(value)) return result; //Don't handle array with rules which are provided below

	if (rules.regex) {
		result.isValid = validationStrategies['regex'].validate(value, rules.regex);
		result.error = !result.isValid ? validationStrategies['regex'].error : '';

		if (!result.isValid) return result;
	}

	if (rules.max !== undefined) {
		if (isValueNumber) {
			result.isValid = validationStrategies['max_value'].validate(
				Number(value),
				rules.max,
			);
			result.error = !result.isValid
				? validationStrategies['max_value'].error(rules.max)
				: '';

			if (!result.isValid) return result;
		}
		if (isValueString) {
			result.isValid = validationStrategies['max_length'].validate(
				value as string,
				rules.max,
			);
			result.error = !result.isValid
				? validationStrategies['max_length'].error(rules.max)
				: '';

			if (!result.isValid) return result;
		}
	}

	if (rules.range?.max !== undefined) {
		console.log(value);
		if (isValueNumber) {
			result.isValid = validationStrategies['max_value'].validate(
				Number(value),
				rules.range.max,
			);
			result.error = !result.isValid
				? validationStrategies['max_value'].error(rules.range.max)
				: '';

			if (!result.isValid) return result;
		}
		if (isValueString) {
			result.isValid = validationStrategies['max_length'].validate(
				value as string,
				rules.range.max,
			);
			result.error = !result.isValid
				? validationStrategies['max_length'].error(rules.range.max)
				: '';

			if (!result.isValid) return result;
		}
	}

	if (rules?.min !== undefined) {
		if (isValueNumber) {
			result.isValid = validationStrategies['min_value'].validate(
				Number(value),
				rules.min,
			);
			result.error = !result.isValid
				? validationStrategies['min_value'].error(rules.min)
				: '';

			if (!result.isValid) return result;
		}
		if (isValueString) {
			result.isValid = validationStrategies['min_length'].validate(
				value as string,
				rules.min,
			);
			result.error = !result.isValid
				? validationStrategies['min_length'].error(rules.min)
				: '';

			if (!result.isValid) return result;
		}
	}

	if (rules.range?.min !== undefined) {
		if (isValueNumber) {
			result.isValid = validationStrategies['min_value'].validate(
				Number(value),
				rules.range.min,
			);
			result.error = !result.isValid
				? validationStrategies['min_value'].error(rules.range.min)
				: '';

			if (!result.isValid) return result;
		}
		if (isValueString) {
			result.isValid = validationStrategies['min_length'].validate(
				value as string,
				rules.range.min,
			);
			result.error = !result.isValid
				? validationStrategies['min_length'].error(rules.range.min)
				: '';

			if (!result.isValid) return result;
		}
	}

	return result;
}

export { validateField };
