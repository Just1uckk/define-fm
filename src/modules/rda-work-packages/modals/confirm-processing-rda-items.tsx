import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { useModalContext } from 'shared/components/modal';
import { ModalBody } from 'shared/components/modal/modal-body';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const StyledIcon = styled(Icon)<ThemeProps>`
	margin-top: 1.875rem;
	color: ${({ theme }) => theme.colors.yellow.style_1};

	svg {
		width: 2.3rem;
		height: auto;
	}
`;

const StyledModalBody = styled(ModalBody)`
	text-align: center;
`;

interface ConfirmProcessingRdaItemsModalProps {
	count: number | null;
	isLoading: boolean;
	onAccept: () => void;
}

export const ConfirmProcessingRdaItemsModal: React.FC<
	ConfirmProcessingRdaItemsModalProps
> = ({ count, isLoading, onAccept }) => {
	const { t } = useTranslation();
	const modalContext = useModalContext();

	const title =
		count === null
			? t('disposition_report.process_rda_items_modal.desc.all_items')
			: t('disposition_report.process_rda_items_modal.desc.selected_items', {
					count,
			  });

	return (
		<>
			<StyledModalBody>
				<StyledIcon icon={ICON_COLLECTION.warning} />
				<Title variant="h2_primary_semibold" mt="0.8rem">
					{t('disposition_report.process_rda_items_modal.title')}
				</Title>
				<Text variant="body_1_primary" mt="1.5rem" p="0 2.7rem">
					{title}
				</Text>
			</StyledModalBody>
			<ModalFooter>
				<ButtonList justifyContent="center">
					<Button
						type="button"
						variant="primary_outlined"
						label={t(
							'disposition_report.process_rda_items_modal.actions.cancel',
						)}
						onClick={modalContext.onClose}
						disabled={isLoading}
					/>
					<Button
						icon={ICON_COLLECTION.chevron_right}
						label={t(
							'disposition_report.process_rda_items_modal.actions.process',
						)}
						onClick={onAccept}
						loading={isLoading}
					/>
				</ButtonList>
			</ModalFooter>
		</>
	);
};
