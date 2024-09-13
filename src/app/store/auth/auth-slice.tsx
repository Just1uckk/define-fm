import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { IUser } from 'shared/types/users';

export type AuthStateSlice = {
	isAuth: boolean;
	userData: Pick<IUser, 'username'> | null;
	setIsAuth: (flag: boolean) => void;
	setUserData: (data: Pick<IUser, 'username'> | null) => void;
	resetState: () => void;
};

export const useAuthState = create<AuthStateSlice>()(
	devtools(
		(set) => ({
			isAuth: false,
			userData: null,

			setIsAuth: (flag) => set(() => ({ isAuth: flag })),
			setUserData: (data) => set(() => ({ userData: data })),
			resetState: () => {
				set(() => ({
					isAuth: false,
					userData: null,
				}));
			},
		}),
		{ name: 'auth-store' },
	),
);
