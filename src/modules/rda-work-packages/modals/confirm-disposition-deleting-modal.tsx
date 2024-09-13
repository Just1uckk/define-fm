import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IWorkPackage } from 'shared/types/dispositions';

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

interface ConfirmDispositionDeletingModalProps extends ModalProps {
	dispositions: IWorkPackage[];
	isLoading: boolean;
	onAccept: () => void;
	onRegret: () => void;
}

export const ConfirmDispositionDeletingModal: React.FC<
	ConfirmDispositionDeletingModalProps
> = ({ dispositions, isLoading, onAccept, onRegret, ...props }) => {
	const { t, currentLang } = useTranslation();

	const title = t(
		'disposition_search_snapshots.delete_modal.confirm_text.name',
		{
			count: dispositions?.length,
			name:
				dispositions[0]?.multilingual?.name[currentLang] ??
				dispositions[0]?.name,
		},
	);

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
						{t('disposition.delete_disposition_modal.title')}
					</Title>
					<Text variant="body_1_primary" mt="1.5rem" p="0 2.7rem">
						{t('disposition.delete_disposition_modal.confirm_text.before_name')}{' '}
						<Text tag="span" variant="body_1_secondary">
							{title}
						</Text>{' '}
						{t('disposition.delete_disposition_modal.confirm_text.after_name', {
							count: dispositions?.length,
						})}
					</Text>
					<Text variant="body_1_primary">
						{t('disposition.delete_disposition_modal.warning_text')}
					</Text>
				</ModalBody>
				<ModalFooter>
					<ButtonList justifyContent="center">
						<Button
							type="button"
							variant="primary_outlined"
							label={t('disposition.delete_disposition_modal.actions.cancel')}
							onClick={onRegret}
							disabled={isLoading}
						/>
						<Button
							icon={ICON_COLLECTION.delete}
							label={t('disposition.delete_disposition_modal.actions.accept')}
							onClick={onAccept}
							loading={isLoading}
						/>
					</ButtonList>
				</ModalFooter>
			</Modal.Page>
		</StyledModal>
	);
};
