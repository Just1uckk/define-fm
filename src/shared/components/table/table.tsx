import React, { Fragment, useEffect, useImperativeHandle } from 'react';
import {
	ColumnDef,
	ColumnOrderState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getPaginationRowModel,
	Row,
	Table as TableType,
	TableState,
	useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { ColumnOrder } from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import { EventBus, TABLE_GLOBAL_EVENTS } from 'shared/utils/event-bus';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useManageTableSettings } from 'shared/hooks/use-manage-table-settings';
import { useEvent } from 'shared/hooks/useEvent';

import { Checkbox } from 'shared/components/checkbox/checkbox';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Pagination } from 'shared/components/table-controls/pagination/pagination';

const TableContainer = styled.div`
	flex-grow: 1;
	overflow: hidden;
`;

const TableWrapper = styled.div`
	flex-grow: 1;
	padding-bottom: 0.5rem;
	overflow: auto;
`;

const TableRoot = styled.table<ThemeProps>`
	width: 100%;
	color: ${({ theme }) => theme.colors.primary};
	background-color: ${({ theme }) => theme.colors.backgroundSecondary};
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: 8px;
	border-collapse: collapse;
`;

const TableHeader = styled.thead`
	border-bottom: 2px solid ${({ theme }) => theme.colors.borderColorPrimary};
`;

const TableBody = styled.tbody`
	overflow-y: scroll;
	overflow-x: hidden;
`;

const HeaderCell = styled.th`
	height: 3.3rem;
	font-size: 0.875rem;
	line-height: 1.0625rem;
	font-weight: 600;
`;

const HeaderCellContent = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	height: 100%;
	padding: 0.5rem 0.3rem;
`;

const HeaderCellContentText = styled.div`
	text-overflow: ellipsis;
	overflow: hidden;
`;

const TableRow = styled.tr`
	border-top: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};

	&:nth-child(odd),
	& + .sub-row {
		//background: #fafafa;
		background-color: ${({ theme }) => theme.colors.backgroundPrimary};
	}

	&:not(.sub-row):hover {
		background-color: ${({ theme }) => theme.colors.blue.secondary_inverted};
	}

	&.is-selected {
		background-color: ${({ theme }) => theme.colors.blue.secondary_inverted};
	}
`;

const TableSubRow = styled(TableRow)``;

const RowCell = styled.th`
	height: 3.3rem;
	font-size: 0.875rem;
	line-height: 1.0625rem;
	font-weight: 400;
`;

const RowBodyCell = styled(RowCell)`
	height: 3.3rem;
	font-size: 0.875rem;
	line-height: 1.0625rem;
	font-weight: 400;
`;

const RowCellContent = styled.div`
	display: flex;
	align-items: center;
	width: 100%;
	height: 100%;
	padding: 0.5rem 0.3rem;
`;

const SortIcon = styled(Icon)`
	margin-left: 0.5rem;
`;

const TableFooter = styled.div`
	margin: 1rem 0;
