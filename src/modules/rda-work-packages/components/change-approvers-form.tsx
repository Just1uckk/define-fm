import React, { useContext, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
	IApproverShort,
	SelectApprovesForm,
} from 'modules/rda-work-packages/components/select-approvers-form/select-approvers';
import * as yup from 'yup';

import { IApprover } from 'shared/types/dispositions';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalContext, ModalContextProps } from 'shared/components/modal';

const schema = yup
	.object({
		approvers: yup.array(),
		additionalApprovers: yup.array(),
	})
	.defined();

export type ChangeApproversFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

interface ChangeApproversFormProps {
	approvers: IApprover[];
	additionalApprovers: IApprover[];
	onSubmit: (
		approvers: IApproverShort[],
		additionalApprovers: IApproverShort[],
	) => void;
	isLoading: boolean;
}

export const ChangeApproversForm: React.FC<ChangeApproversFormProps> = ({
	approvers,
	additionalApprovers,
	onSubmit,
	isLoading,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);
	const { t } = useTranslation();

	const formData = useForm<ChangeApproversFormData>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
	});

	useEffect(() => {
		formData.setValue(
			'additionalApprovers',
			additionalApprovers.map((approver) => ({
				userId: approver.userId,
				displayName: approver.userDisplayName,
				approverId: approver.approverId,
				orderBy: approver.orderBy,
				state: approver.state,
				conditionalApprover: approver.conditionalApprover,
			})),
		);
	}, [additionalApprovers]);

	useEffect(() => {
		formData.setValue(
			'approvers',
			approvers.map((approver) => ({
				userId: approver.userId,
				displayName: approver.userDisplayName,
				approverId: approver.approverId,
				userProfileImage: approver.userProfileImage,
				orderBy: approver.orderBy,
				state: approver.state,
				conditionalApprover: approver.conditionalApprover,
			})),
		);
	}, [approvers]);

	const handleSubmit = () => {
		const data = formData.getValues();

		onSubmit(
			data.approvers as IApproverShort[],
			data.additionalApprovers as IApproverShort[],
		);
	};

	return (
		<FormProvider {...formData}>
			<SelectApprovesForm onSubmit={handleSubmit}>
				<ButtonList>
					<Button
						icon={ICON_COLLECTION.chevron_right}
						label={t('disposition.select_approvers_modal.actions.save')}
						loading={isLoading}
					/>
					<Button
						type="button"
						variant="primary_outlined"
						label={t('disposition.select_approvers_modal.actions.cancel')}
						disabled={isLoading}
						onClick={modalContext.onClose}
					/>
				</ButtonList>
			</SelectApprovesForm>
		</FormProvider>
	);
};
