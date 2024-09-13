import { LocalStorageService } from 'shared/services/local-storage-service';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { UserApi } from 'app/api/user-api/user-api';
import { DefaultSettingsDto } from 'app/api/user-api/user-api-default';

import { useAuthState } from 'app/store/auth/auth-slice';

import i18n from 'app/settings/i18n/i18n';

import { IUser } from 'shared/types/users';

import { LANGUAGE_CODES } from 'shared/constants/constans';

export type UserStateSlice = {
	data: IUser | null;
	defaultSettings: DefaultSettingsDto[];
	isGettingUser: boolean;
	setUser: (data: IUser | null) => void;
	setDefaultSettings: (data: DefaultSettingsDto[]) => void;
	getCurrentUserData: (options?: { silent?: boolean }) => Promise<void>;
};

export const useUserStore = create<UserStateSlice>()(
	devtools(
		(set) => ({
			data: null,
			defaultSettings: [],
			isGettingUser: false,

			setUser: (data) => set(() => ({ data })),
			setDefaultSettings: (defaultSettings) => set(() => ({ defaultSettings })),
			getCurrentUserData: async ({ silent } = {}) => {
				const username = useAuthState.getState().userData
					?.username as IUser['username'];

				if (!silent) {
					set(() => ({ isGettingUser: true }));
				}
				let language = LANGUAGE_CODES.EN;
				const user = await UserApi.getUserByUsername({ username: username });
				const savedLangInLS = LocalStorageService.get('lang');
				if (savedLangInLS) {
					language = savedLangInLS;
				} else {
					if (user) {
						language = user.langCode as LANGUAGE_CODES;
					}
				}
				await i18n.changeLanguage(language);
				LocalStorageService.set('lang', language);

				set(() => ({ data: user, isGettingUser: false }));
			},
		}),
		{ name: 'user-store' },
	),
);
