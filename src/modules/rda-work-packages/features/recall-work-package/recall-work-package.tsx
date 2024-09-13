import React, { useCallback, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import {
	RecallFormData,
	RecallModal,
} from 'modules/rda-work-packages/modals/recall-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import {
	DispositionsApi,
	RecallDispositionsDto,
} from 'app/api/dispositions-api/dispositions-api';

import { ICoreConfig } from 'shared/types/core-config';
import { IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { CORE_CONFIG_LIST_QUERY_KEYS } from 'shared/constants/query-keys';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { Modal } from 'shared/components/modal';
import { Spinner } from 'shared/components/spinner/spinner';

interface RecallWorkPackage {
	onSuccess?: () => Promise<unknown>;
}

export function RecallWorkPackageModal(params: RecallWorkPackage = {}) {
	const { onSuccess } = params;
	const navigate = useNavigate();

	const [list, setList] = useState<IWorkPackage[]>([]);

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.RECALL_DISPOSITION,
		{
			onBeforeOpen: (dispositions: IWorkPackage[]) => {
				setList(dispositions);
			},
		},
	);

	const { data: defaultRecallText, isLoading: isLoadingDefaultRecallText } =
		useQuery({
			queryKey: CORE_CONFIG_LIST_QUERY_KEYS.config_list,
			queryFn: CoreConfigApi.getConfigList,
			select: useCallback((data: ICoreConfig[]) => {
				return data.find(
					(setting) => setting.property === 'rda.General.RecallNotice',
				)?.value;
			}, []),
			enabled: modalState.open,
		});

	const recallDispositionMutation = useMutation({
		mutationFn: async (payload: RecallDispositionsDto) => {
			await DispositionsApi.recallDispositions(payload);
			onSuccess && (await onSuccess());
		},
		onSuccess: () => {
			modalState.close();
			navigate(DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path + `?t=1`);
		},
	});

	const onSubmit = (data: RecallFormData) => {
		const ids = list.map(({ id }) => id);

		recallDispositionMutation.mutate({
			rdaIdsToRecall: ids,
			comment: data.comment,
		});
	};

	const isDataPreparing = isLoadingDefaultRecallText;

	return (
		<Modal.Root
			placement="center"
			fulfilled
			open={modalState.open}
			onClose={modalState.close}
			hasClose={false}
			isClosable={!recallDispositionMutation.isLoading}
			maxWidth="32.9rem"
		>
			{isDataPreparing && <Spinner />}
			<RecallModal
				dispositions={list}
				defaultRecallText={defaultRecallText}
				onSubmit={onSubmit}
				isLoading={recallDispositionMutation.isLoading}
			/>
		</Modal.Root>
	);
}
