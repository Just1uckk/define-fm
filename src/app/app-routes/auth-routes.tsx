import React from 'react';
import loadable from '@loadable/component';
import { AuthGuard } from 'app/AuthGuard';
import { PageSpinner } from 'modules/rda-work-packages/pages/file-info/components/page-spinner';

import { AUTH_ROUTES } from 'shared/constants/routes';

const LoginPage = loadable(() => import('modules/auth/pages/login/login'));
const ForgotPasswordPage = loadable(
	() => import('modules/auth/pages/forgot-password/forgot-password'),
);
const SetNewPasswordPage = loadable(
	() => import('modules/auth/pages/set-new-password/set-new-password'),
);

export const authRoutes = [
	{
		path: AUTH_ROUTES.LOGIN.path,
		element: (
			<AuthGuard>
				<React.Suspense fallback={<PageSpinner />}>
					<LoginPage />
				</React.Suspense>
			</AuthGuard>
		),
	},
	{
		path: AUTH_ROUTES.FORGOT_PASSWORD.path,
		element: (
			<AuthGuard>
				<React.Suspense fallback={<PageSpinner />}>
					<ForgotPasswordPage />
				</React.Suspense>
			</AuthGuard>
		),
	},
	{
		path: AUTH_ROUTES.NEW_PASSWORD.path,
		element: (
			<AuthGuard>
				<React.Suspense fallback={<PageSpinner />}>
					<SetNewPasswordPage />
				</React.Suspense>
			</AuthGuard>
		),
	},
];
