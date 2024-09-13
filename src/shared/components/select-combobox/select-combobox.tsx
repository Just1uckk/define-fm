import React, { useEffect } from 'react';
import { useComboBox } from 'react-aria';
import { useComboBoxState } from 'react-stately';
import type { ComboBoxProps } from '@react-types/combobox';

import { InputProps } from 'shared/components/input/input';
import { Popover, PopoverProps } from 'shared/components/menu-button/popover';
import { ListBox } from 'shared/components/select-combobox/list-box';
import {
	SelectComboboxInput,
	SelectComboboxInputProps,
} from 'shared/components/select-combobox/select-combobox-input';

export interface SelectComboBoxProps<T> extends ComboBoxProps<T> {
	isGroupMapping?: boolean;
	approvers?: boolean;
	unsavedIsOpen?: boolean;
	input?: (props: SelectComboboxInputProps) => React.ReactNode;
	fulfilled?: SelectComboboxInputProps['fulfilled'];
	label?: InputProps['label'];
	clearable?: SelectComboboxInputProps['clearable'];
	closeOnScroll?: PopoverProps['closeOnScroll'];
	onSelectItem: (entity: T | null) => void;
	onClearValue?: () => void;
}

export function SelectComboBox<T extends object>(
	props: SelectComboBoxProps<T>,
) {
	const {
		input: inputProp,
		fulfilled = true,
		clearable,
		approvers,
		closeOnScroll,
		onClearValue,
		onSelectItem,
	} = props;

	const state = useComboBoxState({
		...props,
		allowsEmptyCollection: true,
		allowsCustomValue: true,
		onSelectionChange: handleSelectionChange,
	});

	const buttonRef = React.useRef(null);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const listBoxRef = React.useRef(null);
	const popoverRef = React.useRef(null);

	const {
		inputProps: baseInputProps,
		listBoxProps,
		buttonProps: triggerProps,
		errorMessageProps,
	} = useComboBox(
		{
			...props,
			label: props.label || props.placeholder,
			inputRef,
			buttonRef,
			listBoxRef,
			popoverRef,
		},
		state,
	);

	function handleSelectionChange(key: React.Key) {
		if (!key) return;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const item = state.collection.getItem(key);

		if (!item) return;
		onSelectItem(item.value);
		if (approvers) {
			state.close();
		}
	}

	useEffect(() => {
		if (props.unsavedIsOpen) {
			state.close();
		}
	}, [props.unsavedIsOpen]);

	const inputProps: SelectComboboxInputProps = {
		...baseInputProps,
		inputRef: inputRef,
		placeholder: props.placeholder,
		fulfilled: fulfilled,
		label: props.label,
		buttonRef,
		buttonProps: triggerProps,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		error: props.errorMessage,
		errorMessageProps,
		isOpen: state.isOpen,
		clearable,
		onClear: onClearValue,
	};

	const input = inputProp ? (
		inputProp(inputProps)
	) : (
		<SelectComboboxInput
			{...inputProps}
			isGroupMapping={props.isGroupMapping}
		/>
	);

	return (
		<>
			{input}

			{state.isOpen && (
				<Popover
					state={state}
					triggerRef={inputRef}
					popoverRef={popoverRef}
					placement="bottom start"
					closeOnScroll={closeOnScroll}
				>
					<ListBox<T>
						{...listBoxProps}
						listBoxRef={listBoxRef}
						state={state}
						triggerId={baseInputProps.id}
					/>
				</Popover>
			)}
		</>
	);
}
