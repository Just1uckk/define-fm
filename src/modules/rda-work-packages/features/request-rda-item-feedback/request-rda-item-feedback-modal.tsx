import React, { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { RequestFeedbackFormDataTypes } from 'modules/rda-work-packages/components/request-feedback-form/request-feedback-form';
import { RequestFeedbackModal } from 'modules/rda-work-packages/modals/request-feedback-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { ApproverApi } from 'app/api/approver-api/approver-api';
import {
	DispositionsApi,
	RequestFeedbackDto,
} from 'app/api/dispositions-api/dispositions-api';

import { IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

interface UseRequestFeedbackParams {
	workPackageId?: IWorkPackage['id'];
	requestMeta?: any;
	onSuccess: (
		payload: RequestFeedbackDto,
		requestMeta?: any,
	) => Promise<unknown>;
}

export function RequestRdaItemFeedbackModal(params: UseRequestFeedbackParams) {
	const { workPackageId, requestMeta, onSuccess } = params;

	const queryClient = useQueryClient();

	const [ids, setIds] = useState<Array<string>>([]);
	const [defaultFeedbackMessage, setDefaultFeedbackMessage] = useState<
		string | undefined
	>();

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.USE_REQUEST_FEEDBACK,
		{
			onBeforeOpen: (
				ids: Array<string>,
				defaultFeedbackMessage: string | undefined,
			) => {
				setDefaultFeedbackMessage(defaultFeedbackMessage);
				setIds(ids);
			},
		},
	);

	const { data: approverUserIds = [], isLoading: isApproversLoading } =
		useQuery(
			DISPOSITIONS_QUERY_KEYS.approvers(workPackageId!),
			() => ApproverApi.getRdaApproversById({ id: workPackageId! }),
			{
				select: useCallback(
					(approvers) => approvers.map(({ userId }) => userId),
					[],
				),
				enabled: !!workPackageId,
			},
		);

	const requestFeedbackMutation = useMutation({
		mutationFn: async (payload: RequestFeedbackDto) => {
			const savedRequestMeta = requestMeta
				? JSON.parse(JSON.stringify(requestMeta))
				: requestMeta;

			await DispositionsApi.requestFeedback(payload);
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
		onError: (e) => {
			console.log(e);
		},
	});

	const onSubmit = (data: RequestFeedbackFormDataTypes) => {
		requestFeedbackMutation.mutate({
			state: 3,
			rdaItemApprovals: ids.map(Number),
			comment: data.comment,
			feedbackUsers: data.feedbackUsers.map((user) => user.id),
		});
	};

	return (
		<Modal.Root
			placement="center"
			fulfilled
			{...modalState}
			isClosable={!requestFeedbackMutation.isLoading}
			onClose={modalState.close}
		>
			<RequestFeedbackModal
				defaultFeedbackMessage={defaultFeedbackMessage}
				approverUserIds={approverUserIds}
				isPreperingData={isApproversLoading}
				isLoading={requestFeedbackMutation.isLoading}
				onSubmit={onSubmit}
			/>
		</Modal.Root>
	);
}
