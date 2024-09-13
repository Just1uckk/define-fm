import { addDays, differenceInDays, format, Locale } from 'date-fns';
import { enUS, frCA } from 'date-fns/locale';

import { LanguageTypes } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

const LOCALES: Record<LanguageTypes, Locale> = {
	en: enUS,
	fr_CA: frCA,
};

export function useDate() {
	const { currentLang } = useTranslation();

	const formats = {
		base: (date: string | Date) =>
			format(new Date(date), 'MM/dd/yyyy', {
				locale: LOCALES[currentLang],
			}),
		baseWithTime: (date: string | Date) =>
			format(new Date(date), 'MM/dd/yyyy h:mm aa', {
				locale: LOCALES[currentLang],
			}),
		baseWithTimeAndSeconds: (date: string | Date) =>
			format(new Date(date), 'MM/dd/yyyy h:mm:ss aa', {
				locale: LOCALES[currentLang],
			}),
		pageHead: (date: string | Date = new Date()) =>
			format(new Date(date), 'MMMM dd, yyyy', {
				locale: LOCALES[currentLang],
			}),
	};

	const isStringDate = (string: string) => {
		return !!Date.parse(string);
	};

	return {
		currentLang,
		currentLocale: LOCALES[currentLang],
		formats,
		addDays,
		differenceInDays,
		isStringDate,
	};
}
