import React, { useEffect, useRef } from 'react';
import { useMutation } from 'react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { AuthApi, SetNewPasswordDto } from 'app/api/auth-api/auth-api';
import { AUTH_API_ERRORS } from 'app/api/auth-api/auth-api-error';
import { ResponseError } from 'app/api/error-entity';

import { AUTH_ROUTES } from 'shared/constants/routes';

import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';

import { AuthPageLayout } from '../components/auth-page-layout';

import {
	ForgotPasswordFormData,
	SetNewPasswordForm,
} from './components/set-new-password-form';

const StyledAuthPageLayout = styled(AuthPageLayout)`
	.auth-layout__sub-title {
		max-width: 18.375rem;
	}
`;

const SetNewPasswordPage: React.FC = () => {
	const { t } = useTranslation();
	useTitle(t('set_new_password.title'));
	const navigate = useNavigate();
	const [search] = useSearchParams();
	const token = useRef('');
	const setNewPasswordMutation = useMutation<
		void,
		ResponseError<AUTH_API_ERRORS>,
		SetNewPasswordDto
	>(AuthApi.setNewPassword, {
		onSuccess: () => {
			navigate(AUTH_ROUTES.LOGIN.path, { replace: true });
		},
	});

	useEffect(() => {
		const tokenQuery = search.get('token');

		if (!tokenQuery) {
			navigate(AUTH_ROUTES.LOGIN.path);
			return;
		}

		token.current = tokenQuery;

		navigate(AUTH_ROUTES.NEW_PASSWORD.path, { replace: true });
	}, []);

	const onSubmitForm = (data: ForgotPasswordFormData) => {
		const tokenValue = token.current;

		if (!tokenValue) return;

		setNewPasswordMutation.mutate({
			token: tokenValue,
			password: data.password,
		});
	};

	return (
		<StyledAuthPageLayout
			title={t('set_new_password.title')}
			subTitle={t('set_new_password.sub_title')}
		>
			<SetNewPasswordForm
				error={setNewPasswordMutation.error?.message}
				onSubmit={onSubmitForm}
			/>
		</StyledAuthPageLayout>
	);
};

export default SetNewPasswordPage;
