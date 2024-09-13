import React from 'react';
import { useMutation } from 'react-query';
import jwtDecode from 'jwt-decode';
import { LocalStorageService } from 'shared/services/local-storage-service';

import { AuthApi, LoginDataDto } from 'app/api/auth-api/auth-api';
import { AUTH_API_ERRORS } from 'app/api/auth-api/auth-api-error';
import { ResponseError } from 'app/api/error-entity';

import { setAuthUserData, setIsAuth } from 'app/store/auth/auth-actions';

import { IToken } from 'shared/types/auth';

import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';

import { AuthPageLayout } from '../components/auth-page-layout';

import { LoginForm } from './components/login-form';

const LoginPage: React.FC = () => {
	const { t } = useTranslation();
	useTitle(t('log_in.title'));

	const setIsAuthAction = setIsAuth();
	const setAuthUserDataAction = setAuthUserData();

	const loginMutation = useMutation<string, any, LoginDataDto>(AuthApi.login, {
		onSuccess: async (token) => {
			const userData: IToken = jwtDecode(token);
			LocalStorageService.set('token', token);

			setAuthUserDataAction({ username: userData.sub });
			setIsAuthAction(true);
		},
	});

	const onSubmit = async (data: LoginDataDto) => {
		loginMutation.mutate(data);
	};

	return (
		<AuthPageLayout title={t('log_in.title')} subTitle={t('log_in.sub_title')}>
			<LoginForm
				error={
					loginMutation.error?.response.response.data.message
						? loginMutation.error?.response.response.data.message
						: loginMutation.error?.message
				}
				isLoading={loginMutation.isLoading}
				onSubmit={onSubmit}
			/>
		</AuthPageLayout>
	);
};

export default LoginPage;
