import React, { useContext } from 'react';
import {
	ReassignApproverForm,
	ReassignApproverFormData,
} from 'modules/rda-work-packages/components/reassign-approver-form/reassign-approver-form';

import { IApprover } from 'shared/types/dispositions';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	Modal,
	ModalContext,
	ModalContextProps,
} from 'shared/components/modal';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Text } from 'shared/components/text/text';

interface ReassignApproverModalProps {
	exceptions?: number[];
	approvers: IApprover[];
	isLoading: boolean;
	onSubmit: (data: ReassignApproverFormData) => void;
}

export const ReassignApproverModal: React.FC<ReassignApproverModalProps> = ({
	approvers,
	exceptions,
	isLoading,
	onSubmit,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);
	const { t } = useTranslation();

	return (
		<Modal.Page>
			<ModalNavbar onClose={modalContext.onClose} />
			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					{t('disposition.reassign_approver_modal.title')}
				</HeaderTitle>
				<Text variant="body_2_secondary">
					{t('disposition.reassign_approver_modal.sub_title')}
				</Text>
			</PageHeader>
			<PageBody>
				<ReassignApproverForm
					exceptions={exceptions}
					approvers={approvers}
					onSubmit={onSubmit}
				>
					{({ formState: { isDirty } }) => (
						<ButtonList>
							<Button
								icon={ICON_COLLECTION.chevron_right}
								label={t('disposition.reassign_approver_form.actions.submit')}
								loading={isLoading}
								disabled={!isDirty}
							/>
							<Button
								type="button"
								variant="primary_outlined"
								label={t('disposition.reassign_approver_form.actions.cancel')}
								onClick={() => modalContext.onClose()}
								disabled={isLoading}
							/>
						</ButtonList>
					)}
				</ReassignApproverForm>
			</PageBody>
		</Modal.Page>
	);
};
