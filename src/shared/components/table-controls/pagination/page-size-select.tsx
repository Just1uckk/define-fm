import React, { forwardRef, Key, useRef } from 'react';
import { useButton } from 'react-aria';
import { Item } from 'react-stately';
import { AriaButtonProps } from '@react-types/button';
import mergeRefs from 'shared/utils/merge-refs';
import styled from 'styled-components';

import { DropdownSimpleButton } from 'shared/components/dropdown/dropdown-simple-button';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	MenuButton,
	MenuButtonProps,
} from 'shared/components/menu-button/menu-button';
import { Text } from 'shared/components/text/text';

const StyledMenuButton = styled(MenuButton)`
	padding: 0;
	min-width: auto;
`;

const Button = styled.button`
	margin: 0 0.2rem;
	padding: 0.2rem 0.5rem;
	background-color: ${({ theme }) => theme.colors.white_inverted};
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: 4px;
`;

const ButtonArrow = styled(Icon)`
	color: currentColor;
	margin-left: 0.4rem;
`;

const StyledSimpleButton = styled(DropdownSimpleButton)`
	display: flex;
	justify-content: center;
	font-size: 0.75rem;
	line-height: 0.875rem;
`;

export const PAGE_SIZE_OPTIONS = [
	{
		label: '25',
		value: 25,
	},
	{
		label: '50',
		value: 50,
	},
	{
		label: '100',
		value: 100,
	},
	{
		label: '250',
		value: 250,
	},
] as const;

interface PageSizeSelectProps {
	value: number;
	onSelectOption?: (size: number) => void;
}

export const PageSizeSelect: React.FC<PageSizeSelectProps> = ({
	value,
	onSelectOption,
}) => {
	const onSelectSize = (key: Key) => {
		const size = key as number;

		if (value === size) {
			return;
		}

		onSelectOption && onSelectOption(size);
	};

	return (
		<>
			<StyledMenuButton<
				React.ComponentType<MenuButtonProps<{ label: string; value: number }>>
			>
				items={PAGE_SIZE_OPTIONS}
				onAction={onSelectSize}
				placement="top"
				handler={
					<PageSizeSelectTrigger>
						<Text tag="span" variant="body_4_primary">
							{value}
						</Text>
						<ButtonArrow icon={ICON_COLLECTION.chevron_down} />
					</PageSizeSelectTrigger>
				}
			>
				{({ value: _value, label }) => (
					<Item key={_value} textValue={label}>
						<StyledSimpleButton isActive={value === _value}>
							{label}
						</StyledSimpleButton>
					</Item>
				)}
			</StyledMenuButton>
		</>
	);
};

const _PageSizeSelectTrigger: React.ForwardRefRenderFunction<
	HTMLElement,
	React.PropsWithChildren
> = (props: AriaButtonProps<'button'>, ref) => {
	const localRef = useRef<HTMLButtonElement>(null);
	const { buttonProps } = useButton(props, localRef);

	return (
		<Button ref={mergeRefs(ref, localRef)} {...buttonProps}>
			{props.children}
		</Button>
	);
};

const PageSizeSelectTrigger = forwardRef(_PageSizeSelectTrigger);
