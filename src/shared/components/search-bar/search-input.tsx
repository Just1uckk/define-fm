import React, { forwardRef, HTMLAttributes, InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import styled, { css } from 'styled-components';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	IconButton,
	IconButtonProps,
} from 'shared/components/icon-button/icon-button';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';

const Container = styled.div``;

const StyledIcon = styled(Icon)`
	position: absolute;
	left: 1rem;
	top: 50%;
	transform: translateY(-50%);
	color: currentColor;
`;

const StyledInput = styled.input<Pick<SearchInputProps, 'fulfilled'>>`
	width: 100%;
	padding: 0.75rem;
	padding-left: 2.5rem;
	font-size: 1rem;
	line-height: 1.1875rem;
	color: ${({ theme }) => theme.search_bar.color};
	background: ${({ theme }) => theme.search_bar.bg};
	border: 1px solid ${({ theme }) => theme.search_bar.borderColor};
	border-radius: 8px;
	outline: none;
	transition: border-color 0.2s, color 0.2s ease;

	${({ fulfilled }) =>
		fulfilled &&
		css`
			width: 100%;
		`};

	&:focus {
		color: ${({ theme }) => theme.input.color};
		border-color: ${({ theme }) => theme.input.focus.borderColor};

		& ~ ${StyledIcon} {
			color: ${({ theme }) => theme.input.focus.borderColor};
		}
	}

	&:disabled {
		background-color: ${({ theme }) => theme.input.disabled.bg};
		cursor: not-allowed;
	}
`;

const InputWrapper = styled.div`
	position: relative;
	color: ${({ theme }) => theme.colors.secondary};

	&.has-clear ${StyledInput} {
		padding-right: 2.5rem;
	}
	&.has-error ${StyledInput} {
		&:not(:focus) {
			border-color: ${({ theme }) => theme.colors.error};
		}
	}
`;

const StyledSpinner = styled(Spinner)`
	position: absolute;
	left: 1rem;
	top: 50%;
	width: 12px;
	height: 12px;
	transform: translateY(-50%);

	&::after {
		border-top-color: currentColor;
	}
`;

const ClearButton = styled(IconButton)`
	position: absolute;
	right: 0.75rem;
	top: 50%;
	width: 1.4rem;
	height: 1.4rem;
	color: ${({ theme }) => theme.colors.primary};
	background-color: ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: 50%;
	transform: translateY(-50%);

	svg {
		width: 0.5rem;
		height: 0.5rem;
	}
`;

const StyledError = styled(Text)`
	padding: 0 1rem;
	margin-top: 0.25rem;
`;

export interface SearchInputProps extends HTMLAttributes<HTMLInputElement> {
	className?: InputHTMLAttributes<HTMLInputElement>['className'];
	error?: React.ReactNode;
	isLoading?: boolean;
	autoFocus?: boolean;
	fulfilled?: boolean;
	clearable?: boolean;
	clearButtonProps?: Omit<IconButtonProps, 'icon'>;
	errorMessageProps?: any;
}

export const _SearchInput: React.ForwardRefRenderFunction<
	HTMLInputElement,
	SearchInputProps
> = (
	{
		className,
		isLoading,
		fulfilled,
		clearable,
		clearButtonProps,
		errorMessageProps = {},
		...props
	},
	ref,
) => {
	return (
		<Container className={className}>
			<InputWrapper
				className={clsx(
					{
						'has-clear': clearable,
						'has-error': !!props.error,
					},
					className,
				)}
			>
				{isLoading && <StyledSpinner />}
				<StyledInput ref={ref} fulfilled={fulfilled} {...props} />
				{!isLoading && <StyledIcon icon={ICON_COLLECTION.search} />}
				{clearable && (
					<ClearButton icon={ICON_COLLECTION.cross} {...clearButtonProps} />
				)}
			</InputWrapper>
			{props.error && (
				<StyledError variant="body_6_error" {...errorMessageProps}>
					{props.error}
				</StyledError>
			)}
		</Container>
	);
};

export const SearchInput = forwardRef(_SearchInput);
