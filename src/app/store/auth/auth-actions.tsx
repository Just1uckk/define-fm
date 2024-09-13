/* eslint-disable react-hooks/rules-of-hooks */
import { useAuthState } from './auth-slice';

export const resetAuthState = () => useAuthState((state) => state.resetState);
export const setIsAuth = () => useAuthState((state) => state.setIsAuth);
export const setAuthUserData = () => useAuthState((state) => state.setUserData);