`;

export type TableRefMethods = {
	onResetSelectedRows: () => void;
};

export type TableRef = React.MutableRefObject<TableRefMethods | undefined>;

export type TableChildrenFunctionParams = {
	state: TableState;
	toggleAllRowsSelected: TableType<object>['toggleAllRowsSelected'];
};

export type TableSortState = Array<{ id: string; desc: boolean }>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface TableProps<Data extends object, Value = unknown> {
	innerRef?: TableRef;
	name?: string;
	columns: ColumnDef<Data, any>[];
	columnOrder?: ColumnOrderState;
	data: Data[];
	selectedRowIds?: Record<string, boolean>;
	isSelectableRows?: boolean;
	hasPagination?: boolean;
	totalPages?: number;
	page?: number;
	pageSize?: number;
	totalItems?: number;
	sortable?: boolean;
	sortBy?: string | `-${string}`;
	getIsRowSelectDisabled?: (row: Row<any>) => boolean;
	onSortChanged?: (state: TableSortState) => void;
	onChangePage?: (page: number) => void;
	onChangePageSize?: (size: number) => void;
	onRowClick?: (e: React.MouseEvent, row: Row<Data>) => void;
	onSelectRow?: (row: Row<Data>) => void;
	toggleSelectingAllRows?: (data: Record<number, boolean>) => void;
	renderSubComponent?: (props: { row: Row<Data> }) => React.ReactElement;
	children?:
		| React.ReactNode
		| ((params: TableChildrenFunctionParams) => React.ReactNode);
}

const TableComponent = <Data extends object, Value = unknown>({
	innerRef,
	name,
	sortBy: sortByProp,
	columns,
	columnOrder: initialColumnOrder,
	data,
	isSelectableRows = true,
	hasPagination = true,
	totalPages,
	page,
	pageSize = 12,
	totalItems,
	sortable,
	selectedRowIds = {},
	getIsRowSelectDisabled,
	onSortChanged,
	onChangePage,
	onChangePageSize,
	onRowClick,
	onSelectRow,
	toggleSelectingAllRows,
	renderSubComponent,
	children,
}: React.PropsWithChildren<TableProps<Data, Value>>) => {
	const manageTableSettings = useManageTableSettings();

	const getSortState = (state?: TableProps<Data, Value>['sortBy']) => {
		if (!state) return [];

		if (state.startsWith('-')) {
			return [
				{
					id: state.substring(1),
					desc: true,
				},
			];
		}

		return [
			{
				id: state,
				desc: false,
			},
		];
	};

	const tableColumns = React.useMemo(() => {
		if (!isSelectableRows) {
			return columns;
		}

		const updatedColumns: Array<ColumnDef<Data, Value>> = [
			{
				id: 'select',
				size: 15,
				enablePinning: true,
				header: ({ table }) => {
					return (
						<>
							<Checkbox
								checked={
									table.getIsAllRowsSelected() || table.getIsSomeRowsSelected()
								}
								indeterminate={table.getIsSomeRowsSelected()}
								onChange={toggleAllRowsSelected}
							/>
						</>
					);
				},
				cell: ({ row }) => {
					return (
						<div>
							<Checkbox
								checked={row.getIsSelected()}
								disabled={!row.getCanSelect()}
								onChange={handleSelectRow(row)}
							/>
						</div>
					);
				},
			},
			...columns,
		];

		return updatedColumns;
	}, [columns]);

	const tableInstance = useReactTable<Data>({
		columns: tableColumns,
		data,
		enableColumnResizing: true,
		columnResizeMode: 'onChange',
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		manualSorting: true,
		enableSorting: sortable,
		enableSortingRemoval: true,
		initialState: {
			sorting: getSortState(sortByProp),
			pagination: {
				pageSize: pageSize,
			},
			rowSelection: selectedRowIds,
		},
		state: {
			rowSelection: selectedRowIds,
		},
		getIsRowExpanded: (row) => {
			return state.expanded[row.id];
		},
		getRowId: (row) => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			return row.id;
		},
		getRowCanExpand: () => true,
		enableExpanding: !!renderSubComponent,
		enableRowSelection: getIsRowSelectDisabled
			? (row) => !getIsRowSelectDisabled(row)
			: true,
	});

	const [state, setState] = React.useState(tableInstance.initialState);

	tableInstance.setOptions((prev) => {
		return {
			...prev,
			state,
			onStateChange: setState,
		};
	});

	useEffectAfterMount(() => {
		setState((prevValue) => {
			return {
				...prevValue,
				rowSelection: selectedRowIds,
			};
		});
	}, [selectedRowIds]);

	const toggleAllRowsSelected = () => {
		const rowSelection = { ...state.rowSelection };
		const preGroupedFlatRows = tableInstance.getPreGroupedRowModel().flatRows;
		const value = !tableInstance.getIsAllRowsSelected();

		if (value) {
			preGroupedFlatRows.forEach((row) => {
				if (!row.getCanSelect()) {
					return;
				}
				rowSelection[row.id] = true;
			});
		} else {
			preGroupedFlatRows.forEach((row) => {
				delete rowSelection[row.id];
			});
		}

		toggleSelectingAllRows && toggleSelectingAllRows(rowSelection);
	};

	const onResetSelectedRows = () => {
		setState((prevValue) => ({
			...prevValue,
			rowSelection: {},
		}));
	};

	useEffect(() => {
		if (!name) return;

		const onChangeColumnOrder = ({
			tableName,
			order,
		}: {
			tableName: string;
			order: string[];
		}) => {
			if (tableName !== name) return;

			tableInstance.setColumnOrder(() => ['select', ...order]);
		};

		const onChangeHiddenColumns = ({
			tableName,
			columns,
		}: {
			tableName: string;
			columns: Array<object & { id: string; visible?: boolean }>;
		}) => {
			if (tableName !== name) return;

			columns.forEach((column) => {
				tableInstance.setColumnVisibility((state) => ({
					...state,
					[column.id]: column.visible ?? true,
				}));
			});
		};

		EventBus.on(TABLE_GLOBAL_EVENTS.set_column_order, onChangeColumnOrder);
		EventBus.on(
			TABLE_GLOBAL_EVENTS.toggle_hidden_columns,
			onChangeHiddenColumns,
		);

		return () => {
			EventBus.on(TABLE_GLOBAL_EVENTS.set_column_order, onChangeColumnOrder);
			EventBus.on(
				TABLE_GLOBAL_EVENTS.toggle_hidden_columns,
				onChangeHiddenColumns,
			);
		};
	}, [name]);

	useEffectAfterMount(() => {
		onSortChanged && onSortChanged(state.sorting);
	}, [state.sorting]);

	useEffect(() => {
		if (!name) return;

		const settings = manageTableSettings.getSavedSettings<{
			columns?: ColumnOrder[];
		}>(name);
		const savedColumnSettings = settings.columns;
		tableInstance.toggleAllColumnsVisible(true);

		if (!savedColumnSettings) {
			return;
		}

		const updatedVisibilityState = {};

		savedColumnSettings.forEach((column) => {
			updatedVisibilityState[column.id] = column.visible ?? true;
		});
		tableInstance.setColumnVisibility((state) => {
			const updatedData = {};

			for (const columnName in state) {
				updatedData[columnName] = true;
			}

			return {
				...updatedData,
				...updatedVisibilityState,
			};
		});

		tableInstance.setColumnOrder((state) => [
			'select',
			...savedColumnSettings.flatMap(({ id }) => id),
		]);
	}, [name, columns]);

	useImperativeHandle(innerRef, () => {
		return {
			onResetSelectedRows,
		};
	});

	const handleRowClick = useEvent((option) => (e) => {
		onRowClick && onRowClick(e, option);
	});

	const handleChangePageSize = (size: number) => {
		setState((prevState) => ({
			...prevState,
			pagination: {
				...prevState.pagination,
				pageSize: size,
			},
		}));

		name && manageTableSettings.saveSettingsInLS(name, { pageSize: size });

		onChangePageSize && onChangePageSize(size);
	};

	const handleSelectRow =
		(row: Row<Data>) => (e: React.ChangeEvent<HTMLInputElement>) => {
			onSelectRow && onSelectRow(row);
		};

	const isChildrenFunc = typeof children === 'function';

	return (
		<>
			<TableContainer>
				<TableWrapper>
					<TableRoot style={{ minWidth: tableInstance.getTotalSize() }}>
						<TableHeader>
							{tableInstance.getHeaderGroups().map((headerGroup) => {
								return (
									<tr key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											const sorted = header.column.getIsSorted();

											return (
												<HeaderCell
													key={header.id}
													style={{
														width: header.getSize(),
														maxWidth: header.column.columnDef.maxSize,
														minWidth: header.column.columnDef.minSize,
														cursor: header.column.getCanSort()
															? 'pointer'
															: undefined,
													}}
													onClick={header.column.getToggleSortingHandler()}
												>
													<HeaderCellContent>
														<HeaderCellContentText>
															{header.isPlaceholder
																? null
																: flexRender(
																		header.column.columnDef.header,
																		header.getContext(),
																  )}
														</HeaderCellContentText>

														{sorted && (
															<SortIcon
																icon={
																	sorted === 'desc'
																		? ICON_COLLECTION.chevron_down
																		: ICON_COLLECTION.chevron_top
																}
															/>
														)}
													</HeaderCellContent>
												</HeaderCell>
											);
										})}
									</tr>
								);
							})}
						</TableHeader>
						<TableBody>
							{tableInstance.getRowModel().rows.map((row) => {
								return (
									<Fragment key={row.id}>
										<TableRow
											onClick={handleRowClick(row)}
											className={clsx({ 'is-selected': row.getIsSelected() })}
										>
											{row.getVisibleCells().map((cell) => {
												return (
													<RowBodyCell
														as="td"
														key={cell.id}
														style={{
															width: cell.column.getSize(),
															maxWidth: cell.column.columnDef.maxSize,
															minWidth: cell.column.columnDef.minSize,
														}}
													>
														<RowCellContent>
															{flexRender(
																cell.column.columnDef.cell,
																cell.getContext(),
															)}
														</RowCellContent>
													</RowBodyCell>
												);
											})}
										</TableRow>

										{renderSubComponent && row.getIsExpanded() && (
											<TableSubRow className="sub-row">
												<td colSpan={row.getVisibleCells().length}>
													{renderSubComponent({ row })}
												</td>
											</TableSubRow>
										)}
									</Fragment>
								);
							})}
						</TableBody>
					</TableRoot>
				</TableWrapper>
				{!!data.length && hasPagination && (
					<TableFooter>
						<Pagination
							itemsCount={totalItems}
							page={page}
							pageSize={state?.pagination?.pageSize}
							totalPages={totalPages}
							onChangePage={onChangePage}
							onChangePageSize={handleChangePageSize}
						/>
					</TableFooter>
				)}
			</TableContainer>
			{isChildrenFunc &&
				children({
					state: tableInstance.getState(),
					toggleAllRowsSelected,
				})}
		</>
	);
};

export const Table = React.memo(TableComponent) as <
	Data extends object,
	Value = unknown,
>(
	p: TableProps<Data, Value>,
) => JSX.Element;
