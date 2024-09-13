/* eslint-disable react-hooks/rules-of-hooks */
import { useAuthState } from './auth-slice';

export const selectAuthUsername = () =>
	useAuthState((state) => state.userData?.username);

export const selectIsUserAuth = () => useAuthState((state) => state.isAuth);
