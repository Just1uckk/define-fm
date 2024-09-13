import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ReassignApproverFormData } from 'modules/rda-work-packages/components/reassign-approver-form/reassign-approver-form';
import { ReassignApproverModal as ReassignApproverModalContent } from 'modules/rda-work-packages/modals/reassign-approver-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { ApproverApi } from 'app/api/approver-api/approver-api';

import { IApprover, IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { APPROVER_STATES } from 'shared/constants/constans';
import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';

export function ReassignApproverModal() {
	const client = useQueryClient();

	const [dispositionId, setDispositionId] = useState<number | null>(null);
	const [userId, setUserId] = useState<number>();
	const [workPackageApprovers, setWorkPackageApprovers] =
		useState<IApprover[]>();

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.REASSIGN_APPROVER,
		{
			onBeforeOpen: (
				id: IWorkPackage['id'],
				userId: number,
				workPackageApprovers: IApprover[],
			) => {
				setDispositionId(id);
				if (userId) {
					setUserId(userId);
				}
				if (workPackageApprovers) {
					setWorkPackageApprovers(workPackageApprovers);
				}
			},
		},
	);

	const { data: approvers = [] } = useQuery({
		queryKey: DISPOSITIONS_QUERY_KEYS.approvers_reassign(Number(userId)),
		queryFn: () =>
			ApproverApi.findRdaApprovers({
				rdaId: Number(dispositionId),
				state: APPROVER_STATES.ACTIVE,
			}),
		cacheTime: 0,
		enabled: dispositionId !== null,
	});
	const reassignApproverMutation = useMutation({
		mutationFn: async (payload: ReassignApproverFormData) => {
			const promises = payload.oldApprovers.map((approver, idx) => {
				const newApproverUserId = payload.newApprovers[idx]?.id;

				if (!newApproverUserId) return Promise.resolve();

				return ApproverApi.reassignApprover({
					rdaApproverId: approver.approverId,
					userIdToAssign: newApproverUserId,
					comment: payload.comment,
					emailComment: Boolean(payload.emailComments),
				});
			});

			await Promise.all(promises);

			await client.refetchQueries(
				DISPOSITIONS_QUERY_KEYS.approvers(Number(dispositionId)),
			);
			await client.refetchQueries(
				DISPOSITIONS_QUERY_KEYS.approvers_reassign(Number(dispositionId)),
			);
		},
		onSuccess: () => {
			modalState.close();
		},
	});

	const rightApprovers = useMemo(() => {
		if (approvers.length && userId) {
			const findedApprover = approvers.find(
				(element) => element.userId === userId,
			);
			if (findedApprover) {
				return [findedApprover];
			} else {
				return approvers;
			}
		}
		return approvers;
	}, [approvers, userId]);

	const onSubmit = (data: ReassignApproverFormData) => {
		reassignApproverMutation.mutate(data);
	};

	const getExceptions = (approvers: IApprover[]) => {
		if (workPackageApprovers && workPackageApprovers.length) {
			const exceptions = workPackageApprovers.map((element) => element.userId);
			return exceptions;
		}

		return undefined;
	};

	return (
		<Modal.Root
			fulfilled
			open={modalState.open}
			onClose={modalState.close}
			hasClose={false}
			isClosable={!reassignApproverMutation.isLoading}
		>
			<ReassignApproverModalContent
				exceptions={getExceptions(approvers)}
				approvers={rightApprovers}
				isLoading={reassignApproverMutation.isLoading}
				onSubmit={onSubmit}
			/>
		</Modal.Root>
	);
}
