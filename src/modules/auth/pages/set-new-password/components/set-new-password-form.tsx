import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import * as yup from 'yup';

import { AUTH_API_ERRORS } from 'app/api/auth-api/auth-api-error';

import i18n from 'app/settings/i18n/i18n';

import { AUTH_ROUTES } from 'shared/constants/routes';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
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

const BackBtnWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 1.6rem;
`;

const BackBtn = styled(Link)`
	text-decoration: none;
`;

const BackBtnIcon = styled(Icon)`
	margin-right: 0.8rem;
`;

const schema = yup
	.object({
		password: yup
			.string()
			.min(8, i18n.t('validation_errors.min_length', { length: 8 }) as string)
			.required('validation_errors.field_is_required'),
		confirmPassword: yup.string().oneOf(
			[yup.ref('password'), undefined],
			i18n.t('validation_errors.field_must_match', {
				field: 'Confirm password',
			}) as string,
		),
	})
	.defined();

export type ForgotPasswordFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

interface ForgotPasswordFormProps {
	isLoading?: boolean;
	error?: AUTH_API_ERRORS;
	onSubmit: (data: ForgotPasswordFormData) => void;
}

export const SetNewPasswordForm: React.FC<ForgotPasswordFormProps> = ({
	isLoading,
	error,
	onSubmit,
}) => {
	const { t, tExists } = useTranslation();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		defaultValues: {
			password: '',
			confirmPassword: '',
		},
	});

	return (
		<>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<WrapperController>
					<InputPassword
						{...register('password')}
						label={t('set_new_password.form.password')}
						fulfilled
						error={
							errors?.password?.message && tExists(errors.password.message)
								? t(errors.password.message)
								: errors?.password?.message
						}
						helpText="Must be at least 8 characters"
						autoFocus
						autoComplete="new-password"
					/>
				</WrapperController>
				<WrapperController>
					<InputPassword
						{...register('confirmPassword')}
						label={t('set_new_password.form.confirm_password')}
						fulfilled
						error={
							errors?.confirmPassword?.message &&
							tExists(errors.confirmPassword.message)
								? t(errors.confirmPassword.message)
								: errors?.confirmPassword?.message
						}
						autoComplete="new-password"
					/>
				</WrapperController>

				{error && (
					<Text variant="body_3_error" mt="1rem">
						{t(error)}
					</Text>
				)}

				<SubmitButton
					type="submit"
					variant="primary"
					label={t('set_new_password.form.actions.submit')}
					icon={ICON_COLLECTION.chevron_right}
					loading={isLoading}
					alignContent
				/>
			</Form>
			<BackBtnWrapper>
				<BackBtn to={AUTH_ROUTES.LOGIN.path}>
					<Text variant="body_3_secondary">
						<BackBtnIcon icon={ICON_COLLECTION.icon_left} />
						{t('set_new_password.form.actions.back_to_login')}
					</Text>
				</BackBtn>
			</BackBtnWrapper>
		</>
	);
};
