import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import englishLocale from 'shared/assets/locales/app_english.json';
import frenchCaLocale from 'shared/assets/locales/app_french.json';

export const defaultNS = 'translation';
export const resources = {
	en: {
		translation: englishLocale,
	},
	fr_CA: {
		translation: frenchCaLocale,
	},
} as const;

void i18n.use(initReactI18next).init({
	returnNull: false,
	lng: 'en',
	fallbackLng: 'en',
	resources,
	defaultNS,
	debug: true,
});

export default i18n;
