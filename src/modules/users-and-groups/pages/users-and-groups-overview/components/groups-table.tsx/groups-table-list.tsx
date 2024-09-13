import React, { memo } from 'react';
import styled from 'styled-components';

import { IGroup } from 'shared/types/group';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import {
	MoreButton,
	MoreButtonProps,
} from 'shared/components/button/more-button';
import { TableCol } from 'shared/components/table-elements/table-col';
import { TableEntity } from 'shared/components/table-elements/table-entity';
import { Text } from 'shared/components/text/text';

const Row = styled(TableEntity)`
	padding: 1.1rem 1rem;
	cursor: pointer;
`;

const Col = styled(TableCol)`
	min-width: 0px;
	flex-shrink: 0;
	flex-basis: auto;
`;

const GroupNameCol = styled(Col)`
	flex-grow: 255;
	width: 255px;
`;

const CreatedByCol = styled(Col)`
	flex-grow: 223;
	width: 223px;
`;

const CreatedDateCol = styled(Col)`
	flex-grow: 186;
	width: 186px;
`;

const StyledMoreButton = styled(MoreButton)`
	margin-left: auto;
`;

interface GroupsTableListProps {
	groups?: IGroup[];
	isRowSelected: (groupId: IGroup['id']) => boolean;
	isRowHighlighted: (groupId: IGroup['id']) => boolean;
	isEnabledMultipleSelect: boolean;
	getGroupActions: (group: IGroup) => MoreButtonProps['options'];
	onClickRow: (group: IGroup) => void;
	onSelectRow: (group: IGroup) => void;
}

const GroupsTableListComponent: React.FC<GroupsTableListProps> = ({
	groups,
	isEnabledMultipleSelect,
	isRowSelected,
	isRowHighlighted,
	getGroupActions,
	onClickRow,
	onSelectRow,
}) => {
	const date = useDate();
	const { t } = useTranslation();

	return (
		<>
			{groups?.map((group) => {
				const moreOptions = getGroupActions(group);

				return (
					<Row
						key={group.id}
						hasCheckbox
						isSelectable={isEnabledMultipleSelect}
						isSelected={isRowSelected(group.id)}
						isHighlighted={isRowHighlighted(group.id)}
						onClick={() => onClickRow(group)}
						onSelect={() => onSelectRow(group)}
					>
						<GroupNameCol>
							<Text variant="body_2_primary_semibold" mb="0.2rem">
								{group.name}
							</Text>
						</GroupNameCol>
						<CreatedByCol>
							<Text variant="body_4_secondary" mb="0.2rem">
								{t('groups.groups_table.columns.created_by')}
							</Text>
							<Text variant="body_4_primary">{group.createdByDisplay}</Text>
						</CreatedByCol>
						<CreatedDateCol>
							<Text variant="body_4_secondary" mb="0.2rem">
								{t('groups.groups_table.columns.date_created')}
							</Text>
							<Text variant="body_4_primary">
								{date.formats.base(group.createdOn)}
							</Text>
						</CreatedDateCol>
						{!!moreOptions.length && (
							<TableCol>
								<StyledMoreButton options={getGroupActions(group)} />
							</TableCol>
						)}
					</Row>
				);
			})}
		</>
	);
};

GroupsTableListComponent.displayName = 'GroupsTableList';

export const GroupsTableList = memo(GroupsTableListComponent);
