import React, { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useStateModalManager } from 'shared/context/modal-manager';
import styled from 'styled-components';

import { GroupApi } from 'app/api/groups-api/group-api';

import { ThemeProps } from 'app/settings/theme/theme';

import { IGroup } from 'shared/types/group';

import { GROUPS_MODAL_NAMES } from 'shared/constants/constans';
import { GROUPS_QUERY_KEYS } from 'shared/constants/query-keys';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Modal } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const StyledModal = styled(Modal.Root)`
	.modal_content_wrapper {
		max-width: 25rem;
	}
`;

const StyledIcon = styled(Icon)<ThemeProps>`
	margin-top: 1.875rem;
	color: ${({ theme }) => theme.colors.red.style_1};

	svg {
		width: 2.3rem;
		height: auto;
	}
`;

const ModalBody = styled.div`
	text-align: center;
`;

interface DeleteGroupProps {
	onSuccess: () => Promise<unknown>;
}

export const DeleteGroup: React.FC<DeleteGroupProps> = ({ onSuccess }) => {
	const client = useQueryClient();
	const { t, currentLang } = useTranslation();
	const [groups, setGroups] = useState<IGroup[]>([]);

	const modalState = useStateModalManager(GROUPS_MODAL_NAMES.DELETE_GROUP, {
		onBeforeOpen: (groups: IGroup[]) => {
			setGroups(groups);
		},
	});

	const deleteGroupMutation = useMutation({
		mutationFn: async () => {
			const promises = groups.map(({ id }) => GroupApi.deleteGroup({ id }));

			await Promise.all(promises);
			await onSuccess();
		},
		onSuccess: () => {
			client.refetchQueries(GROUPS_QUERY_KEYS.groups_count);

			modalState.close();
			modalState.resolveCallback();
		},
	});

	const onConfirm = () => {
		if (!groups.length) return;

		deleteGroupMutation.mutate();
	};

	const title = useMemo(() => {
		return t('groups.delete_group_modal.confirm_text.name', {
			count: groups.length,
			name: groups[0]?.name,
		});
	}, [groups, currentLang]);

	return (
		<StyledModal
			open={modalState.open}
			placement="center"
			fulfilled
			hasClose={false}
			isClosable={!deleteGroupMutation.isLoading}
		>
			<Modal.Page>
				<ModalBody>
					<StyledIcon icon={ICON_COLLECTION.x_octagon} />
					<Title variant="h2_primary_semibold" mt="0.8rem">
						{t('groups.delete_group_modal.title')}
					</Title>
					<Text variant="body_1_primary" mt="1.5rem" p="0 2.7rem">
						{t('groups.delete_group_modal.confirm_text.before_name')}{' '}
						<Text tag="span" variant="body_1_secondary">
							{title}
						</Text>{' '}
						{t('groups.delete_group_modal.confirm_text.after_name', {
							count: groups.length,
						})}
					</Text>
					<Text variant="body_1_primary">
						{t('groups.delete_group_modal.warning_text')}
					</Text>
				</ModalBody>
				<ModalFooter>
					<ButtonList justifyContent="center">
						<Button
							type="button"
							variant="primary_outlined"
							label={t('groups.delete_group_modal.actions.cancel')}
							onClick={modalState.close}
							disabled={deleteGroupMutation.isLoading}
						/>
						<Button
							icon={ICON_COLLECTION.delete}
							label={t('groups.delete_group_modal.actions.accept')}
							onClick={onConfirm}
							loading={deleteGroupMutation.isLoading}
						/>
					</ButtonList>
				</ModalFooter>
			</Modal.Page>
		</StyledModal>
	);
};
