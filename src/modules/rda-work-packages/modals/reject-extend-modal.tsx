import React, { useContext } from 'react';

import { ICoreConfig } from 'shared/types/core-config';
import { IExtensionReason } from 'shared/types/dispositions';

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
	RejectAndExtendFormData,
	RejectExtendForm,
} from '../components/reject-extend-form/reject-extend-form';

interface RejectExtendModalProps {
	reasonList: IExtensionReason[];
	rejectButtonLabel?: string;
	rejectRdaSettings?: {
		reasonSetting?: ICoreConfig;
		commentSetting?: ICoreConfig;
	};
	isPreparingData?: boolean;
	isLoading?: boolean;
	onSubmit: (data?: RejectAndExtendFormData) => void;
}

export const RejectExtendModal: React.FC<RejectExtendModalProps> = ({
	reasonList,
	rejectButtonLabel,
	rejectRdaSettings,
	isPreparingData,
	isLoading,
	onSubmit,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);
	const { t } = useTranslation();

	if (isPreparingData) {
		return (
			<Modal.Page
				header={t('disposition.reject_and_extend_modal.title')}
				subHeader={t('disposition.reject_and_extend_modal.sub_title')}
			>
				<Spinner mt="1rem" mb="1.5rem" />
			</Modal.Page>
		);
	}

	if (
		(!rejectRdaSettings?.reasonSetting?.value ||
			rejectRdaSettings.reasonSetting?.value === 'false') &&
		(!rejectRdaSettings?.commentSetting?.value ||
			rejectRdaSettings.commentSetting?.value === 'false')
	) {
		return (
			<Modal.Page
				header={t('disposition.reject_and_extend_modal.title')}
				subHeader={t('disposition.reject_and_extend_modal.sub_title')}
			>
				<Modal.Footer>
					<ButtonList>
						<Button
							label={
								rejectButtonLabel ||
								t('disposition.reject_and_extend_modal.actions.confirm')
							}
							onClick={() => onSubmit()}
							loading={isLoading}
						/>
						<Button
							type="button"
							variant="primary_outlined"
							label={t('disposition.reject_and_extend_modal.actions.cancel')}
							disabled={isLoading}
							onClick={modalContext.onClose}
						/>
					</ButtonList>
				</Modal.Footer>
			</Modal.Page>
		);
	}

	return (
		<Modal.Page
			header={t('disposition.reject_and_extend_modal.title')}
			subHeader={t('disposition.reject_and_extend_modal.sub_title')}
		>
			<RejectExtendForm
				reasonList={reasonList}
				rejectRdaSettings={rejectRdaSettings}
				onSubmit={onSubmit}
			>
				<Modal.Footer>
					<ButtonList>
						<Button
							label={
								rejectButtonLabel ||
								t('disposition.reject_and_extend_modal.actions.submit')
							}
							loading={isLoading}
						/>
						<Button
							type="button"
							variant="primary_outlined"
							label={t('disposition.reject_and_extend_modal.actions.cancel')}
							disabled={isLoading}
							onClick={modalContext.onClose}
						/>
					</ButtonList>
				</Modal.Footer>
			</RejectExtendForm>
		</Modal.Page>
	);
};
