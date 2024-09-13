import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import {
	DispositionSearchFormRef,
	SearchFormDataTypes,
} from 'modules/disposition-searches/components/search-form';
import { EditSearchModal } from 'modules/disposition-searches/modals/edit-search-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { DataSyncProviderApi } from 'app/api/data-sync-provider-api/data-sync-provider-api';
import { DispositionActionApi } from 'app/api/disposition-action-api/disposition-action-api';
import {
	DispositionSearcheApi,
	UpdateDispositionSearchDto,
} from 'app/api/disposition-searches-api/disposition-searche-api';
import { DISPOSITION_SEARCHES_API_ERRORS } from 'app/api/disposition-searches-api/disposition-searche-api-error';
import { IValidationApiError } from 'app/api/types';

import { IDispositionSearch } from 'shared/types/disposition-search';

import { DISPOSITION_SEARCH_MODAL_NAMES } from 'shared/constants/modal-names';
import {
	DATA_SYNC_PROVIDES_QUERY_KEYS,
	DISPOSITION_SEARCHES_KEYS,
	DISPOSITIONS_ACTIONS_KEYS,
} from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

interface UpdateSearchProps {
	onUpdated?: () => Promise<unknown>;
	searchAfterEvent: (data: IDispositionSearch) => void;
}

export const UpdateSearch: React.FC<UpdateSearchProps> = ({
	onUpdated,
	searchAfterEvent,
}) => {
	const queryClient = useQueryClient();
	const unsavedModalState = useStateModalManager(
		DISPOSITION_SEARCH_MODAL_NAMES.UNSAVED_CHANGES_EDIT_SEARCH,
	);
	const formRef = React.useRef<DispositionSearchFormRef>();

	const [updatingEntity, setUpdatingEntity] = useState<IDispositionSearch>();

	const modalState = useStateModalManager(
		DISPOSITION_SEARCH_MODAL_NAMES.EDIT_SEARCH,
		{
			onBeforeOpen: (entity: IDispositionSearch) => {
				setUpdatingEntity(entity);
			},
		},
	);

	const providerDataQuery = useQuery({
		queryKey: updatingEntity
			? DATA_SYNC_PROVIDES_QUERY_KEYS.provider(updatingEntity.primaryProviderId)
			: undefined,
		queryFn: () =>
			DataSyncProviderApi.getOne({
				id: updatingEntity?.primaryProviderId as number,
			}),
		enabled: !!updatingEntity,
	});

	const { data: allDispositionActions, isLoading: isActionsLoading } = useQuery(
		DISPOSITIONS_ACTIONS_KEYS.actions,
		DispositionActionApi.getAllActions,
	);

	const updateDispositionSearchMutation = useMutation<
		IDispositionSearch,
		IValidationApiError<DISPOSITION_SEARCHES_API_ERRORS>,
		UpdateDispositionSearchDto
	>({
		mutationFn: async (data) => {
			const newSearch = await DispositionSearcheApi.updateOne(data);
			queryClient.setQueryData(
				DISPOSITION_SEARCHES_KEYS.search(newSearch.id),
				newSearch,
			);

			if (onUpdated) await onUpdated();

			return newSearch;
		},
		onSuccess: () => {
			modalState.close();
		},
	});

	const updateDispositionSearchAndSearchMutation = useMutation<
		IDispositionSearch,
		IValidationApiError<DISPOSITION_SEARCHES_API_ERRORS>,
		UpdateDispositionSearchDto
	>({
		mutationFn: async (data) => {
			const newSearch = await DispositionSearcheApi.updateOne(data);
			queryClient.setQueryData(
				DISPOSITION_SEARCHES_KEYS.search(newSearch.id),
				newSearch,
			);

			if (onUpdated) await onUpdated();

			return newSearch;
		},
		onSuccess: (data: IDispositionSearch) => {
			searchAfterEvent(data);
			modalState.close();
		},
	});

	const onSubmit = (data: SearchFormDataTypes, isSearch: boolean) => {
		if (!updatingEntity) return;

		if (isSearch) {
			updateDispositionSearchAndSearchMutation.mutate({
				id: updatingEntity.id,
				name:
					data.primaryInformation.multilingual.name.en ||
					data.primaryInformation.multilingual.name.fr_CA,
				multilingual: data.primaryInformation.multilingual,
				query: data.primaryInformation.query,
				dispositionActionId: data.actionSettings.action,
				primaryProviderId: data.primaryInformation.primaryProvider.id,
			});
		} else {
			updateDispositionSearchMutation.mutate({
				id: updatingEntity.id,
				name:
					data.primaryInformation.multilingual.name.en ||
					data.primaryInformation.multilingual.name.fr_CA,
				multilingual: data.primaryInformation.multilingual,
				query: data.primaryInformation.query,
				dispositionActionId: data.actionSettings.action,
				primaryProviderId: data.primaryInformation.primaryProvider.id,
			});
		}
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

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			isClosable={
				!updateDispositionSearchMutation.isLoading || isActionsLoading
			}
			onAfterClose={updateDispositionSearchMutation.reset}
			onClose={handleCloseModal}
		>
			<Modal.Page>
				{updatingEntity && (
					<EditSearchModal
						dispositionsData={allDispositionActions || []}
						formRef={formRef as React.Ref<DispositionSearchFormRef>}
						dispositionSearch={updatingEntity}
						initialSearchProvider={providerDataQuery.data}
						isInitialDataPrepering={
							providerDataQuery.isLoading || isActionsLoading
						}
						isLoading={
							updateDispositionSearchMutation.isLoading ||
							updateDispositionSearchAndSearchMutation.isLoading
						}
						error={updateDispositionSearchMutation.error?.message}
						onSubmit={onSubmit}
					/>
				)}
			</Modal.Page>

			<UnsavedChangesModal
				container="parent"
				isUpdating={
					updateDispositionSearchMutation.isLoading || isActionsLoading
				}
				onAccept={onAccept}
				onRegret={onRegret}
				open={unsavedModalState.open}
				onClose={unsavedModalState.close}
			/>
		</Modal.Root>
	);
};
