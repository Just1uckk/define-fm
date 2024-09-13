import React from 'react';
import { useMutation } from 'react-query';

import { AuthApi, ForgotPasswordDataDto } from 'app/api/auth-api/auth-api';
import { AUTH_API_ERRORS } from 'app/api/auth-api/auth-api-error';
import { ResponseError } from 'app/api/error-entity';

import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';

import { Text } from 'shared/components/text/text';

import { AuthPageLayout } from '../components/auth-page-layout';

import { CheckYourEmail } from './components/check-your-email';
import {
	ForgotPasswordForm,
	ForgotPasswordFormData,
} from './components/forgot-password-form';

const ForgotPasswordPage: React.FC = () => {
	const { t } = useTranslation();
	useTitle(t('forgot_password.title'));
	const forgotPasswordMutation = useMutation<
		string,
		ResponseError<AUTH_API_ERRORS>,
		ForgotPasswordDataDto
	>(AuthApi.forgotPassword);
	const resendForgotPasswordMutation = useMutation<
		string,
		ResponseError<AUTH_API_ERRORS>,
		ForgotPasswordDataDto
	>(AuthApi.forgotPassword);

	const onSubmit = async (data: ForgotPasswordFormData) => {
		forgotPasswordMutation.mutate({ usernameOrEmail: data.username });
	};

	const onResend = () => {
		if (!forgotPasswordMutation.variables) return;

		resendForgotPasswordMutation.mutate(forgotPasswordMutation.variables);
	};

	const isRequestSent = forgotPasswordMutation.isSuccess;

	return (
		<AuthPageLayout
			title={
				isRequestSent ? t('check_your_email.title') : t('forgot_password.title')
			}
			subTitle={
				isRequestSent
					? t('check_your_email.sub_title')
					: t('forgot_password.sub_title')
			}
		>
			{!isRequestSent && (
				<ForgotPasswordForm
					isLoading={forgotPasswordMutation.isLoading}
					onSubmit={onSubmit}
				/>
			)}
			{isRequestSent && (
				<CheckYourEmail
					email={forgotPasswordMutation.variables?.usernameOrEmail ?? ''}
					contactEmail={forgotPasswordMutation.data}
					isLoading={resendForgotPasswordMutation.isLoading}
					onResend={onResend}
				/>
			)}
			<Text variant="body_6_error">
				{forgotPasswordMutation.error && forgotPasswordMutation.error.message}
			</Text>
		</AuthPageLayout>
	);
};

export default ForgotPasswordPage;
