import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import styled from 'styled-components';

import { IApprovalHistory } from 'shared/types/dispositions';

import { useTranslation } from 'shared/hooks/use-translation';

import { Table } from 'shared/components/table/table';
import { UserAvatarWithLabel } from 'shared/components/user-avatar/user-avatar-with-label';

const Wrapper = styled.div`
	padding: 1rem;
`;

const columnHelper = createColumnHelper<IApprovalHistory>();

interface FeedbackHistoryProps {
	data: IApprovalHistory[];
}

export const ApprovalHistoryTable: React.FC<FeedbackHistoryProps> = ({
	data,
}) => {
	const { t, currentLang } = useTranslation();

	const columns = React.useMemo(() => {
		const columns = [
			columnHelper.accessor('userDisplay', {
				header: () => 'Sign-off Authority',
				cell: ({ getValue, row }) => {
					const value = getValue();

					return (
						<UserAvatarWithLabel
							label={value}
							userId={row.original.historyUser}
							name={row.original.userDisplay}
							url={getUserAvatarUrl(
								row.original.historyUser,
								Number(row.original.userProfileImage),
							)}
						/>
					);
				},
				size: 180,
			}),
			columnHelper.accessor('state', {
				header: () => 'Status',
				cell: ({ row }) => {
					const state = row.original.state;

					return (
						t('rda_approval.status', { returnObjects: true })[state] || state
					);
				},
				size: 136,
			}),
			columnHelper.accessor('reason', {
				header: () => 'Extension Reason',
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? value : '-';
				},
				size: 99,
			}),
			columnHelper.accessor('itemComment', {
				header: () => 'Extension Comment',
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? value : '-';
				},
				size: 99,
			}),
		];

		return columns;
	}, [currentLang]);

	return (
		<Wrapper>
			<Table<IApprovalHistory>
				data={data}
				columns={columns}
				hasPagination={false}
				isSelectableRows={false}
				sortable={false}
			/>
		</Wrapper>
	);
};
