import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Namespace, TFuncKey, TFunction, TOptions } from 'i18next';

type StringMap = { [key: string]: any };

export interface LocalTranslationProps<
	TInterpolationMap extends object = StringMap,
> {
	tk: TFuncKey<Namespace<'translation'>>;
	options?: TOptions<TInterpolationMap> | string;
	namespace?: 'translation' | 'translation'[] | readonly 'translation'[];
	children?:
		| React.ReactNode
		| ((data: {
				t: TFunction<Namespace<string>, undefined>;
		  }) => ReactElement<any, any> | null);
}

export const LocalTranslation: React.FC<LocalTranslationProps> = ({
	tk,
	namespace = 'translation',
	options,
	children,
}) => {
	const { t: translation } = useTranslation(namespace);

	if (typeof children === 'function') {
		return children({ t: translation });
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	return <>{translation(tk, options)}</>;
};
