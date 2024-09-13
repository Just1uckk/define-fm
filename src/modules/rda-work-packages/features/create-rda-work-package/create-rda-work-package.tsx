import React, { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { keyBy } from 'lodash';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import {
	CreateRdaForm,
	CreateWorkPackageFormRef,
} from 'modules/rda-work-packages/components/create-rda-form/create-rda-form';
import { IApproverShort } from 'modules/rda-work-packages/components/select-approvers-form/select-approvers';
import { useStateModalManager } from 'shared/context/modal-manager';

import { ApproverApi } from 'app/api/approver-api/approver-api';
import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import { DispositionActionApi } from 'app/api/disposition-action-api/disposition-action-api';
import {
	CreateDispositionDto,
	DispositionsApi,
} from 'app/api/dispositions-api/dispositions-api';
import { RdaItemApi } from 'app/api/rda-item-api/rda-item-api';

import { ICoreConfig } from 'shared/types/core-config';
import { IApprover, IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import {
	CORE_CONFIG_LIST_QUERY_KEYS,
	DISPOSITIONS_ACTIONS_KEYS,
	DISPOSITIONS_QUERY_KEYS,
} from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';
import { Spinner } from 'shared/components/spinner/spinner';

interface UseCreateRdaParams {
	onCreated?: () => Promise<unknown>;
}

export function CreateRdaWorkPackageModal({
	onCreated,
}: UseCreateRdaParams = {}) {
	const queryClient = useQueryClient();
	const unsavedModalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.UNSAVED_CHANGES_CREATE_RDA_WORK_PACKAGE,
	);

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.USE_CREATE_RDA_WORK_PACKAGE,
	);

	const formRef = React.useRef<CreateWorkPackageFormRef>();

	const { data: rdaDefaultSettings, isLoading: isRdaDefaultSettingsLoading } =
		useQuery({
			queryKey: CORE_CONFIG_LIST_QUERY_KEYS.config_list,
			queryFn: CoreConfigApi.getConfigList,
			select: useCallback((data: ICoreConfig[]) => {
				const groupedList = keyBy(data, 'property');

				return {
					allowCustomLabels: groupedList['rda.Button.AllowCustomLabels'],
					approveButtonLabel: groupedList['rda.Button.ApproveLabel']?.value,
					rejectButtonLabel: groupedList['rda.Button.RejectLabel']?.value,
					instructions: groupedList['rda.General.ApproverInstructions']?.value,
					daysToComplete: groupedList['rda.General.DaysToComplete'],
					overrideEnabledByDefault:
						groupedList['rda.Security.OverrideEnabledByDefault'],
					allowAutoprocessOfApproved:
						groupedList['rda.Autoprocess.AllowAutoprocessOfApproved'],
					securityOverride: groupedList['core.rda.AllowSecurityOverride'],
				};
			}, []),
		});

	const { data: dispositionTypes = [], isLoading: isDispositionTypesLoading } =
		useQuery(
			DISPOSITIONS_QUERY_KEYS.disposition_types(),
			RdaItemApi.getDispositionTypes,
			{
				enabled: modalState.open,
			},
		);

	const { data: allDispositionActions, isLoading: isActionsLoading } = useQuery(
		DISPOSITIONS_ACTIONS_KEYS.actions,
		DispositionActionApi.getAllActions,
	);

	const createMutation = useMutation({
		mutationFn: async (payload: {
			workPackageData: CreateDispositionDto;
			approvers: IApproverShort[];
			additionalApprovers: IApproverShort[];
		}) => {
			const { workPackageData, approvers, additionalApprovers } = payload;

			const workPackage = await DispositionsApi.createWorkPackage(
				workPackageData,
			);

			await setApprovers({
				workPackageId: workPackage.id,
				approvers,
				additionalApprovers,
			});

			await queryClient.refetchQueries(
				DISPOSITIONS_QUERY_KEYS.disposition_status_counts,
			);

			if (onCreated) {
				await onCreated();
			}
		},
		onSuccess: () => modalState.close(),
	});

	async function setApprovers(data: {
		workPackageId: IWorkPackage['id'];
		approvers: IApproverShort[];
		additionalApprovers: IApproverShort[];
	}) {
		const assignedDate = new Date();
		const promises: Promise<IApprover>[] = [];
		data.approvers.forEach((approver) => {
			promises.push(
				ApproverApi.createApprover({
					userId: approver.userId,
					rdaId: data.workPackageId,
					assignedDate,
					orderBy: approver.orderBy,
					conditionalApprover: approver.conditionalApprover,
				}),
			);
		});
		data.additionalApprovers.forEach((approver) => {
			promises.push(
				ApproverApi.createApprover({
					userId: approver.userId,
					rdaId: data.workPackageId,
					assignedDate,
					orderBy: approver.orderBy,
					conditionalApprover: approver.conditionalApprover,
				}),
			);
		});

		return Promise.all(promises);
	}

	const onSubmitForm = (
		data: CreateDispositionDto,
		approvers: IApproverShort[],
		additionalApprovers: IApproverShort[],
	) => {
		createMutation.mutate({
			workPackageData: data,
			approvers,
			additionalApprovers,
		});
	};

	const onAccept = () => {
		formRef.current?.onSubmit();
		unsavedModalState.close();
	};

	const onRegret = () => {
		modalState.close();
		unsavedModalState.close();
	};

	const handleCloseModal = () => {
		if (formRef.current?.isDirty) {
			unsavedModalState.openModal();
			return;
		}

		modalState.close();
	};

	const isDataPrepering =
		isDispositionTypesLoading || isRdaDefaultSettingsLoading;

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={handleCloseModal}
		>
			<Modal.Page>
				{isDataPrepering && <Spinner />}
				{!isDataPrepering && (
					<CreateRdaForm
						unsavedIsOpen={unsavedModalState.open}
						allDispositionActions={allDispositionActions || []}
						formRef={formRef}
						dispositionTypes={dispositionTypes}
						rdaDefaultSettings={rdaDefaultSettings}
						onSubmit={onSubmitForm}
						onClose={modalState.close}
						isLoading={createMutation.isLoading || isActionsLoading}
					/>
				)}
			</Modal.Page>

			<UnsavedChangesModal
				container="parent"
				isUpdating={createMutation.isLoading}
				onAccept={onAccept}
				onRegret={onRegret}
				open={unsavedModalState.open}
				onClose={unsavedModalState.close}
			/>
		</Modal.Root>
	);
}
