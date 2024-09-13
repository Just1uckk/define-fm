import React, { useMemo } from 'react';
// import styled from 'styled-components';
import { DropResult } from 'react-beautiful-dnd';
import { useFormContext } from 'react-hook-form';
import update from 'immutability-helper';
import { ChangeApproversFormData } from 'modules/rda-work-packages/components/change-approvers-form';
import { CreateRdaFormData } from 'modules/rda-work-packages/components/create-rda-form/create-rda-form';
import { ApproversSection } from 'modules/rda-work-packages/components/select-approvers-form/approvers-section';

import { IApprover } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { APPROVER_STATES } from 'shared/constants/constans';

import { useTranslation } from 'shared/hooks/use-translation';

import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageForm } from 'shared/components/modal-form/page-form';
// import { UserLineRecent } from '../../user-line-recent/user-line-recent';
// import { UserLineRecentList } from '../../user-line-recent/user-line-recent-list';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { SectionTitle } from 'shared/components/modal-form/section-title';
import { Text } from 'shared/components/text/text';

// const LastAddedSection = styled.div`
// 	margin-top: 1.5rem;
// `;

export interface IApproverShort {
	userId: number;
	displayName: string;
	approverId?: number;
	userProfileImage: IUser['profileImage'];
	conditionalApprover: 0 | 1;
	state: APPROVER_STATES;
	orderBy: number;
}

interface SelectApprovesFormProps {
	unsavedIsOpen?: boolean;
	approvers?: IApprover[];
	additionalApprovers?: IApprover[];
	onSubmit: () => void;
}

export const SelectApprovesForm: React.FC<
	React.PropsWithChildren<SelectApprovesFormProps>
