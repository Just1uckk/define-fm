import React from 'react';
import { useQuery } from 'react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import styled from 'styled-components';

import { BulkApi } from 'app/api/bulk-api/bulk-api';

import { IFeedbackHistory } from 'shared/types/dispositions';

import { useTranslation } from 'shared/hooks/use-translation';

import { Spinner } from 'shared/components/spinner/spinner';
import { Table } from 'shared/components/table/table';
import { UserAvatarWithLabel } from 'shared/components/user-avatar/user-avatar-with-label';

const Wrapper = styled.div`
	padding: 1rem;
`;

const columnHelper = createColumnHelper<IFeedbackHistory>();

interface FeedbackHistoryProps {
	id: number | string;
}

export const FeedbackHistory: React.FC<FeedbackHistoryProps> = ({ id }) => {
	const { t, currentLang } = useTranslation();

	const { data: feedbackInformation } = useQuery({
		queryKey: ['rda-item-feedback', id],
		queryFn: async () => {
			return await BulkApi.getFeedbackInformation(Number(id));
		},
	});

	const columns = React.useMemo(() => {
		const columns = [
			columnHelper.accessor('requestorDisplayName', {
				header: () => 'Requested By',
				cell: ({ getValue, row }) => {
					const value = getValue();

					return (
						<UserAvatarWithLabel
							label={value}
							userId={row.original.requestorId}
							name={row.original.requestorDisplayName}
							url={getUserAvatarUrl(
								row.original.requestorId,
								Number(row.original.requestorProfileImage),
							)}
						/>
					);
				},
				size: 296,
			}),
			columnHelper.accessor('userDisplay', {
				header: () => 'Feedback User',
				cell: ({ row }) => {
					return (
						<UserAvatarWithLabel
							label={row.original.userDisplay}
							userId={row.original.userId}
							name={row.original.userDisplay}
							url={getUserAvatarUrl(
								row.original.userId,
								Number(row.original.userProfileImage),
							)}
						/>
					);
				},
				size: 136,
			}),
			columnHelper.accessor('state', {
				header: () => 'Recommendation',
				cell: ({ row }) => {
					const state = row.original.state;

					return (
						t('rda_approval.status', { returnObjects: true })[state] || state
					);
				},
				size: 99,
			}),
			columnHelper.accessor('reason', {
				header: () => 'Reason',
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? value : '-';
				},
				size: 99,
			}),
			columnHelper.accessor('itemComment', {
				header: () => 'Comment',
				cell: ({ getValue }) => {
					const value = getValue();

					return value ? value : '-';
				},
				size: 99,
			}),
		];

		return columns;
	}, [currentLang, feedbackInformation]);

	return (
		<Wrapper>
			{feedbackInformation ? (
				<Table<IFeedbackHistory>
					data={feedbackInformation}
					columns={columns}
					hasPagination={false}
					isSelectableRows={false}
					sortable={false}
				/>
			) : (
				<Spinner />
			)}
		</Wrapper>
	);
};
