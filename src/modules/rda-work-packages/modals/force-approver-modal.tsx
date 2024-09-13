import React, { useContext, useMemo } from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IWorkPackage } from 'shared/types/dispositions';

import { APPROVER_STATES } from 'shared/constants/constans';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ExternalTranslation } from 'shared/components/external-translation';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	Modal,
	ModalContext,
	ModalContextProps,
} from 'shared/components/modal';
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

const WarningText = styled(Text)<ThemeProps>`
	color: ${({ theme }) => theme.colors.yellow.style_1};
	font-style: italic;
`;

const ModalBody = styled.div`
	text-align: center;
`;

interface ForceApproverModalModalProps {
	dispositions: IWorkPackage[];
	isLoading: boolean;
	onAccept: () => void;
}

export const ForceApproverModal: React.FC<ForceApproverModalModalProps> = ({
	dispositions,
	isLoading,
	onAccept,
}) => {
	const { t } = useTranslation();
	const modalContext = useContext<ModalContextProps>(ModalContext);

	const forcedApprover = useMemo(() => {
		if (!dispositions[0]) return undefined;

		const approver = dispositions[0]?.approvers.find(
			(approver) => approver.state === APPROVER_STATES.ACTIVE,
		);

		return approver;
	}, [dispositions]);

	return (
		<Modal.Page>
			<ModalBody>
				<StyledIcon icon={ICON_COLLECTION.warning} />
				<Title variant="h2_primary_semibold" mt="0.8rem">
					{dispositions.length > 1 &&
						t('disposition.force_approver_modal.many_items.title', {
							count: dispositions.length,
						})}
					{dispositions.length === 1 && (
						<>
							{t('disposition.force_approver_modal.single_item.title')}
							<div>
								<ExternalTranslation
									field="name"
									translations={dispositions[0].multilingual}
									fallbackValue={dispositions[0].name}
								/>
							</div>
						</>
					)}
				</Title>
				<WarningText variant="body_1_primary" mt="1.25rem">
					{dispositions.length === 1 &&
						t('disposition.force_approver_modal.single_item.warning_text', {
							username: forcedApprover?.userDisplayName,
						})}
					{dispositions.length > 1 &&
						t('disposition.force_approver_modal.many_items.warning_text')}
				</WarningText>
				<Text variant="body_1_primary" mt="1.25rem">
					{t('disposition.force_approver_modal.description_text')}
				</Text>
				<Text variant="body_1_primary" mt="0.25rem" mb="0.5rem">
					{t('disposition.force_approver_modal.confirm_text')}
				</Text>
			</ModalBody>
			<ModalFooter>
				<ButtonList justifyContent="center">
					<Button
						icon={ICON_COLLECTION.chevron_right}
						label={t('disposition.force_approver_modal.actions.accept')}
						onClick={onAccept}
						loading={isLoading}
					/>
					<Button
						type="button"
						variant="primary_outlined"
						label={t('disposition.force_approver_modal.actions.regret')}
						onClick={modalContext.onClose}
						disabled={isLoading}
					/>
				</ButtonList>
			</ModalFooter>
		</Modal.Page>
	);
};
