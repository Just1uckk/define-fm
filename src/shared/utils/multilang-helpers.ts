import { LanguageTypes } from 'shared/types/users';

export const getMultiLangValues = (
	entity: object & {
		multilingual?: Record<string, Record<LanguageTypes, string>> | null;
	},
	fields: Array<string>,
	currentLang: LanguageTypes,
) => {
	if (!entity.multilingual) {
		const values: Record<
			(typeof fields)[number],
			Record<LanguageTypes, string>
		> = {};

		fields.forEach((field) => {
			values[field] = {
				en: '',
				fr_CA: '',
				[currentLang]: entity[field] || '',
			};
		});

		return values;
	}

	const updatedFields = {
		...entity.multilingual,
	};

	fields.forEach((field) => {
		if (!(field in updatedFields)) {
			updatedFields[field] = {
				en: '',
				fr_CA: '',
				[currentLang]: entity[field] || '',
			};
		}
	});

	return updatedFields;
};
