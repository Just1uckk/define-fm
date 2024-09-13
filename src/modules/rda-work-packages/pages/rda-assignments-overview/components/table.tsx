import React, { memo } from 'react';
import { useLocation } from 'react-router-dom';
import {
	DISPOSITION_CARD_VIEW_TYPES,
	DispositionCard,
} from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/disposition-card/disposition-card';
import styled from 'styled-components';

import { DefaultSettingsDto } from 'app/api/user-api/user-api-default';

import { IWorkPackage } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { useManagePagination } from 'shared/hooks/use-manage-pagination';

import { Pagination } from 'shared/components/table-controls/pagination/pagination';

const Wrapper = styled.div`
	display: flex;
	align-items: flex-start;
	margin-top: 0.75rem;
`;

const TableWrapper = styled.div`
	flex-grow: 1;
	flex-shrink: 0;
`;

const TableList = styled.div`
	margin-top: -0.75rem;
	margin-bottom: 1.5rem;
`;

const TableCard = styled.div`
	display: flex;
	flex-wrap: wrap;
	flex-grow: 1;
	flex-shrink: 0;
	margin-top: -0.75rem;
	margin-left: -0.75rem;
	margin-bottom: 1.5rem;
`;

interface PendingTableProps {
	defaultSettings: DefaultSettingsDto[];
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	dispositions: IWorkPackage[];
	view: DISPOSITION_CARD_VIEW_TYPES;
	currentUser: IUser;
	onChangedPageSize: (size: number) => void;
	onChangePage: (page: number) => void;
}

const TableComponent: React.FC<PendingTableProps> = ({
	defaultSettings,
	page,
	pageSize,
	totalPages,
	totalItems,
	dispositions,
	view,
	currentUser,
	onChangedPageSize,
	onChangePage,
}) => {
	const location = useLocation();
	const { onChangePageSize } = useManagePagination({
		tableName: `rda-assignments-overview`,
	});

	const handleChangePageSize = (size: number) => {
		onChangePageSize(size);
		onChangedPageSize(size);
	};

	const handleChangePage = (page: number) => {
		onChangePage(page);
	};

	const Table =
		view === DISPOSITION_CARD_VIEW_TYPES.ROW ? TableList : TableCard;

	return (
		<Wrapper>
			<TableWrapper>
				<Table>
					{dispositions.map((workPackage) => (
						<DispositionCard
							key={workPackage.id}
							currentLocation={location.pathname + location.search}
							view={view}
							pageType="assignment"
							currentUser={currentUser}
							workPackage={workPackage}
							hasMoreOptions={false}
							sourceName={workPackage.sourceName}
						/>
					))}
				</Table>
				{!!dispositions.length && (
					<Pagination
						pageSize={pageSize}
						page={page}
						itemsCount={totalItems}
						totalPages={totalPages}
						onChangePage={handleChangePage}
						onChangePageSize={handleChangePageSize}
					/>
				)}
			</TableWrapper>
		</Wrapper>
	);
};

TableComponent.displayName = 'Table';

export const Table = memo(TableComponent);
