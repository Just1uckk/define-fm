import React, { Key } from 'react';
import { Item } from 'react-stately';
import { t } from 'i18next';

import { IUser } from 'shared/types/users';

import { DropdownButton } from 'shared/components/dropdown/dropdown-button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { MenuButton } from 'shared/components/menu-button/menu-button';

import { UserMenuButton } from './user-menu-button';

enum OPTION_ID {
	settings = 1,
	logout = 2,
}

interface UserMenuProps {
	username: IUser['username'];
	userAvatar?: string;
	isLogOuting: boolean;
	onLogOut: () => void;
	onOpenSettings: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
	username,
	userAvatar,
	isLogOuting,
	onLogOut,
	onOpenSettings,
}) => {
	const OPTIONS = [
		{
			id: OPTION_ID.settings,
			icon: ICON_COLLECTION.settings,
			label: 'user_menu.profile_settings',
		},
		{
			id: OPTION_ID.logout,
			icon: ICON_COLLECTION.logout,
			label: 'user_menu.logout',
		},
	] as const;

	const OPTION_COMMANDS = {
		[OPTION_ID.settings]: onOpenSettings,
		[OPTION_ID.logout]: onLogOut,
	};

	const handleSelectOption = (key: Key) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		OPTION_COMMANDS[key]?.();
	};

	const hasDisabled = (key: string): string[] => {
		const keyArray: string[] = [];
		if (key && isLogOuting) {
			keyArray.push(key);
		}
		return keyArray;
	};

	return (
		<>
			<MenuButton
				disabledKeys={hasDisabled(OPTION_ID.logout.toString())}
				className="user-menu-dropdown"
				items={OPTIONS}
				onAction={handleSelectOption}
				placement="bottom start"
				handler={<UserMenuButton userAvatar={userAvatar} username={username} />}
			>
				{({ id, icon, label }) => {
					label = t(label);
					return (
						<Item key={id} textValue={label as string}>
							<DropdownButton
								disabled={id === OPTION_ID.logout && isLogOuting}
								variant="primary_ghost"
								label={label}
								icon={icon}
							/>
						</Item>
					);
				}}
			</MenuButton>
		</>
	);
};
