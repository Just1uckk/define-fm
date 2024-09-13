import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { AUTH_ROUTES } from 'shared/constants/routes';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const UserEmail = styled(Title)`
	margin-top: 0.75rem;
	margin-bottom: 0.75rem;
`;

const BackButton = styled(Button)`
	width: 100%;
	margin-top: 3rem;
`;

const NotReceivedEmailWrapper = styled.div`
	display: flex;
	justify-content: center;
	margin-top: 1.5rem;
`;

const HelpButton = styled.button`
	padding: 0 0.1rem;
	color: ${({ theme }) => theme.colors.accent};
	background-color: transparent;
	border: none;
	text-decoration: none;
`;

interface CheckYourEmailProps {
	email: string;
	contactEmail: string;
	isLoading: boolean;
	onResend: () => void;
}

export const CheckYourEmail: React.FC<CheckYourEmailProps> = ({
	email,
	contactEmail,
	isLoading,
	onResend,
}) => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const onBack = () => {
		navigate(AUTH_ROUTES.LOGIN.path, { replace: true });
	};

	return (
		<>
			<UserEmail variant="h4_primary">{email}</UserEmail>
			<Text variant="body_3_secondary_semibold">
				{t('check_your_email.instruction')}
			</Text>
			<BackButton
				variant="primary"
				label={t('check_your_email.actions.back_to_log_in')}
				icon={ICON_COLLECTION.chevron_right}
				onClick={onBack}
				loading={isLoading}
				alignContent
			/>

			<NotReceivedEmailWrapper>
				<Text variant="body_3_secondary">
					{t('check_your_email.did_not_receive_email')}{' '}
					<HelpButton onClick={onResend} disabled={isLoading}>
						{t('check_your_email.actions.resend')}
					</HelpButton>{' '}
					{contactEmail && (
						<>
							{t('check_your_email.or')}{' '}
							<HelpButton as="a" href={`mailto:${contactEmail}`}>
								{t('check_your_email.actions.contact')}
							</HelpButton>
						</>
					)}
				</Text>
			</NotReceivedEmailWrapper>
		</>
	);
};
