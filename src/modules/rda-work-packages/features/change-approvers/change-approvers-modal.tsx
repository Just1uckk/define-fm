import React, { useCallback, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ChangeApproversForm } from 'modules/rda-work-packages/components/change-approvers-form';
import { IApproverShort } from 'modules/rda-work-packages/components/select-approvers-form/select-approvers';
import { sortApprovers } from 'modules/rda-work-packages/helpers/sort-approvers';
import { useStateModalManager } from 'shared/context/modal-manager';

import { ApproverApi } from 'app/api/approver-api/approver-api';

import { IApprover } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';
import { Spinner } from 'shared/components/spinner/spinner';

interface UseChangeApproversParams {
	onSuccess?: () => Promise<void>;
}

export const ChangeApproversModal: React.FC<UseChangeApproversParams> = ({
	onSuccess,
}) => {
	const queryClient = useQueryClient();
	const [editableRdaId, setEditableRdaId] = useState<number | null>(null);

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.CHANGE_APPROVERS,
		{
			onBeforeOpen: (id: number) => {
				setEditableRdaId(id);
			},
		},
	);

	const {
		data: approvers = { approvers: [], additionalApprovers: [] },
		isLoading: isApproversLoading,
		isSuccess: isSuccessApprovers,
	} = useQuery({
		queryKey: DISPOSITIONS_QUERY_KEYS.approvers(editableRdaId!),
		queryFn: () =>
			ApproverApi.getRdaApproversById({ id: Number(editableRdaId) }),
		enabled: editableRdaId !== null,
		select: useCallback((approvers) => {
			const sortedApprovers = sortApprovers(approvers);
			const list: {
				approvers: IApprover[];
				additionalApprovers: IApprover[];
			} = {
				approvers: [],
				additionalApprovers: [],
			};

			sortedApprovers.forEach((approver) => {
				if (approver.conditionalApprover) {
					list.additionalApprovers.push(approver);
					return;
				}

				list.approvers.push(approver);
			});

			return list;
		}, []),
	});

	const changeApproversMutation = useMutation(
		async ({
			newApprovers,
			newAdditionalApprovers,
		}: {
			newApprovers: IApproverShort[];
			newAdditionalApprovers: IApproverShort[];
		}) => {
			const oldApprovers = [
				...approvers.approvers,
				...approvers.additionalApprovers,
			];
			const allApproverList = [...newApprovers, ...newAdditionalApprovers];

			for (const idx in oldApprovers) {
				const approver = oldApprovers[idx];
				const deletedUserIdx = allApproverList.findIndex(
					(user) => user.userId === approver.userId,
				);
				const isDeleted = deletedUserIdx < 0;

				if (!isDeleted) continue;

				await ApproverApi.deleteApprover({
					approverId: approver.approverId,
				});
			}

			for (const idx in allApproverList) {
				const approver = allApproverList[idx];
				const oldApprover = oldApprovers.find(
					(_approver) => _approver.userId === approver.userId,
				);
				const isNewApprover = !approver.approverId;
				const isApproverDataChanged =
					oldApprover?.orderBy !== approver.orderBy ||
					oldApprover.conditionalApprover !== approver.conditionalApprover;

				if (isNewApprover) {
					await ApproverApi.createApprover({
						rdaId: editableRdaId!,
						userId: approver.userId,
						orderBy: approver.orderBy,
						conditionalApprover: approver.conditionalApprover,
						assignedDate: new Date(),
					});
					continue;
				}

				if (isApproverDataChanged) {
					await ApproverApi.updateApprover({
						approverId: approver.approverId,
						conditionalApprover: approver.conditionalApprover,
						orderBy: approver.orderBy,
					});
				}
			}

			await queryClient.refetchQueries(
				DISPOSITIONS_QUERY_KEYS.approvers(editableRdaId!),
			);
			if (onSuccess) {
				await onSuccess();
			}
			modalState.close();
		},
	);

	const handleSubmit = async (
		newApprovers: IApproverShort[],
		newAdditionalApprovers: IApproverShort[],
	) => {
		if (editableRdaId === null) return;

		changeApproversMutation.mutate({ newApprovers, newAdditionalApprovers });
	};

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={modalState.close}
		>
			<Modal.Page>
				{isApproversLoading && <Spinner />}

				{isSuccessApprovers && modalState.open && (
					<ChangeApproversForm
						approvers={approvers.approvers}
						additionalApprovers={approvers.additionalApprovers}
						onSubmit={handleSubmit}
						isLoading={changeApproversMutation.isLoading}
					/>
				)}
			</Modal.Page>
		</Modal.Root>
	);
};
