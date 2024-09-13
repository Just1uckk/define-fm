import React, { DOMAttributes, InputHTMLAttributes } from 'react';
import { AriaButtonProps } from 'react-aria';
import clsx from 'clsx';
import styled, { css } from 'styled-components';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { BaseInput } from 'shared/components/input/base-input';
import { InputProps } from 'shared/components/input/input';
import { Text } from 'shared/components/text/text';

const Container = styled.div``;

const StyledBaseInput = styled(BaseInput)`
	position: relative;
	color: ${({ theme }) => theme.colors.secondary};

	&.has-clear .input {
		padding-right: 5.5rem;
	}
	&.has-error .input {
		&:not(:focus) {
			border-color: ${({ theme }) => theme.colors.error};
		}
	}
`;

const StyledError = styled(Text)`
	padding: 0 1rem;
	margin-top: 0.25rem;
`;

const SelectActions = styled.div`
	position: absolute;
	top: 50%;
	right: 0.4rem;
	display: flex;
	gap: 8px;
	transform: translateY(-50%);
`;

const CloseIcon = styled(IconButton)<{ isOpen?: boolean }>`
	${({ isOpen }) =>
		isOpen &&
		css`
			color: ${({ theme }) => theme.colors.accent};
		`}
`;

const ClearButton = styled(IconButton)`
	svg {
		width: 10px;
		height: 10px;
	}
`;

export type SelectComboboxInputProps = InputHTMLAttributes<HTMLInputElement> & {
	isGroupMapping?: boolean;
	inputRef?: React.Ref<HTMLInputElement>;
	buttonRef: React.Ref<HTMLButtonElement>;
	buttonProps: AriaButtonProps<'button'>;
	error?: React.ReactNode;
	errorMessageProps: DOMAttributes<Element>;
	isOpen?: boolean;
	clearable?: boolean;
	fulfilled?: boolean;
	label?: InputProps['label'];
	onClear?: () => void;
};

export const SelectComboboxInput: React.FC<SelectComboboxInputProps> = ({
	isGroupMapping,
	className,
	inputRef,
	isOpen,
	error,
	fulfilled,
	clearable,
	buttonRef,
	buttonProps,
	errorMessageProps,
	onClear,
	...props
}) => {
	return (
		<Container>
			<StyledBaseInput
				ref={inputRef}
				className={clsx(
					{
						'has-clear': clearable,
						'has-error': !!error,
					},
					className,
				)}
				fulfilled={fulfilled}
				{...props}
				onFocus={(e) => {
					if (isGroupMapping) e.target.setSelectionRange(0, 0);
				}}
				iconRight={
					<SelectActions>
						<CloseIcon
							ref={buttonRef}
							icon={
								isOpen
									? ICON_COLLECTION.chevron_top
									: ICON_COLLECTION.chevron_down
							}
							isOpen={isOpen}
							{...buttonProps}
						/>
						{clearable && (
							<ClearButton
								icon={ICON_COLLECTION.cross}
								aria-label="Clear search"
								excludeFromTabOrder
								preventFocusOnPress
								tabIndex={0}
								onPress={onClear}
							/>
						)}
					</SelectActions>
				}
			/>
			{error && (
				<StyledError variant="body_6_error" {...errorMessageProps}>
					{error}
				</StyledError>
			)}
		</Container>
	);
};
