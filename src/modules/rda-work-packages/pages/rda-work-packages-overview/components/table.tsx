import React from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { DefaultSettingsDto } from 'app/api/user-api/user-api-default';

import { ICoreConfig } from 'shared/types/core-config';
import { IWorkPackage } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { DISPOSITION_WORKFLOW_STATES } from 'shared/constants/constans';

import { useManagePagination } from 'shared/hooks/use-manage-pagination';

import { Pagination } from 'shared/components/table-controls/pagination/pagination';

import {
	DISPOSITION_CARD_VIEW_TYPES,
	DispositionCard,
} from './disposition-card/disposition-card';

const Wrapper = styled.div`
	display: flex;
	align-items: flex-start;
	margin-top: 0.75rem;
`;

const TableWrapper = styled.div`
	flex-grow: 1;

	&.row {
		flex-shrink: 0;
	}
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
	workPackageConfigs: ICoreConfig[] | [];
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	dispositions: IWorkPackage[];
	view: DISPOSITION_CARD_VIEW_TYPES;
	isSelectableTable: boolean;
	isEntitySelected: (id: IWorkPackage['id']) => boolean;
	currentUser: IUser;
	onSelectEntity: (disposition: IWorkPackage) => void;
	onGenerateAudit: (data: IWorkPackage) => void;
	onInitiate: (id: IWorkPackage['id']) => void;
	onReassign: (id: IWorkPackage['id']) => void;
	onRecall: (disposition: IWorkPackage) => void;
	onForceApproval: (disposition: IWorkPackage) => void;
	onComplete: (dispositionId: IWorkPackage['id']) => void;
	onVerifyApproverRights: (disposition: IWorkPackage) => void;
	onModifyApprovers: (id: IWorkPackage['id']) => void;
	onDeleteEntity: (disposition: IWorkPackage) => void;
	onChangedPageSize: (size: number) => void;
	onChangePage: (page: number) => void;
}

export const Table: React.FC<PendingTableProps> = ({
	page,
	pageSize,
	workPackageConfigs,
	totalPages,
	totalItems,
	dispositions,
	view,
	isSelectableTable,
	defaultSettings,
	isEntitySelected,
	currentUser,
	onSelectEntity,
	onGenerateAudit,
	onInitiate,
	onVerifyApproverRights,
	onReassign,
	onRecall,
	onForceApproval,
	onComplete,
	onModifyApprovers,
	onDeleteEntity,
	onChangedPageSize,
	onChangePage,
}) => {
	const location = useLocation();
	const { onChangePageSize } = useManagePagination({
		tableName: `rda-work-packages-overview`,
	});

	const handleChangePageSize = (size: number) => {
		onChangePageSize(size);
		onChangedPageSize(size);
	};

	const handleChangePage = (size: number) => {
		onChangePage(size);
	};

	const Table =
		view === DISPOSITION_CARD_VIEW_TYPES.ROW ? TableList : TableCard;

	return (
		<Wrapper>
			<TableWrapper className={view}>
				<Table>
					{dispositions.map((disposition) => (
						<DispositionCard
							disable={
								disposition.workflowStatus ===
									DISPOSITION_WORKFLOW_STATES.BUILDING_PENDING ||
								disposition.workflowStatus ===
									DISPOSITION_WORKFLOW_STATES.BUILDING_INITIATED
							}
							key={disposition.id}
							workPackageConfigs={workPackageConfigs}
							currentLocation={location.pathname + location.search}
							workPackage={disposition}
							pageType="workPackage"
							currentUser={currentUser}
							view={view}
							sourceName={disposition.sourceName}
							isSelectable={isSelectableTable}
							isSelected={isEntitySelected}
							onSelect={() => onSelectEntity(disposition)}
							onReassign={onReassign}
							onRecall={() => onRecall(disposition)}
							onVerifyApproverRights={() => onVerifyApproverRights(disposition)}
							onGenerateAudit={onGenerateAudit}
							onInitiate={onInitiate}
							onDelete={() => onDeleteEntity(disposition)}
							onForceApproval={() => onForceApproval(disposition)}
							onModifyApprovers={onModifyApprovers}
							onComplete={() => onComplete(disposition.id)}
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
