import React, { useContext } from 'react';

import { GROUP_API_ERRORS } from 'app/api/groups-api/errors';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Text } from 'shared/components/text/text';

import { GroupForm, GroupFormProps } from '../components/group-form';

export interface ModalAddGroupProps {
	isLoading: boolean;
	error?: GROUP_API_ERRORS;
	onSubmit: GroupFormProps['onSubmit'];
}

export const AddGroupModal: React.FC<ModalAddGroupProps> = ({
	isLoading,
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
					{t('groups.create_group_modal.title')}
				</HeaderTitle>
				<Text variant="body_2_secondary">
					{t('groups.create_group_modal.sub_title')}
				</Text>
			</PageHeader>
			<PageBody>
				<GroupForm error={error} onSubmit={onSubmit}>
					<Button
						icon={ICON_COLLECTION.chevron_right}
						label={t('groups.create_group_form.actions.create')}
						loading={isLoading}
					/>
				</GroupForm>
			</PageBody>
		</>
	);
};
