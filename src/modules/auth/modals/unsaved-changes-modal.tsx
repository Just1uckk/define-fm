import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Modal, ModalProps } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const StyledModal = styled(Modal.Root)`
	position: absolute;
	background: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(5px);

	.modal_content_wrapper {
		max-width: 25rem;
	}

	.modal__body-content {
		display: flex;
		padding-top: 1.7rem !important;
		text-align: center;
	}
`;

const StyledIcon = styled(Icon)<ThemeProps>`
	color: ${({ theme }) => theme.colors.yellow.style_1};

	svg {
		width: 2.3rem;
		height: auto;
	}
`;

const StyledTitle = styled(Title)`
	margin-top: 1rem;
`;

interface UnsavedChangesModalProps extends ModalProps {
	isUpdating: boolean;
	onAccept: () => void;
	onRegret: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
	isUpdating,
	onAccept,
	onRegret,
	...props
}) => {
	const { t } = useTranslation();

	return (
		<StyledModal
			placement="center"
			container="parent"
			fulfilled
			hasClose={false}
			isClosable={!isUpdating}
			{...props}
		>
			<Modal.Page>
				<StyledIcon icon={ICON_COLLECTION.warning} />
				<StyledTitle variant="h2_primary_semibold">
					{t('profile_settings_form.unsaved_changes_modal.title')}
				</StyledTitle>
				<Text variant="body_1_secondary" mt="1.5rem">
					{t('profile_settings_form.unsaved_changes_modal.description')}
				</Text>
				<Text variant="body_1_primary">
					{t('profile_settings_form.unsaved_changes_modal.agreement_question')}
				</Text>
				<ModalFooter>
					<ButtonList justifyContent="center">
						<Button
							label={t(
								'profile_settings_form.unsaved_changes_modal.actions.save',
							)}
							onClick={onAccept}
							loading={isUpdating}
						/>
						<Button
							variant="primary_outlined"
							label={t(
								'profile_settings_form.unsaved_changes_modal.actions.regret',
							)}
							onClick={onRegret}
							disabled={isUpdating}
						/>
					</ButtonList>
				</ModalFooter>
			</Modal.Page>
		</StyledModal>
	);
};
