import React, { useEffect, useMemo } from 'react';
import { FormState, useForm } from 'react-hook-form';
import { Item } from 'react-stately';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { IApprover } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { UserSearchInput } from 'shared/components/input/user-search-input';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FieldToggle } from 'shared/components/modal-form/field-toggle';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { PageForm } from 'shared/components/modal-form/page-form';
import { SectionTitle } from 'shared/components/modal-form/section-title';
import { Select } from 'shared/components/select/select';
import { Text } from 'shared/components/text/text';
import { Textarea } from 'shared/components/textarea/textarea';
import { UserLine } from 'shared/components/user-line/user-line';
import { UserLineList } from 'shared/components/user-line/user-line-list';

const schema = yup
	.object({
		oldApprovers: yup
			.array<IApprover>(yup.object())
			.required('validation_errors.field_is_required'),
		newApprovers: yup
			.array<IUser>(yup.object())
			.required('validation_errors.field_is_required'),
		comment: yup.string().trim(),
		emailComments: yup.boolean(),
	})
	.defined();

export type ReassignApproverFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

interface ReassignApproverFormProps {
	exceptions?: number[];
	approvers: IApprover[];
	onSubmit: (data: ReassignApproverFormData) => void;
	children: (props: {
		formState: FormState<ReassignApproverFormData>;
	}) => React.ReactNode;
}

export const ReassignApproverForm: React.FC<ReassignApproverFormProps> = ({
	approvers,
	exceptions,
	onSubmit,
	children,
}) => {
	const { t } = useTranslation();

	const { register, setValue, handleSubmit, formState, watch } =
		useForm<ReassignApproverFormData>({
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			resolver: resolver,
			defaultValues: {
				emailComments: true,
			},
		});

	const selectedOldApprovers = watch('oldApprovers') || [];
	const selectedNewApprovers = watch('newApprovers') || [];
	const emailComments = watch('emailComments');

	useEffect(() => {
		if (approvers.length === 1) {
			setValue('oldApprovers', [...approvers], {
				shouldValidate: true,
				shouldDirty: true,
			});
		}
	}, [approvers]);

	const onSelectOldApprover = (approver: IApprover | null) => {
		if (!approver) return;

		setValue('oldApprovers', [...selectedOldApprovers, approver], {
			shouldValidate: true,
			shouldDirty: true,
		});
	};
	const onSelectNewApprover = (user: IUser) => {
		setValue('newApprovers', [...selectedNewApprovers, user], {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const onDeleteOldApprover = (id: IUser['id']) => () => {
		const newList = selectedOldApprovers.filter(
			(selectedUser) => selectedUser.id !== id,
		);

		setValue('oldApprovers', newList);
	};

	const onDeleteNewApprover = (id: IUser['id']) => () => {
		const newList = selectedNewApprovers.filter(
			(selectedUser) => selectedUser.id !== id,
		);

		setValue('newApprovers', newList);
	};

	const toggleEmailComments = () => {
		setValue('emailComments', !emailComments, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	const selectedOldApproversIds: number[] = useMemo(
		() => selectedOldApprovers.map((approver) => approver.userId),
		[selectedOldApprovers],
	);
	const oldApproversOptions = useMemo(() => {
		return approvers.filter(
			(approver) => !selectedOldApproversIds.includes(approver.userId),
		);
	}, [selectedOldApproversIds, approvers]);

	const selectedNewApproversIds = useMemo(() => {
		const list: number[] = [];

		selectedNewApprovers.forEach((user) => list.push(user.id));
		approvers.forEach((approver) => list.push(approver.userId));

		return list;
	}, [selectedNewApprovers, approvers]);

	return (
		<PageForm onSubmit={handleSubmit(onSubmit)}>
			<FormGroup>
				<SectionTitle variant="body_1_primary_bold">
					{t('disposition.reassign_approver_form.from')}
				</SectionTitle>

				<FormField>
					{approvers.length !== 1 && (
						<Select<IApprover>
							label={t('disposition.reassign_approver_form.choose_user')}
							options={oldApproversOptions}
							selectedKey={null}
							onChange={onSelectOldApprover}
							error={
								typeof formState.errors?.oldApprovers?.message === 'string'
									? t(formState.errors.oldApprovers.message)
									: undefined
							}
						>
							{(option) => (
								<Item key={option.userId} textValue={option.userDisplayName}>
									{option.userDisplayName}
								</Item>
							)}
						</Select>
					)}
				</FormField>

				<FormField>
					{!!selectedOldApprovers.length && (
						<UserLineList pt="0" pb="0.8rem">
							{selectedOldApprovers.map((approver) => (
								<UserLine
									key={approver.userId}
									userId={approver.userId}
									username={approver.userDisplayName}
									profileImage={approver.profileImage}
									hideClose={approvers.length === 1}
									onClose={onDeleteOldApprover(approver.id)}
								/>
							))}
						</UserLineList>
					)}
				</FormField>
			</FormGroup>

			<FormGroup>
				<SectionTitle variant="body_1_primary_bold">
					{t('disposition.reassign_approver_form.to')}
				</SectionTitle>
				{selectedNewApproversIds.length === 1 && exceptions && (
					<FormField>
						<UserSearchInput
							reassign
							exceptions={exceptions}
							selectedUsers={selectedNewApproversIds}
							onSelectUser={onSelectNewApprover}
							error={
								typeof formState.errors?.newApprovers?.message === 'string'
									? t(formState.errors.newApprovers.message)
									: undefined
							}
						/>
					</FormField>
				)}

				{!exceptions && (
					<FormField>
						<UserSearchInput
							reassign
							exceptions={exceptions}
							selectedUsers={selectedNewApproversIds}
							onSelectUser={onSelectNewApprover}
							error={
								typeof formState.errors?.newApprovers?.message === 'string'
									? t(formState.errors.newApprovers.message)
									: undefined
							}
						/>
					</FormField>
				)}

				<FormField>
					{!!selectedNewApprovers.length && (
						<UserLineList pt="0" pb="0.8rem">
							{selectedNewApprovers.map((user) => (
								<UserLine
									key={user.id}
									userId={user.id}
									username={user.display}
									profileImage={user.profileImage}
									onClose={onDeleteNewApprover(user.id)}
								/>
							))}
						</UserLineList>
					)}
				</FormField>
			</FormGroup>

			<FormField mt="0">
				<Textarea
					{...register('comment')}
					label={t('disposition.reassign_approver_form.comment')}
					error={
						typeof formState.errors?.comment?.message === 'string'
							? formState.errors?.comment?.message
							: undefined
					}
				/>
			</FormField>

			<FormField grid={false}>
				<FieldToggle
					label={
						<Text>
							{t('disposition.reassign_approver_form.email_comments.name')}
						</Text>
					}
					subText={t(
						'disposition.reassign_approver_form.email_comments.sub_text',
					)}
					justifyContent="space-between"
					onChange={toggleEmailComments}
					checked={emailComments}
				/>
			</FormField>
			<ModalFooter>{children({ formState })}</ModalFooter>
		</PageForm>
	);
};
