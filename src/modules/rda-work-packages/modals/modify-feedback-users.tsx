import React, { useContext } from 'react';

import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import {
	Modal,
	ModalContext,
	ModalContextProps,
} from 'shared/components/modal';
import { Spinner } from 'shared/components/spinner/spinner';

import { ModifyFeedbackForm } from '../components/modify-feedback-users-form/modify-feedback-form';
import {
	RequestFeedbackForm,
	RequestFeedbackFormDataTypes,
} from '../components/request-feedback-form/request-feedback-form';

interface ModifyFeedbackUsersProps {
	defaultUsers?: IUser[];
	defaultFeedbackMessage?: string;
	approverUserIds: number[];
	isPreperingData: boolean;
	isLoading: boolean;
	onSubmit: (data: RequestFeedbackFormDataTypes) => void;
}

export const ModifyFeedbackUsersModal: React.FC<ModifyFeedbackUsersProps> = ({
	approverUserIds,
	defaultUsers,
	defaultFeedbackMessage,
	isPreperingData,
	isLoading,
	onSubmit,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);
	const { t } = useTranslation();
	return (
		<Modal.Page
			header={t('disposition.modify_feedback_modal.title')}
			subHeader={t('disposition.modify_feedback_modal.sub_title')}
			subSubHeader={t('disposition.modify_feedback_modal.sub_sub_title')}
		>
			{isPreperingData && <Spinner mt="0.5rem" mb="1.5rem" />}
			{!isPreperingData && (
				<ModifyFeedbackForm
					defaultFeedbackMessage={defaultFeedbackMessage}
					defaultUsers={defaultUsers}
					approverUserIds={approverUserIds}
					onSubmit={onSubmit}
				>
					<Modal.Footer>
						<ButtonList>
							<Button
								label={t('disposition.modify_feedback_modal.actions.submit')}
								loading={isLoading}
							/>
							<Button
								type="button"
								variant="primary_outlined"
								label={t('disposition.modify_feedback_modal.actions.cancel')}
								disabled={isLoading}
								onClick={modalContext.onClose}
							/>
						</ButtonList>
					</Modal.Footer>
				</ModifyFeedbackForm>
			)}
		</Modal.Page>
	);
};
