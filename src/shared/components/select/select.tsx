import React, { Key, useEffect } from 'react';
import { AriaSelectOptions, HiddenSelect, useSelect } from 'react-aria';
import { useSelectState } from 'react-stately';
import { CollectionChildren } from '@react-types/shared/src/collections';
import clsx from 'clsx';
import styled, { css } from 'styled-components';

import { LanguageTypes } from 'shared/types/users';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { Popover } from 'shared/components/menu-button/popover';
import { Text } from 'shared/components/text/text';

import { ListBox } from './list-box';
import { SelectTrigger } from './select-trigger';

const Wrapper = styled.div`
	position: relative;
`;

const SelectWrapper = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
`;

const InputLabel = styled.label`
	position: absolute;
	top: 50%;
	left: 0;
	right: 0;
	padding-left: 1rem;
	padding-right: 2rem;
	font-size: 1rem;
	color: ${({ theme }) => theme.colors.grey.style_2};
	text-overflow: ellipsis;
	white-space: nowrap;
	transform: translateY(-50%);
	transition: font-size 0.3s, line-height 0.3s, top 0.3s ease;
	cursor: text;
	user-select: none;
	pointer-events: none;
	overflow: hidden;
`;

const StyledError = styled(Text)`
	padding: 0 1rem;
	margin-top: 0.25rem;
`;

const SelectActions = styled.div`
	position: absolute;
	top: 50%;
	right: 1rem;
	display: flex;
	gap: 12px;
	transform: translateY(-50%);
`;

const CloseIcon = styled(Icon)<{ isOpen: boolean }>`
	${({ isOpen }) =>
		isOpen &&
		css`
			color: ${({ theme }) => theme.colors.accent};
		`}
`;

const ClearButton = styled(IconButton)`
	width: 1.5rem;
	height: 1.5rem;
	margin-right: -0.47rem;

	svg {
		width: 10px;
		height: 10px;
	}
`;

const SelectButton = styled(SelectTrigger)`
	&.readonly {
		cursor: default;
	}

	&:disabled {
		background-color: ${({ theme }) => theme.input.disabled.bg};

		& ${CloseIcon} {
			color: ${({ theme }) => theme.colors.secondary};
		}
	}

	&.has-label {
		padding-top: 1rem;
	}

	&.has-value ${InputLabel}, &.has-search-value ${InputLabel} {
		top: 30%;
		font-size: 0.6875rem;
		line-height: 0.875rem;
	}

	&.has-error {
		border-color: ${({ theme }) => theme.colors.error};
		&:not(:focus, :focus-within):hover {
			border-color: ${({ theme }) => theme.colors.error};
		}
	}

	&.clearable {
		padding-right: 4.5rem;
	}
`;

export type Option = {
	key: string | number;
	value: string | number;
	label: string | number;
	multilingual?: { [x: string]: Record<LanguageTypes, string> };
};

interface SelectProps<Option extends object>
	extends Omit<AriaSelectOptions<Option>, 'children'> {
	className?: string;
	options: Option[];
	clearable?: boolean;
	unsavedIsOpen?: boolean;
	readonly?: boolean;
	error?: string;
	onChange: (Option: Option | null) => void;
	onGetSelectedOptionLabel?: (option: Option | null) => React.ReactNode;
	children?:
		| ((option: Option) => React.ReactNode | Element | JSX.Element)
		| React.ReactNode;
}

export function Select<Option extends object>(props: SelectProps<Option>) {
	const {
		options,
		name,
		className,
		label,
		error,
		clearable,
		unsavedIsOpen,
		readonly,
		onChange,
		onGetSelectedOptionLabel,
		children,
	} = props;

	// Create state based on the incoming props
	const state = useSelectState<Option>({
		...props,
		items: options,
		validationState: error ? 'invalid' : 'valid',
		onSelectionChange: handleSelectionChange,
		children: children as CollectionChildren<Option>,
		errorMessage: error,
	});

	// Get props for child elements from useSelect
	const triggerRef = React.useRef(null);
	const { labelProps, triggerProps, valueProps, menuProps } = useSelect<Option>(
		{
			...props,
			label: label,
			validationState: error ? 'invalid' : 'valid',
			errorMessage: error,
		},
		{
			...state,
			//this is overwriting initial .toggle method as it doesn't allow open empty list and show empty list message
			toggle() {
				state.setOpen(!state.isOpen);
			},
		},
		triggerRef,
	);

	const isOpen = state.isOpen;
	const isValue = !!state.selectedItem;

	function handleSelectionChange(key: Key) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const item = state.collection.getItem(key);

		onChange(item ? item.value : item);
	}

	const handleClearValue = () => {
		onChange(null);
	};

	const dropdownMenu = isOpen && (
		<Popover state={state} triggerRef={triggerRef} placement="bottom start">
			<ListBox<Option>
				{...menuProps}
				state={state}
				triggerId={triggerProps.id}
			/>
		</Popover>
	);

	useEffect(() => {
		if (unsavedIsOpen) {
			state.setOpen(false);
		}
	}, [unsavedIsOpen]);

	return (
		<Wrapper className={className}>
			<HiddenSelect
				state={state}
				triggerRef={triggerRef}
				label={label}
				name={name}
			/>

			<SelectWrapper>
				<SelectButton
					ref={triggerRef}
					className={clsx({
						'has-label': !!label,
						'has-error': !!error,
						'has-value': isValue,
						clearable: clearable,
						readonly: readonly,
					})}
					{...triggerProps}
				>
					{isValue && (
						<span {...valueProps}>
							{onGetSelectedOptionLabel
								? onGetSelectedOptionLabel(state.selectedItem.value)
								: state.selectedItem.rendered}
						</span>
					)}
					{label && <InputLabel {...labelProps}>{label}</InputLabel>}

					<SelectActions>
						<CloseIcon
							icon={
								isOpen
									? ICON_COLLECTION.chevron_top
									: ICON_COLLECTION.chevron_down
							}
							isOpen={isOpen}
						/>
						{clearable && (
							<ClearButton
								aria-hidden="true"
								icon={ICON_COLLECTION.cross}
								onPress={handleClearValue}
							/>
						)}
					</SelectActions>
				</SelectButton>
			</SelectWrapper>
			{dropdownMenu}
			{error && <StyledError variant="body_6_error">{error}</StyledError>}
		</Wrapper>
	);
}
