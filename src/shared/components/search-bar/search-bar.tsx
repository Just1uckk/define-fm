import React, { forwardRef, InputHTMLAttributes, useRef } from 'react';
import { AriaSearchFieldProps, useSearchField } from 'react-aria';
import { useSearchFieldState } from 'react-stately';
import mergeRefs from 'shared/utils/merge-refs';

import { useTranslation } from 'shared/hooks/use-translation';

import { SearchInput } from 'shared/components/search-bar/search-input';

export interface SearchBarProps extends AriaSearchFieldProps {
	className?: InputHTMLAttributes<HTMLInputElement>['className'];
	error?: string;
	isLoading?: boolean;
	fulfilled?: boolean;
	onClick?: InputHTMLAttributes<HTMLInputElement>['onClick'];
}

export const SearchBarComponent: React.ForwardRefRenderFunction<
	HTMLInputElement,
	SearchBarProps
> = ({ className, isLoading, fulfilled, onClick, ...props }, ref) => {
	const { t } = useTranslation();
	const localRef = useRef<HTMLInputElement>(null);

	const state = useSearchFieldState({
		...props,
		errorMessage: props.error,
	});

	const { inputProps, clearButtonProps, errorMessageProps } = useSearchField(
		{
			...props,
			placeholder: props.placeholder || t('components.search_bar.placeholder'),
			label: props.placeholder || t('components.search_bar.placeholder'),
		},
		state,
		localRef,
	);

	return (
		<SearchInput
			ref={mergeRefs(ref, localRef)}
			{...inputProps}
			error={props.error}
			clearable={!!state.value}
			isLoading={isLoading}
			clearButtonProps={clearButtonProps}
			errorMessageProps={errorMessageProps}
			fulfilled={fulfilled}
			onClick={onClick}
		/>
	);
};

export const SearchBar = forwardRef(SearchBarComponent);
