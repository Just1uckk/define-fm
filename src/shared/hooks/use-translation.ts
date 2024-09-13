import { useTranslation as useTranslationExternal } from 'react-i18next';

import { LanguageTypes } from 'shared/types/users';

export function useTranslation() {
	const { i18n, t } = useTranslationExternal();

	const currentLang = i18n.language as LanguageTypes;

	const multilingualT = ({
		field,
		translations,
		fallbackValue,
	}: {
		field: string;
		translations?: { [x: string]: Record<LanguageTypes, string> } | null;
		fallbackValue?: string | number;
	}) => {
		return translations?.[field]?.[currentLang] || fallbackValue || '';
	};

	return {
		t,
		multilingualT,
		tExists: i18n.exists,
		currentLang,
	};
}
