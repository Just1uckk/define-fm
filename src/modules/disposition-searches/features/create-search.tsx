import React from 'react';
import { useMutation, useQuery } from 'react-query';
import { UnsavedChangesModal } from 'modules/auth/modals/unsaved-changes-modal';
import {
	DispositionSearchFormRef,
	SearchFormDataTypes,
} from 'modules/disposition-searches/components/search-form';
import { CreateSearchModal } from 'modules/disposition-searches/modals/create-search-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { DispositionActionApi } from 'app/api/disposition-action-api/disposition-action-api';
import {
	CreateDispositionSearchDto,
	DispositionSearcheApi,
} from 'app/api/disposition-searches-api/disposition-searche-api';
import { DISPOSITION_SEARCHES_API_ERRORS } from 'app/api/disposition-searches-api/disposition-searche-api-error';
import { IValidationApiError } from 'app/api/types';

import { IDispositionSearch } from 'shared/types/disposition-search';

import { DISPOSITION_SEARCH_MODAL_NAMES } from 'shared/constants/modal-names';
import { DISPOSITIONS_ACTIONS_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

interface CreateSearchProps {
	onCreated: () => Promise<unknown>;
	searchAfterEvent: (data: IDispositionSearch) => void;
}

export const CreateSearch: React.FC<CreateSearchProps> = ({
	onCreated,
	searchAfterEvent,
}) => {
	const modalState = useStateModalManager(
		DISPOSITION_SEARCH_MODAL_NAMES.CREATE_SEARCH,
	);
	const unsavedModalState = useStateModalManager(
		DISPOSITION_SEARCH_MODAL_NAMES.UNSAVED_CHANGES_CREATE_SEARCH,
	);
	const formRef = React.useRef<DispositionSearchFormRef>();

	const { data: allDispositionActions, isLoading: isActionsLoading } = useQuery(
		DISPOSITIONS_ACTIONS_KEYS.actions,
		DispositionActionApi.getAllActions,
	);

	const createDispositionSearchMutation = useMutation<
		IDispositionSearch,
		IValidationApiError<DISPOSITION_SEARCHES_API_ERRORS>,
		CreateDispositionSearchDto
	>({
		mutationFn: async (data) => {
			const newSearch = await DispositionSearcheApi.createOne(data);
			await onCreated();
			return newSearch;
		},
		onSuccess: () => {
			modalState.close();
		},
	});

	const createDispositionSearchAndSearchMutation = useMutation<
		IDispositionSearch,
		IValidationApiError<DISPOSITION_SEARCHES_API_ERRORS>,
		CreateDispositionSearchDto
	>({
		mutationFn: async (data) => {
			const newSearch = await DispositionSearcheApi.createOne(data);
			await onCreated();
			return newSearch;
		},
		onSuccess: (data: IDispositionSearch) => {
			searchAfterEvent(data);
			modalState.close();
		},
	});

	const onSubmit = async (data: SearchFormDataTypes, isSearch: boolean) => {
		if (isSearch) {
			await createDispositionSearchAndSearchMutation.mutate({
				multilingual: data.primaryInformation.multilingual,
				query: data.primaryInformation.query,
				primaryProviderId: data.primaryInformation.primaryProvider.id,
				dispositionActionId: data.actionSettings.action,
			});
		} else {
			await createDispositionSearchMutation.mutate({
				multilingual: data.primaryInformation.multilingual,
				query: data.primaryInformation.query,
				primaryProviderId: data.primaryInformation.primaryProvider.id,
				dispositionActionId: data.actionSettings.action,
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
				!createDispositionSearchMutation.isLoading || !isActionsLoading
			}
			onClose={handleCloseModal}
			onAfterClose={createDispositionSearchMutation.reset}
		>
			<Modal.Page>
				<CreateSearchModal
					dispositionsData={allDispositionActions || []}
					formRef={formRef as React.Ref<DispositionSearchFormRef>}
					isLoading={
						createDispositionSearchMutation.isLoading ||
						createDispositionSearchAndSearchMutation.isLoading
					}
					error={createDispositionSearchMutation.error?.message}
					onSubmit={onSubmit}
				/>
			</Modal.Page>

			<UnsavedChangesModal
				container="parent"
				isUpdating={
					createDispositionSearchMutation.isLoading || isActionsLoading
				}
				onAccept={onAccept}
				onRegret={onRegret}
				open={unsavedModalState.open}
				onClose={unsavedModalState.close}
			/>
		</Modal.Root>
	);
};
