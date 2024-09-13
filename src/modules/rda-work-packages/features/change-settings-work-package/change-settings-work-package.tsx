import React, { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { keyBy } from 'lodash';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import {
	RdaSettingsFormDataTypes,
	WorkPackageSettingsFormRef,
} from 'modules/rda-work-packages/components/change-settings-rda-form/change-settings-rda-form';
import { RdaSettingsModal } from 'modules/rda-work-packages/modals/rda-settings-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import { DispositionActionApi } from 'app/api/disposition-action-api/disposition-action-api';
import { DispositionSearcheApi } from 'app/api/disposition-searches-api/disposition-searche-api';
import { DispositionsApi } from 'app/api/dispositions-api/dispositions-api';

import { ICoreConfig } from 'shared/types/core-config';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import {
	CORE_CONFIG_LIST_QUERY_KEYS,
	DISPOSITION_SEARCHES_KEYS,
	DISPOSITIONS_ACTIONS_KEYS,
	DISPOSITIONS_QUERY_KEYS,
} from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

export function ChangeSettingsWorkPackageModal() {
	const queryClient = useQueryClient();
	const formRef = React.useRef<WorkPackageSettingsFormRef>();

	const [editableRdaId, setEditableDispositionId] = useState<number | null>(
		null,
	);

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.SETTINGS_RDA,
		{
			onBeforeOpen: (id: number) => {
				setEditableDispositionId(id);
			},
		},
	);
	const unsavedModalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.UNSAVED_CHANGES_SETTINGS_RDA,
	);

	const { data: workPackage, isLoading: isWorkPackageLoading } = useQuery(
		DISPOSITIONS_QUERY_KEYS.disposition(editableRdaId!),
		() => DispositionsApi.getDisposition({ id: Number(editableRdaId) }),
		{
			enabled: editableRdaId !== null,
		},
	);

	const { data: dispositionSearch, isLoading: isDispositionSearchLoading } =
		useQuery(
			DISPOSITION_SEARCHES_KEYS.search(workPackage?.dispNodeId as number),
			{
				queryFn: () =>
					DispositionSearcheApi.getOne({
						id: workPackage?.dispNodeId as number,
					}),
				enabled: !!workPackage,
			},
		);

	const { data: allDispositionActions, isLoading: isActionsLoading } = useQuery(
		DISPOSITIONS_ACTIONS_KEYS.actions,
		DispositionActionApi.getAllActions,
	);

	const {
		data: dispositionSearchSnapshot,
		isLoading: isDispositionSearchSnapshotLoading,
	} = useQuery(
		[DISPOSITIONS_QUERY_KEYS.disposition_snapshot, workPackage?.id],
		{
			queryFn: () =>
				DispositionsApi.getDispositionSnapshot({
					id: workPackage?.id as number,
				}),
			enabled: !!workPackage,
		},
	);

	const { data: rdaDefaultSettings, isLoading: isRdaDefaultSettingsLoading } =
		useQuery({
			queryKey: CORE_CONFIG_LIST_QUERY_KEYS.config_list,
			queryFn: CoreConfigApi.getConfigList,
			enabled: editableRdaId !== null,
			select: useCallback((data: ICoreConfig[]) => {
				const groupedList = keyBy(data, 'property');

				return {
					allowCustomLabels: groupedList['rda.Button.AllowCustomLabels'],
					allowAutoprocessOfApproved:
						groupedList['rda.Autoprocess.AllowAutoprocessOfApproved'],
					securityOverride: groupedList['core.rda.AllowSecurityOverride'],
				};
			}, []),
		});

	const changeSettingsMutation = useMutation(
		DispositionsApi.updateDisposition,
		{
			onSuccess: (disposition) => {
				queryClient.setQueryData(
					DISPOSITIONS_QUERY_KEYS.disposition(disposition.id),
					disposition,
				);

				modalState.close();
			},
		},
	);

	const onSubmitForm = (data: RdaSettingsFormDataTypes) => {
		if (editableRdaId === null) return;
		const body: any = { ...data };
		body.primaryInformation.dispositionActionId = body.dispositionAction;
		delete body.dispositionAction;

		changeSettingsMutation.mutate({
			id: editableRdaId,
			...body.primaryInformation,
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

	const isDataLoading =
		isWorkPackageLoading ||
		isRdaDefaultSettingsLoading ||
		isDispositionSearchLoading ||
		isDispositionSearchSnapshotLoading ||
		isRdaDefaultSettingsLoading;

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			{...modalState}
			onClose={handleCloseModal}
		>
			<Modal.Page>
				<RdaSettingsModal
					allDispositionActions={allDispositionActions || []}
					formRef={formRef as React.Ref<WorkPackageSettingsFormRef>}
					workPackage={workPackage}
					dispositionSearch={dispositionSearch}
					dispositionSearchSnapshot={dispositionSearchSnapshot}
					rdaDefaultSettings={rdaDefaultSettings}
					isLoading={isDataLoading || isActionsLoading}
					isSubmitting={changeSettingsMutation.isLoading}
					onSubmit={onSubmitForm}
				/>
			</Modal.Page>

			<UnsavedChangesModal
				container="parent"
				isUpdating={changeSettingsMutation.isLoading}
				onAccept={onAccept}
				onRegret={onRegret}
				open={unsavedModalState.open}
				onClose={unsavedModalState.close}
			/>
		</Modal.Root>
	);
}
