import React, { useMemo } from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Modal, ModalProps } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const StyledModal = styled(Modal.Root)`
	.modal_content_wrapper {
		max-width: 25rem;
	}
`;

const StyledIcon = styled(Icon)<ThemeProps>`
	margin-top: 1.875rem;
	color: ${({ theme }) => theme.colors.red.style_1};

	svg {
		width: 2.3rem;
		height: auto;
	}
`;

const ModalBody = styled.div`
	text-align: center;
`;

interface ConfirmUserDeletingModalProps extends ModalProps {
	users: IUser[];
	isLoading: boolean;
	onAccept: () => void;
	onRegret: () => void;
}

export const ConfirmUserDeletingModal: React.FC<
	ConfirmUserDeletingModalProps
> = ({ users, isLoading, onAccept, onRegret, ...props }) => {
	const { t, currentLang } = useTranslation();

	const title = useMemo(() => {
		return t('users.delete_user_modal.confirm_text.username', {
			count: users.length,
			username: users[0]?.display,
		});
	}, [users, currentLang]);

	return (
		<StyledModal
			placement="center"
			fulfilled
			hasClose={false}
			isClosable={!isLoading}
			{...props}
		>
			<Modal.Page>
				<ModalBody>
					<StyledIcon icon={ICON_COLLECTION.x_octagon} />
					<Title variant="h2_primary_semibold" mt="0.8rem">
						{t('users.delete_user_modal.title')}
					</Title>
					<Text variant="body_1_primary" mt="1.5rem" p="0 2.7rem">
						{t('users.delete_user_modal.confirm_text.before_username')}{' '}
						<Text tag="span" variant="body_1_secondary">
							{title}
						</Text>{' '}
						{t('users.delete_user_modal.confirm_text.after_username', {
							count: users.length,
						})}
					</Text>
					<Text variant="body_1_primary">
						{t('users.delete_user_modal.warning_text')}
					</Text>
				</ModalBody>
				<ModalFooter>
					<ButtonList justifyContent="center">
						<Button
							type="button"
							variant="primary_outlined"
							label={t('users.delete_user_modal.actions.cancel')}
							onClick={onRegret}
							disabled={isLoading}
						/>
						<Button
							icon={ICON_COLLECTION.delete}
							label={t('users.delete_user_modal.actions.accept')}
							onClick={onAccept}
							loading={isLoading}
						/>
					</ButtonList>
				</ModalFooter>
			</Modal.Page>
		</StyledModal>
	);
};
