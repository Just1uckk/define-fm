import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import * as yup from 'yup';

import { AUTH_ROUTES } from 'shared/constants/routes';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Input } from 'shared/components/input/input';
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

const BackBtn = styled.button`
	border: none;
	background-color: transparent;
`;

const BackBtnIcon = styled(Icon)`
	margin-right: 0.8rem;
`;

const schema = yup
	.object({
		username: yup
			.string()
			.trim()
			.required('validation_errors.field_is_required'),
	})
	.defined();

export type ForgotPasswordFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

interface ForgotPasswordFormProps {
	isLoading?: boolean;
	onSubmit: (data: ForgotPasswordFormData) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
	isLoading,
	onSubmit,
}) => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		defaultValues: {
			username: '',
		},
	});

	const onGoToLogin = () => {
		navigate(AUTH_ROUTES.LOGIN.path);
	};

	return (
		<>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<WrapperController>
					<Input
						{...register('username')}
						type="text"
						label={t('forgot_password.form.username')}
						fulfilled
						error={
							errors?.username?.message
								? t(errors.username.message)
								: errors?.username?.message
						}
						autoFocus
						autoComplete="username"
					/>
				</WrapperController>

				<SubmitButton
					type="submit"
					variant="primary"
					label={t('forgot_password.form.actions.submit')}
					icon={ICON_COLLECTION.chevron_right}
					loading={isLoading}
					alignContent
				/>
			</Form>
			<BackBtnWrapper>
				<BackBtn onClick={onGoToLogin} disabled={isLoading}>
					<Text variant="body_3_secondary">
						<BackBtnIcon icon={ICON_COLLECTION.icon_left} />{' '}
						{t('forgot_password.form.actions.back_to_login')}
					</Text>
				</BackBtn>
			</BackBtnWrapper>
		</>
	);
};
