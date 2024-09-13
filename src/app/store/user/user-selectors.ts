/* eslint-disable react-hooks/rules-of-hooks */
import { useUserStore } from './user-slice';

export const selectUserData = () => useUserStore((state) => state.data);

export const selectDefaultSettingsData = () =>
	useUserStore((state) => state.defaultSettings);

export const selectIsGettingUser = () =>
	useUserStore((state) => state.isGettingUser);

export const selectCurrentUserLang = () =>
	useUserStore((state) => state.data?.langCode);
