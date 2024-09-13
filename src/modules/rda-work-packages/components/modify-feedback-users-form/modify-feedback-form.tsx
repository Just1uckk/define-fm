import React, { useMemo } from 'react';
import { FieldError, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import * as yup from 'yup';

import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { UserSearchInput } from 'shared/components/input/user-search-input';
import { FormField } from 'shared/components/modal-form/form-field';
import { TextEditor } from 'shared/components/text-editor/text-editor';
import { UserLine } from 'shared/components/user-line/user-line';
import { UserLineList } from 'shared/components/user-line/user-line-list';

const Form = styled.form``;

const schema = yup
	.object({
		feedbackUsers: yup
			.array(yup.object())
			.required('validation_errors.field_is_required'),
		comment: yup
			.string()
			.trim()
			.required('validation_errors.field_is_required'),
	})
	.defined();
const resolver = yupResolver(schema);

export type ModifyFeedbackFormDataTypes = {
	feedbackUsers: IUser[];
	comment: string;
};

interface ModifyFeedbackFormProps {
	defaultUsers?: IUser[];
	defaultFeedbackMessage?: string;
	approverUserIds: number[];
	onSubmit: (data: ModifyFeedbackFormDataTypes) => void;
}

export const ModifyFeedbackForm: React.FC<
	React.PropsWithChildren<ModifyFeedbackFormProps>
> = ({
	approverUserIds,
	defaultFeedbackMessage,
	defaultUsers,
	onSubmit,
	children,
}) => {
	const { t } = useTranslation();

	const { register, setValue, handleSubmit, formState, watch } =
		useForm<ModifyFeedbackFormDataTypes>({
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			resolver: resolver,
			defaultValues: {
				feedbackUsers: defaultUsers,
				comment: defaultFeedbackMessage,
			},
		});

	const selectedUsers = watch('feedbackUsers') || [];
	const comment = watch('comment');

	const onSelectUser = (user: IUser) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		setValue('feedbackUsers', [...selectedUsers, user]);
	};

	const onDeleteUser = (id: IUser['id']) => () => {
		const newList = selectedUsers.filter(
			(selectedUser) => selectedUser.id !== id,
		);

		setValue('feedbackUsers', newList);
	};

	const selectedUserIds = useMemo(
		() => selectedUsers.map((user) => user.id).concat(approverUserIds),
		[selectedUsers],
	);

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<FormField>
				{!!selectedUsers.length && (
					<UserLineList pt="0" pb="0.8rem">
						{selectedUsers.map((user) => (
							<UserLine
								key={user.id}
								userId={user.id}
								username={user.display}
								profileImage={user.profileImage}
								onClose={onDeleteUser(user.id)}
							/>
						))}
					</UserLineList>
				)}
			</FormField>
			<FormField m="0">
				<UserSearchInput
					reassign
					label={t('disposition.request_feedback_form.add_user')}
					selectedUsers={selectedUserIds}
					onSelectUser={onSelectUser}
					error={
						(formState.errors?.feedbackUsers as unknown as FieldError)?.message
							? t(
									(formState.errors?.feedbackUsers as unknown as FieldError)
										?.message as string,
							  )
							: (formState.errors?.feedbackUsers as unknown as FieldError)
									?.message
					}
				/>
			</FormField>
			<FormField>
				<TextEditor
					value={comment}
					onChange={(value) => {
						setValue('comment', value);
					}}
					label={t('disposition.request_feedback_form.comment')}
					error={
						formState.errors?.comment?.message
							? t(formState.errors.comment.message)
							: formState.errors?.comment?.message
					}
				/>
			</FormField>
			{children}
		</Form>
	);
};
