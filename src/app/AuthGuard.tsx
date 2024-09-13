import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
	DEFAULT_SETTINGS_LIST,
	findDefaultOption,
} from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';

import { selectIsUserAuth } from 'app/store/auth/auth-selectors';

import { AUTH_ROUTES, DASHBOARD_ROUTES } from 'shared/constants/routes';

import { Spinner } from 'shared/components/spinner/spinner';

import { selectDefaultSettingsData } from './store/user/user-selectors';
import { MAIN_PATH } from './app-routes';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const AuthGuard: React.FC<React.PropsWithChildren> = ({ children }) => {
	const isUserAuth = selectIsUserAuth();
	const location = useLocation();
	const defaultSettings = selectDefaultSettingsData();
	const routerState = location.state as { from?: string };

	const isAuthPage =
		location.pathname === AUTH_ROUTES.LOGIN.path ||
		location.pathname === AUTH_ROUTES.NEW_PASSWORD.path ||
		location.pathname === AUTH_ROUTES.FORGOT_PASSWORD.path;

	if (!isUserAuth && !isAuthPage)
		return (
			<Navigate
				to={AUTH_ROUTES.LOGIN.path}
				state={{ from: location }}
				replace
			/>
		);

	if (isUserAuth && isAuthPage) {
		return (
			<>
				{defaultSettings && defaultSettings.length ? (
					<Navigate
						to={
							MAIN_PATH[
								findDefaultOption(
									defaultSettings,
									DEFAULT_SETTINGS_LIST.HOME_PAGE,
								)!.value
							] || DASHBOARD_ROUTES.MAIN.path
						}
						replace
					/>
				) : (
					<Spinner />
				)}
			</>
		);
	}

	return children;
};
