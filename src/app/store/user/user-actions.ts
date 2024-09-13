/* eslint-disable react-hooks/rules-of-hooks */
import { useUserStore } from './user-slice';

export const getCurrentUserData = () =>
	useUserStore((state) => state.getCurrentUserData);

export const setUser = () => useUserStore((state) => state.setUser);

export const setDefaultSettings = () =>
	useUserStore((state) => state.setDefaultSettings);
