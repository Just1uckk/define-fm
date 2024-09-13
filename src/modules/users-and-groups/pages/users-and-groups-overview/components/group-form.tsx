import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
} from 'react';
import { FormState, useForm, UseFormGetValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import * as yup from 'yup';

import { GROUP_API_ERRORS } from 'app/api/groups-api/errors';

import { IGroup } from 'shared/types/group';
import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Input } from 'shared/components/input/input';
import { UserSearchInput } from 'shared/components/input/user-search-input';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FieldToggle } from 'shared/components/modal-form/field-toggle';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { PageForm } from 'shared/components/modal-form/page-form';
import { SectionTitle } from 'shared/components/modal-form/section-title';
import { Text } from 'shared/components/text/text';
import { UserLine } from 'shared/components/user-line/user-line';

const UserLineOrderList = styled.div`
	margin-top: 0.75rem;
`;

const schema = yup
	.object({
		enabled: yup.boolean().required(),
		name: yup.string().trim().required('validation_errors.field_is_required'),
		comment: yup.string().trim(),
		users: yup.array(),
	})
	.defined();

export type GroupFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

export interface GroupFormRef {
	formState: FormState<GroupFormData>;
	getValues: UseFormGetValues<GroupFormData>;
	selectedUsers: IUser[];
}

export interface GroupFormProps {
	group?: IGroup;
	users?: IUser[];
	error?: GROUP_API_ERRORS;
	onSubmit: (
		data: GroupFormData,
		dirtyFields: Record<string, boolean[] | boolean | undefined>,
		users: IUser[],
	) => void;
	children: React.ReactNode;
}

const GroupFormComponent: React.ForwardRefRenderFunction<
	GroupFormRef,
	GroupFormProps
> = ({ group, users, error, onSubmit, children }, ref) => {
	const { t } = useTranslation();

	const {
		handleSubmit,
		register,
		watch,
		setValue,
		getValues,
		formState,
		formState: { errors, dirtyFields },
		setError,
	} = useForm<GroupFormData>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		defaultValues: {
			name: group?.name ?? '',
			comment: group?.comment ?? '',
			enabled: group?.enabled ?? true,
			users: users || [],
		},
	});
	const enabledValue = watch('enabled');
	const selectedUsers = watch('users', []) as IUser[];

	useEffect(() => {
		if (!users) return;
		setValue('users', users);
	}, [users]);

	useEffect(() => {
		if (error === GROUP_API_ERRORS.DuplicateEntityException) {
			setError('name', {
				message: t(`groups.create_group_form.validations.${error}`),
			});
		}
	}, [error]);

	useImperativeHandle(
		ref,
		() => {
			return {
				formState,
				getValues,
				selectedUsers,
			};
		},
		[formState.isDirty],
	);

	const toggleEnabled = () =>
		setValue('enabled', !enabledValue, {
			shouldValidate: true,
			shouldDirty: true,
		});

	const onAddUser = (user: IUser) => {
		setValue('users', [...selectedUsers, user], { shouldDirty: true });
	};

	const onDeleteUser = (id: IUser['id']) => () => {
		const newList = selectedUsers.filter(
			(selectedUser) => selectedUser.id !== id,
		);

		setValue('users', newList, { shouldDirty: true });
	};

	const onSubmitForm = (data: GroupFormData) => {
		onSubmit(data, dirtyFields, selectedUsers);
	};

	const selectedUserIds = useMemo(
		() => selectedUsers.map((user) => user.id),
		[selectedUsers],
	);

	return (
		<PageForm onSubmit={handleSubmit(onSubmitForm)}>
			<FormGroup>
				{!group?.appGroup && (
					<FormField grid={false}>
						<FieldToggle
							label={
								<Text>
									{enabledValue
										? t('groups.group_form.enabled')
										: t('groups.group_form.disabled')}
								</Text>
							}
							onChange={toggleEnabled}
							checked={enabledValue}
							justifyContent="space-between"
						/>
					</FormField>
				)}
				<FormField>
					<Input
						{...register('name')}
						error={
							errors?.name?.message
								? t(errors?.name?.message)
								: errors?.name?.message
						}
						disabled={group?.appGroup}
						label={t('groups.group_form.group_name')}
						fulfilled
					/>
				</FormField>
				<FormField grid={false}>
					<Input
						{...register('comment')}
						error={errors.comment?.message}
						label={t('groups.group_form.group_comment')}
						fulfilled
					/>
				</FormField>
			</FormGroup>
			<FormGroup>
				<SectionTitle variant="body_1_primary_bold">
					{t('groups.group_form.users')}
				</SectionTitle>
				<FormField>
					<UserSearchInput
						selectedUsers={selectedUserIds}
						onSelectUser={onAddUser}
					/>
				</FormField>
				<UserLineOrderList>
					{selectedUsers.map((user) => (
						<UserLine
							key={user.id}
							userId={user.id}
							username={user.display}
							profileImage={user.profileImage}
							onClose={onDeleteUser(user.id)}
						/>
					))}
				</UserLineOrderList>
			</FormGroup>
			<ModalFooter>{children}</ModalFooter>
		</PageForm>
	);
};

export const GroupForm = forwardRef(GroupFormComponent);
