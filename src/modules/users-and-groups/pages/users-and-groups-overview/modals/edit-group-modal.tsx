import React, { useContext } from 'react';
import {
	GroupForm,
	GroupFormProps,
	GroupFormRef,
} from 'modules/users-and-groups/pages/users-and-groups-overview/components/group-form';

import { GROUP_API_ERRORS } from 'app/api/groups-api/errors';

import { IGroup } from 'shared/types/group';
import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Spinner } from 'shared/components/spinner/spinner';

interface EditGroupModalProps {
	formRef?: React.MutableRefObject<GroupFormRef | undefined>;
	groupName: string;
	group?: IGroup;
	users?: IUser[];
	error?: GROUP_API_ERRORS;
	isLoading: boolean;
	isUpdating: boolean;
	onSubmit: GroupFormProps['onSubmit'];
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
	formRef,
	groupName,
	group,
	users,
	isLoading,
	isUpdating,
	error,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const modalContext = useContext<ModalContextProps>(ModalContext);

	return (
		<>
			<ModalNavbar onClose={modalContext.onClose} />

			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					{t('groups.edit_group_modal.title', { groupName })}
				</HeaderTitle>
			</PageHeader>
			{isLoading && <Spinner mt="1rem" />}

			{!isLoading && (
				<PageBody>
					<GroupForm
						ref={formRef as React.Ref<GroupFormRef> | undefined}
						group={group}
						users={users}
						error={error}
						onSubmit={onSubmit}
					>
						<Button
							icon={ICON_COLLECTION.chevron_right}
							label={t('groups.edit_group_form.actions.save')}
							loading={isUpdating}
						/>
					</GroupForm>
				</PageBody>
			)}
		</>
	);
};
