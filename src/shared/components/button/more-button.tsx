import React, { Key } from 'react';
import { Item } from 'react-stately';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import {
	DropdownButton,
	DropdownButtonProps,
} from 'shared/components/dropdown/dropdown-button';
import { ICON_COLLECTION, IconProps } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import {
	MenuButton,
	MenuButtonProps,
} from 'shared/components/menu-button/menu-button';

const MenuButtonTrigger = styled(IconButton)<ThemeProps>`
	&[aria-expanded='true'] {
		color: ${({ theme }) => theme.colors.accent};
		background-color: var(--active-bg-color);
	}
`;

export type MoreButtonOption = DropdownButtonProps & {
	key: string;
	onSelect?: () => void;
};

export interface MoreButtonProps {
	className?: string;
	options: Array<MoreButtonOption>;
	icon?: IconProps['icon'];
	disabled?: boolean;
	placement?: MenuButtonProps<HTMLButtonElement>['placement'];
	handler?: React.ReactElement<any, any>;
}

export const MoreButton: React.FC<MoreButtonProps> = ({
	className,
	options,
	icon = ICON_COLLECTION.more,
	disabled,
	placement = 'left top',
	handler,
}) => {
	const handleSelectOption = (key: Key) => {
		const item = options.find((option) => option.key === key);

		item?.onSelect && item.onSelect();
	};

	return (
		<MenuButton<MoreButtonOption>
			closeOnSelect
			onAction={handleSelectOption}
			handler={
				handler || (
					<MenuButtonTrigger
						className={className}
						icon={icon}
						isDisabled={disabled}
					/>
				)
			}
			items={options}
			placement={placement}
		>
			{({ key, label, ...props }) => (
				<Item key={key} textValue={label as string}>
					<DropdownButton variant="primary_ghost" label={label} {...props} />
				</Item>
			)}
		</MenuButton>
	);
};
