import React, { useContext } from 'react';
import {
	ChangeSettingsRdaForm,
	RdaSettingsFormDataTypes,
	WorkPackageSettingsFormRef,
} from 'modules/rda-work-packages/components/change-settings-rda-form/change-settings-rda-form';

import { AllDispositionActionsDto } from 'app/api/disposition-action-api/disposition-action-api';

import { ICoreConfig } from 'shared/types/core-config';
import {
	IDispositionSearch,
	IDispositionSearchSnapshot,
} from 'shared/types/disposition-search';
import { IWorkPackage } from 'shared/types/dispositions';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { PageBody } from 'shared/components/modal-form/page-body';
import { Spinner } from 'shared/components/spinner/spinner';

interface RdaSettingsModalProps {
	formRef: React.Ref<WorkPackageSettingsFormRef>;
	workPackage?: IWorkPackage;
	dispositionSearch?: IDispositionSearch;
	dispositionSearchSnapshot?: IDispositionSearchSnapshot;
	allDispositionActions: AllDispositionActionsDto[] | [];
	rdaDefaultSettings?: {
		allowCustomLabels: ICoreConfig;
		allowAutoprocessOfApproved: ICoreConfig;
		securityOverride: ICoreConfig;
	};
	isLoading?: boolean;
	isSubmitting?: boolean;
	onSubmit: (data: RdaSettingsFormDataTypes) => void;
}

export const RdaSettingsModal: React.FC<RdaSettingsModalProps> = ({
	formRef,
	workPackage,
	dispositionSearch,
	dispositionSearchSnapshot,
	rdaDefaultSettings,
	allDispositionActions,
	isLoading,
	isSubmitting,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const modalContext = useContext<ModalContextProps>(ModalContext);

	return (
		<>
			<PageBody>
				{isLoading && <Spinner />}

				{!isLoading && workPackage && (
					<ChangeSettingsRdaForm
						formRef={formRef}
						allDispositionActions={allDispositionActions}
						workPackage={workPackage}
						dispositionSearch={dispositionSearch}
						dispositionSearchSnapshot={dispositionSearchSnapshot}
						allowCustomLabels={
							rdaDefaultSettings?.allowCustomLabels.value === 'true'
						}
						showAutoprocessOfApproved={
							rdaDefaultSettings?.allowAutoprocessOfApproved.value === 'true'
						}
						showSecurityOverride={
							rdaDefaultSettings?.securityOverride.value === 'true'
						}
						onSubmit={onSubmit}
					>
						<ModalFooter>
							<ButtonList>
								<Button
									icon={ICON_COLLECTION.chevron_right}
									label={t(
										'disposition.rda_settings_modal.actions.save_changes',
									)}
									loading={isSubmitting}
								/>
								<Button
									type="button"
									variant="primary_outlined"
									label={t('disposition.rda_settings_modal.actions.cancel')}
									disabled={isSubmitting}
									onClick={modalContext.onClose}
								/>
							</ButtonList>
						</ModalFooter>
					</ChangeSettingsRdaForm>
				)}
			</PageBody>
		</>
	);
};
