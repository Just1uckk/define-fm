import React, { useContext } from 'react';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import {
	Modal,
	ModalContext,
	ModalContextProps,
} from 'shared/components/modal';
import { Spinner } from 'shared/components/spinner/spinner';

import {
	RequestFeedbackForm,
	RequestFeedbackFormDataTypes,
} from '../components/request-feedback-form/request-feedback-form';

interface RequestFeedbackModalProps {
	defaultFeedbackMessage?: string;
	approverUserIds: number[];
	isPreperingData: boolean;
	isLoading: boolean;
	onSubmit: (data: RequestFeedbackFormDataTypes) => void;
}

export const RequestFeedbackModal: React.FC<RequestFeedbackModalProps> = ({
	approverUserIds,
	defaultFeedbackMessage,
	isPreperingData,
	isLoading,
	onSubmit,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);
	const { t } = useTranslation();

	return (
		<Modal.Page
			header={t('disposition.request_feedback_modal.title')}
			subHeader={t('disposition.request_feedback_modal.sub_title')}
		>
			{isPreperingData && <Spinner mt="0.5rem" mb="1.5rem" />}
			{!isPreperingData && (
				<RequestFeedbackForm
					defaultFeedbackMessage={defaultFeedbackMessage}
					approverUserIds={approverUserIds}
					onSubmit={onSubmit}
				>
					<Modal.Footer>
						<ButtonList>
							<Button
								label={t('disposition.request_feedback_modal.actions.submit')}
								loading={isLoading}
							/>
							<Button
								type="button"
								variant="primary_outlined"
								label={t('disposition.request_feedback_modal.actions.cancel')}
								disabled={isLoading}
								onClick={modalContext.onClose}
							/>
						</ButtonList>
					</Modal.Footer>
				</RequestFeedbackForm>
			)}
		</Modal.Page>
	);
};
