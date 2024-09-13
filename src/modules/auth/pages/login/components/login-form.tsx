import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import * as yup from 'yup';

import { LoginDataDto } from 'app/api/auth-api/auth-api';
import { AUTH_API_ERRORS } from 'app/api/auth-api/auth-api-error';

import { AUTH_ROUTES } from 'shared/constants/routes';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Input } from 'shared/components/input/input';
import { InputPassword } from 'shared/components/input/input-password';
import { Text } from 'shared/components/text/text';

const Form = styled.form`
	display: flex;
	flex-direction: column;
	margin-top: 3rem;
`;

const WrapperController = styled.div`
	&:not(:first-child) {
		margin-top: 1.5rem;
	}
`;

const SubmitButton = styled(Button)`
	margin-top: 1.5rem;
`;

const ForgotPasswordBtn = styled(Link)`
	margin-top: 1.6rem;
	margin-left: auto;
	margin-right: 0.2rem;
	text-decoration: none;
`;

const schema = yup
	.object({
		username: yup
			.string()
			.trim()
			.required('validation_errors.field_is_required'),
		password: yup
			.string()
			.trim()
			.required('validation_errors.field_is_required'),
	})
	.defined();

type LoginFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

interface LoginFormProps {
	isLoading?: boolean;
	error?: AUTH_API_ERRORS;
	onSubmit: (data: LoginDataDto) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
	isLoading,
	error,
	onSubmit,
}) => {
	const { t } = useTranslation();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		defaultValues: {
			username: '',
			password: '',
		},
	});

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<WrapperController>
				<Input
					{...register('username')}
					type="text"
					label={t('log_in.form.username')}
					fulfilled
					error={
						errors?.username?.message
							? t(errors?.username?.message)
							: errors?.username?.message
					}
					autoFocus
					autoComplete="username"
				/>
			</WrapperController>
			<WrapperController>
				<InputPassword
					{...register('password')}
					label={t('log_in.form.password')}
					fulfilled
					error={
						errors?.password?.message
							? t(errors?.password?.message)
							: errors?.password?.message
					}
					autoComplete="password"
				/>
			</WrapperController>

			{error && (
				<Text variant="body_6_error" mt="1rem">
					{t(error)}
				</Text>
			)}

			<ForgotPasswordBtn to={AUTH_ROUTES.FORGOT_PASSWORD.path}>
				<Text variant="body_3_secondary">
					{t('log_in.form.forgot_password')}
				</Text>
			</ForgotPasswordBtn>

			<SubmitButton
				type="submit"
				variant="primary"
				label={t('log_in.form.actions.sign_in')}
				icon={ICON_COLLECTION.chevron_right}
				loading={isLoading}
				alignContent
			/>
		</Form>
	);
};