> = ({ onSubmit, children, unsavedIsOpen }) => {
	const { t } = useTranslation();

	const { formState, ...methods } = useFormContext<
		CreateRdaFormData | ChangeApproversFormData
	>();

	const selectedApprovers = methods.watch('approvers') || [];
	const selectedAdditionalApprovers =
		methods.watch('additionalApprovers') || [];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit();
	};

	const onSelectApprover = (user: IUser) => {
		const newList: IApproverShort[] = [
			...selectedApprovers,
			{
				userId: user.id,
				displayName: user.display,
				userProfileImage: user.profileImage,
				conditionalApprover: 0,
				state: APPROVER_STATES.WAITING,
				orderBy: selectedApprovers.length + 1,
			},
		];

		methods.setValue('approvers', newList);
	};

	const onDeleteApprover = (id: IApprover['approverId']) => {
		const newList: IApproverShort[] = selectedApprovers.filter(
			(selectedApprover) => selectedApprover.userId !== id,
		);

		const orderedList = newList.map((approver, idx) => ({
			...approver,
			orderBy: idx + 1,
		}));

		methods.setValue('approvers', orderedList);
	};

	const onMoveApprover = (result: DropResult) => {
		if (
			!result.destination ||
			result.source.index === result.destination.index
		) {
			return;
		}

		const approver = selectedApprovers[result.source.index];
		const replacedApprover = selectedApprovers[result.destination.index];

		if (
			replacedApprover?.state === APPROVER_STATES.ACTIVE ||
			replacedApprover?.state === APPROVER_STATES.COMPLETE
		) {
			return;
		}

		methods.setValue(
			'approvers',
			update(selectedApprovers, {
				$splice: [
					[result.source.index, 1],
					[result.destination.index, 0, approver],
				],
				$apply: (list) => {
					return list.map((item, idx) => ({ ...item, orderBy: idx + 1 }));
				},
			}),
		);
	};

	// const onSelectAdditionalApprover = (user: IUser) => {
	// 	const newList: IApproverShort[] = [
	// 		...selectedAdditionalApprovers,
	// 		{
	// 			userId: user.id,
	// 			displayName: user.display,
	// 			userProfileImage: user.profileImage,
	// 			conditionalApprover: 1,
	// 			state: APPROVER_STATES.WAITING,
	// 			orderBy: selectedAdditionalApprovers.length + 1,
	// 		},
	// 	];
	//
	// 	methods.setValue('additionalApprovers', newList);
	// };
	//
	// const onDeleteAdditionalApprover = (id: IApprover['userId']) => {
	// 	const newList: IApproverShort[] = selectedAdditionalApprovers.filter(
	// 		(selectedApprover) => selectedApprover.userId !== id,
	// 	);
	//
	// 	const orderedList = newList.map((approver, idx) => ({
	// 		...approver,
	// 		orderBy: idx + 1,
	// 	}));
	//
	// 	methods.setValue('additionalApprovers', orderedList);
	// };
	//
	// const onMoveAdditionalApprover = (result: DropResult) => {
	// 	if (
	// 		!result.destination ||
	// 		result.source.index === result.destination.index
	// 	) {
	// 		return;
	// 	}
	//
	// 	const approver = selectedAdditionalApprovers[result.source.index];
	// 	const replacedApprover =
	// 		selectedAdditionalApprovers[result.destination.index];
	//
	// 	if (
	// 		replacedApprover?.state === APPROVER_STATES.ACTIVE ||
	// 		replacedApprover?.state === APPROVER_STATES.COMPLETE
	// 	) {
	// 		return;
	// 	}
	//
	// 	methods.setValue(
	// 		'additionalApprovers',
	// 		update(selectedAdditionalApprovers, {
	// 			$splice: [
	// 				[result.source.index, 1],
	// 				[result.destination.index, 0, approver],
	// 			],
	// 			$apply: (list) => {
	// 				return list.map((item, idx) => ({ ...item, orderBy: idx + 1 }));
	// 			},
	// 		}),
	// 	);
	// };

	const selectedApproverIds = useMemo(() => {
		const list: number[] = [];

		selectedApprovers.forEach(({ userId }) => list.push(userId));
		selectedAdditionalApprovers.forEach(({ userId }) => list.push(userId));

		return list;
	}, [selectedApprovers, selectedAdditionalApprovers]);

	return (
		<>
			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					{t('disposition.approvers_modal.title')}
				</HeaderTitle>
				<Text variant="body_2_secondary">
					{t('disposition.approvers_modal.sub_title')}
				</Text>
			</PageHeader>
			<PageBody>
				<PageForm onSubmit={handleSubmit}>
					<FormGroup>
						<SectionTitle variant="body_1_primary_bold">
							{t('disposition.approvers_form.approvers.title')}
						</SectionTitle>
						<ApproversSection
							unsavedIsOpen={unsavedIsOpen}
							droppableId="approvers"
							selectedApproverIds={selectedApproverIds}
							selectedApprovers={selectedApprovers}
							onSelectApprover={onSelectApprover}
							onDeleteApprover={onDeleteApprover}
							onDragEnd={onMoveApprover}
						/>

						{/*TODO: As it isn't implemented on the backend it is hidden*/}
						{/*<LastAddedSection>*/}
						{/*	<Text variant="body_3_primary_semibold">Last added</Text>*/}
						{/*	<UserLineRecentList>*/}
						{/*		<UserLineRecent*/}
						{/*			onAdd={() => {*/}
						{/*				return false;*/}
						{/*			}}*/}
						{/*			label="John Doe"*/}
						{/*		/>*/}
						{/*		<UserLineRecent*/}
						{/*			onAdd={() => {*/}
						{/*				return false;*/}
						{/*			}}*/}
						{/*			label="Johnie Walker"*/}
						{/*		/>*/}
						{/*	</UserLineRecentList>*/}
						{/*</LastAddedSection>*/}
					</FormGroup>
					{/*<FormGroup>*/}
					{/*	<SectionTitle variant="body_1_primary_bold">*/}
					{/*		{t('disposition.approvers_form.conditional_approvers.title')}*/}
					{/*	</SectionTitle>*/}
					{/*	<ApproversSection*/}
					{/*		droppableId="additional-approvers"*/}
					{/*		selectedApproverIds={selectedApproverIds}*/}
					{/*		selectedApprovers={selectedAdditionalApprovers}*/}
					{/*		onSelectApprover={onSelectAdditionalApprover}*/}
					{/*		onDeleteApprover={onDeleteAdditionalApprover}*/}
					{/*		onDragEnd={onMoveAdditionalApprover}*/}
					{/*	/>*/}
					{/*</FormGroup>*/}
					<ModalFooter justifyContent="space-between">{children}</ModalFooter>
				</PageForm>
			</PageBody>
		</>
	);
};
