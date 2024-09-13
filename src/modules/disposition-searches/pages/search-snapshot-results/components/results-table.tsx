import React, { useMemo } from 'react';
import { CellContext, createColumnHelper } from '@tanstack/react-table';
import { NoSnapshotResult } from 'modules/disposition-searches/pages/search-snapshot-results/components/no-result';
import { NoSnapshotSearchResult } from 'modules/disposition-searches/pages/search-snapshot-results/components/no-search-result';
import { isImage } from 'shared/utils/utils';
import styled from 'styled-components';

import {
	FindEntityRequest,
	FindEntityResponseFilterGroup,
} from 'app/api/types';

import { IDispositionSearchSnapshotItem } from 'shared/types/disposition-search';

import { useDate } from 'shared/hooks/use-date';

import { Image } from 'shared/components/image/image';
import { Spinner } from 'shared/components/spinner/spinner';
import { Table, TableSortState } from 'shared/components/table/table';
import {
	FilterPanel,
	FilterPanelProps,
} from 'shared/components/table-controls/filter-panel/filter-panel';

const Container = styled.div`
	display: flex;
	align-items: flex-start;
`;

const TableWrapper = styled.div`
	flex-grow: 1;
	margin-top: 0.875rem;
	overflow: hidden;
`;

const StyledFilterPanel = styled(FilterPanel)`
	margin-top: 0.875rem;
`;

const ImageValue = styled(Image)`
	width: 24px;
`;

const columnHelper = createColumnHelper<IDispositionSearchSnapshotItem>();

function getColumnWidth(rows, accessor, headerText) {
	if (isImage(rows[0]?.[accessor])) {
		return 40;
	}

	const maxWidth = 400;
	const magicSpacing = 12;
	const cellLength = Math.max(
		...rows.map((row) => (`${row[accessor]}` || '').length),
		headerText.length,
	);
	return Math.min(maxWidth, cellLength * magicSpacing);
}

interface DispositionSearchesTableProps {
	data?: IDispositionSearchSnapshotItem[];
	filters: FindEntityResponseFilterGroup[];
	selectedFilters: FindEntityRequest['elements'];
	page: number;
	pageSize: number;
	totalPages: number;
	totalItems: number;
	isLoadingData?: boolean;
	isDisplayingFilters: boolean;
	isNoResult: boolean;
	isNoSearchResult: boolean;
	onSortChanged?: (state: TableSortState) => void;
	onChangePageSize: (size: number) => void;
	onChangePage: (page: number) => void;
	onChangeFilter: FilterPanelProps['onChange'];
	onClearFilters: FilterPanelProps['onClearFilters'];
}

export const DispositionSearchSnapshotResultsTable: React.FC<
	DispositionSearchesTableProps
> = ({
	data = [],
	filters,
	selectedFilters,
	page,
	pageSize,
	totalPages,
	totalItems,
	isLoadingData,
	isDisplayingFilters,
	isNoResult,
	isNoSearchResult,
	onSortChanged,
	onChangePage,
	onChangePageSize,
	onChangeFilter,
	onClearFilters,
}) => {
	const date = useDate();

	const columns = useMemo(() => {
		if (!data[0]) return [];

		const fields = Object.keys(data[0]);

		return fields.map((fieldName) =>
			columnHelper.accessor(fieldName, {
				header: fieldName,
				cell: (props) => getValue(props, fieldName),
				size: getColumnWidth(data, fieldName, fieldName),
				minSize: 50,
			}),
		);
	}, [data, date.currentLang]);

	function getValue(
		props: CellContext<IDispositionSearchSnapshotItem, any>,
		fieldName: string,
	) {
		const value = props.getValue();

		if (!value) {
			return '—';
		}

		if (props.row.original.dateFields.includes(fieldName)) {
			return date.formats.baseWithTime(value);
		}

		return isImage(value) ? <ImageValue src={value} /> : value;
	}

	if (isLoadingData) {
		return (
			<Container>
				<TableWrapper>
					<Spinner />
				</TableWrapper>
			</Container>
		);
	}

	return (
		<Container>
			<TableWrapper>
				{isNoResult && <NoSnapshotResult />}
				{isNoSearchResult && <NoSnapshotSearchResult />}
				<Table<IDispositionSearchSnapshotItem>
					name="disposition-search-snapshot-items"
					data={data}
					sortable
					columns={columns}
					page={page}
					pageSize={pageSize}
					totalItems={totalItems}
					totalPages={totalPages}
					isSelectableRows={false}
					onSortChanged={onSortChanged}
					onChangePageSize={onChangePageSize}
					onChangePage={onChangePage}
				/>
			</TableWrapper>
			{isDisplayingFilters && (
				<StyledFilterPanel
					dataList={data}
					filters={filters}
					activeFilters={selectedFilters}
					onClearFilters={onClearFilters}
					onChange={onChangeFilter}
				/>
			)}
		</Container>
	);
};
