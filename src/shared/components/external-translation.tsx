import React, { ReactElement } from 'react';

import { LanguageTypes } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

interface ExternalTranslationProps {
	translations?: { [x: string]: Record<LanguageTypes, string> } | null; // {name: {en: 'Local Provider' } }
	field: string;
	fallbackValue?: string | number;
	emptyValue?: string | number;
	children?:
		| ((data: {
				translation: string | number | undefined;
		  }) => ReactElement<any, any> | null)
		| React.ReactNode;
}

export const ExternalTranslation: React.FC<ExternalTranslationProps> = ({
	translations,
	field,
	fallbackValue,
	emptyValue,
	children,
}) => {
	const { multilingualT } = useTranslation();

	const translation = multilingualT({ field, translations, fallbackValue });

	if (typeof children === 'function') {
		return children({ translation: translation || emptyValue });
	}

	return <>{translation || emptyValue}</>;
};
