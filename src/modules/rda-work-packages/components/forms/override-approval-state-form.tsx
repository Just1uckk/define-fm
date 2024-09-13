import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { Item } from 'react-stately';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import * as yup from 'yup';

import { BulkApi, SendRejectedInterface } from 'app/api/bulk-api/bulk-api';
import {
	DispositionsApi,
	RejectAndExtendDto,
	RejectAndExtendOverrideDto,
} from 'app/api/dispositions-api/dispositions-api';

import { IExtensionReason } from 'shared/types/dispositions';

import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { useModalContext } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { PageForm } from 'shared/components/modal-form/page-form';
import { Select } from 'shared/components/select/select';
import { Textarea } from 'shared/components/textarea/textarea';

const OverrideSpan = styled.span`
	margin-top: 1.5rem;
	padding-left: 8px;
`;

interface OverrideApprovalStateInterface {
	selectedItems: any;
	state: string;
	handleClearSelected: () => void;
	refetchRdaItems: () => void;
	onClose: () => void;
}

type useApprovedItems = {
	reason: string;
	comment: string;
	overrideComment: string;
};

type useRejectedItems = {
	comment: string;
};

const approvedSchema = yup
	.object({
		reason: yup.string().required('validation_errors.field_is_required'),
		comment: yup.string().required('validation_errors.field_is_required'),
		overrideComment: yup
			.string()
			.required('validation_errors.field_is_required'),
	})
	.defined();

const rejectedSchema = yup
	.object({
		comment: yup.string().required('validation_errors.field_is_required'),
	})
	.defined();

const resolverApproved = yupResolver(approvedSchema);
const resolverRejected = yupResolver(rejectedSchema);

export const OverrideApprovalStateForm: React.FC<
	OverrideApprovalStateInterface
> = ({
	selectedItems,
	state,
	onClose,
	refetchRdaItems,
	handleClearSelected,
}) => {
	const contextModal = useModalContext();
	const { t } = useTranslation();

	const { data: reasonList = [] } = useQuery(
		DISPOSITIONS_QUERY_KEYS.rda_work_package_extension_reason_list,
		DispositionsApi.getExtensionReasonList,
	);

	const sendApprovedState = useMutation({
		mutationFn: async (data: RejectAndExtendOverrideDto) => {
			await BulkApi.sendRejectedState(data);
			handleClearSelected();
			refetchRdaItems();
			approvedReset();
			onClose();
		},
	});

	const sendRejectedState = useMutation({
		mutationFn: async (data: SendRejectedInterface) => {
			await BulkApi.sendRejectedState(data);
			handleClearSelected();
			refetchRdaItems();
			rejectedReset();
			onClose();
		},
	});

	const convertedReasonList = useMemo(
		() => reasonList.map((reason) => ({ value: reason })),
		[reasonList],
	);

	const {
		formState: { errors: approvedErrors },
		handleSubmit: approvedHandleSubmit,
		watch: approvedWatch,
		setValue: approvedSetValue,
		reset: approvedReset,
	} = useForm<useApprovedItems>({
		resolver: resolverApproved,
	});

	const reason = approvedWatch('reason');
	const commentApproved = approvedWatch('comment');
	const overrideComment = approvedWatch('overrideComment');

	const {
		formState: { errors: rejectedErrors },
		handleSubmit: rejectedHandleSubmit,
		watch: rejectedWatch,
		setValue: rejectedSetValue,
		reset: rejectedReset,
	} = useForm<useRejectedItems>({
		resolver: resolverRejected,
	});

	const commentRejected = rejectedWatch('comment');

	const onSubmit = () => {
		if (state === 'approved') {
			sendApprovedState.mutate({
				reason: reason,
				comment: commentApproved,
				overrideComment: overrideComment,
				rdaItems: Object.keys(selectedItems).map((element) => Number(element)),
			});
		} else if (state === 'rejected') {
			sendRejectedState.mutate({
				overrideComment: commentRejected,
				rdaItems: Object.keys(selectedItems).map((element) => Number(element)),
			});
		}
	};

	return (
		<PageForm
			onSubmit={
				state === 'approved'
					? approvedHandleSubmit(onSubmit)
					: rejectedHandleSubmit(onSubmit)
			}
		>
			{state === 'approved' ? (
				<>
					<FormField>
						<Select<{ value: IExtensionReason }>
							label={t('disposition.reject_and_extend_form.reason')}
							onChange={(data) => {
								approvedSetValue('reason', data?.value || 'Legal Hold', {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
							options={convertedReasonList}
							selectedKey={reason ? reason : undefined}
							error={
								approvedErrors?.reason?.message
									? t(approvedErrors?.reason?.message)
									: approvedErrors?.reason?.message
							}
						>
							{(option) => (
								<Item key={option.value} textValue={option.value}>
									{option.value}
								</Item>
							)}
						</Select>
					</FormField>
					<FormField>
						<Textarea
							error={
								approvedErrors?.comment?.message
									? t(approvedErrors?.comment?.message)
									: approvedErrors?.comment?.message
							}
							onChange={(data) => {
								approvedSetValue('comment', data.target.value, {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
							value={commentApproved}
							label="Comment"
						/>
					</FormField>
					<OverrideSpan>Override</OverrideSpan>
					<FormField>
						<Textarea
							error={
								approvedErrors?.overrideComment?.message
									? t(approvedErrors?.overrideComment?.message)
									: approvedErrors?.overrideComment?.message
							}
							onChange={(data) => {
								approvedSetValue('overrideComment', data.target.value, {
									shouldDirty: true,
									shouldValidate: true,
								});
							}}
							value={overrideComment}
							label="Override Comment"
						/>
					</FormField>
				</>
			) : (
				<FormField>
					<Textarea
						error={
							rejectedErrors?.comment?.message
								? t(rejectedErrors?.comment?.message)
								: rejectedErrors?.comment?.message
						}
						onChange={(data) => {
							rejectedSetValue('comment', data.target.value, {
								shouldDirty: true,
								shouldValidate: true,
							});
						}}
						value={commentRejected}
						label="Override Comment"
					/>
				</FormField>
			)}
			<ModalFooter>
				<ButtonList>
					{state === 'approved' ? (
						<Button
							loading={sendApprovedState.isLoading}
							label={'Reject & Extend'}
						/>
					) : (
						<Button
							loading={sendRejectedState.isLoading}
							label={'Approve For Destruction'}
						/>
					)}
					<Button
						type="button"
						variant="primary_outlined"
						label={'Cancel'}
						onClick={onClose}
					/>
				</ButtonList>
			</ModalFooter>
		</PageForm>
	);
};
