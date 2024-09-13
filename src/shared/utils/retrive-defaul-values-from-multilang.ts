import { LanguageTypes } from 'shared/types/users';

export const retrieveDefaultValuesFromMultilang = (
	data: object & { multilingual: Record<string, LanguageTypes> },
	currentLang: LanguageTypes,
) => {
	if (!('multilingual' in data)) {
		return {};
	}

	const fields = {};

	for (const fieldName in data.multilingual) {
		const propertyValue = data.multilingual[fieldName][currentLang];
		fields[fieldName] = propertyValue;
	}

	return fields;
};
