import React, { useMemo } from 'react';
import { flatMap, keyBy, map, union } from 'lodash';
import {
	ColumnOrder,
	ManageTableColumnsModal,
} from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import { useStateModalManager } from 'shared/context/modal-manager';
import { EventBus, TABLE_GLOBAL_EVENTS } from 'shared/utils/event-bus';

import { MANAGE_TABLE_COLUMNS } from 'shared/constants/modal-names';

import { useManageTableSettings } from 'shared/hooks/use-manage-table-settings';

import { Modal } from 'shared/components/modal';

interface UseManageTableColumnsProps {
	tableName?: string;
	columns?: Record<ColumnOrder['id'], ColumnOrder>;
}

export function useManageTableColumns(params: UseManageTableColumnsProps) {
	const { tableName, columns = {} } = params;
	const allIds = Object.values(columns);
	const manageTableSettings = useManageTableSettings();
	const modalState = useStateModalManager(MANAGE_TABLE_COLUMNS);
	manageTableSettings.saveSettingsInLS(tableName!, {
		columns: allIds.map((column) => ({
			id: column.id,
			visible: column.visible,
		})),
	});

	const onSubmitForm = (columns: ColumnOrder[]) => {
		if (!tableName) {
			modalState.close();
			return;
		}

		const columnIds = columns.map((column) => column.id);

		EventBus.emit(TABLE_GLOBAL_EVENTS.set_column_order, {
			tableName,
			order: columnIds,
		});
		EventBus.emit(TABLE_GLOBAL_EVENTS.toggle_hidden_columns, {
			tableName,
			columns,
		});

		manageTableSettings.saveSettingsInLS(tableName, {
			columns: columns.map((column) => ({
				id: column.id,
				visible: column.visible,
			})),
		});

		modalState.close();
	};

	const onManage = () => {
		modalState.openModal();
	};

	const parsedColumns = useMemo(() => {
		if (!modalState.open) {
			return [];
		}

		const settings = manageTableSettings.getSavedSettings<{
			columns?: ColumnOrder[];
		}>(tableName);
		const savedColumnSettings = settings.columns;

		if (!savedColumnSettings) {
			return map(columns, (column: ColumnOrder) => column);
		}

		const sortedSavedColumns = keyBy(savedColumnSettings, 'id');
		const sortedPassedColumns = keyBy(columns, 'id');
		const savedColumnIds = flatMap(savedColumnSettings, (column) => column.id);
		const passedColumnIds = flatMap(columns, (column) => column.id);
		const uniqIds = union(savedColumnIds, passedColumnIds);

		const updatedList = uniqIds.map((columnId: ColumnOrder['id']) => {
			const savedColumn = sortedSavedColumns[columnId];

			if (savedColumn) {
				return {
					...sortedPassedColumns[columnId],
					...savedColumn,
				};
			}

			return {
				...sortedPassedColumns[columnId],
				visible: true,
			};
		});

		return updatedList;
	}, [tableName, columns, modalState.open]);

	const modal = (
		<Modal.Root
			placement="center"
			fulfilled
			open={modalState.open}
			onClose={modalState.close}
		>
			<ManageTableColumnsModal
				columns={parsedColumns}
				onSubmit={onSubmitForm}
			/>
		</Modal.Root>
	);

	return {
		modal,
		onManage,
	};
}
