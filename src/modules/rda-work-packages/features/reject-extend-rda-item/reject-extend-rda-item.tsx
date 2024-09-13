import React, { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { RejectAndExtendFormData } from 'modules/rda-work-packages/components/reject-extend-form/reject-extend-form';
import { RejectExtendModal } from 'modules/rda-work-packages/modals/reject-extend-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import {
	DispositionsApi,
	RejectAndExtendDto,
} from 'app/api/dispositions-api/dispositions-api';

import { ICoreConfig } from 'shared/types/core-config';
import { IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import {
	CORE_CONFIG_LIST_QUERY_KEYS,
	DISPOSITIONS_QUERY_KEYS,
} from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

interface UseRejectExtendParams {
	workPackageId?: IWorkPackage['id'];
	rejectButtonLabel?: string;
	requestMeta?: any;
	onSuccess: (
		payload: RejectAndExtendDto,
		requestMeta?: any,
	) => Promise<unknown>;
}

export function RejectExtendRdaItem(params: UseRejectExtendParams) {
	const { workPackageId, rejectButtonLabel, requestMeta, onSuccess } = params;

	const queryClient = useQueryClient();

	const [ids, setIds] = useState<Array<string>>([]);

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.USE_REJECT_EXTEND,
		{
			onBeforeOpen: (ids: Array<string>) => {
				setIds(ids);
			},
		},
	);

	const { data: reasonList = [], isLoading: isLoadingReasonList } = useQuery(
		DISPOSITIONS_QUERY_KEYS.rda_work_package_extension_reason_list,
		DispositionsApi.getExtensionReasonList,
	);

	const { data: rejectRdaSettings, isLoading: isLoadingRejectRdaSettings } =
		useQuery({
			queryKey: CORE_CONFIG_LIST_QUERY_KEYS.config_list,
			queryFn: CoreConfigApi.getConfigList,
			select: useCallback((data: ICoreConfig[]) => {
				const reasonSetting = data.find(
					(setting) =>
						setting.property === 'rda.Extension.ReasonMandatory' &&
						setting.section === 'rda.Extension',
				);
				const commentSetting = data.find(
					(setting) =>
						setting.property === 'rda.Extension.CommentMandatory' &&
						setting.section === 'rda.Extension',
				);

				return {
					reasonSetting,
					commentSetting,
				};
			}, []),
		});

	const rejectAndExtendMutation = useMutation({
		mutationFn: async (payload: RejectAndExtendDto) => {
			const savedRequestMeta = requestMeta
				? JSON.parse(JSON.stringify(requestMeta))
				: requestMeta;

			await DispositionsApi.rejectAndExtend(payload);
			await onSuccess(payload, savedRequestMeta);

			if (workPackageId) {
				await queryClient.refetchQueries(
					DISPOSITIONS_QUERY_KEYS.disposition(workPackageId),
				);
			}
		},
		onSuccess: () => {
			modalState.close();
		},
	});

	const onSubmit = (data?: RejectAndExtendFormData) => {
		if (!data) {
			rejectAndExtendMutation.mutate({
				state: 2,
				rdaItemApprovals: Object.keys(ids).map(Number),
			});

			return;
		}

		rejectAndExtendMutation.mutate({
			reason: data.reason,
			comment: data.comment,
			state: 2,
			rdaItemApprovals: ids.map(Number),
		});
	};

	const isPreparingData = isLoadingReasonList || isLoadingRejectRdaSettings;

	return (
		<Modal.Root
			placement="center"
			fulfilled
			open={modalState.open}
			onClose={modalState.close}
			isClosable={!rejectAndExtendMutation.isLoading}
		>
			<RejectExtendModal
				reasonList={reasonList}
				rejectButtonLabel={rejectButtonLabel}
				rejectRdaSettings={rejectRdaSettings}
				isPreparingData={isPreparingData}
				isLoading={rejectAndExtendMutation.isLoading}
				onSubmit={onSubmit}
			/>
		</Modal.Root>
	);
}
