import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';

export function useManageTableSettings() {
	function getSavedSettings<T = object>(tableName): T {
		return MemoryManagingTableSettings.getSavedSettings(tableName);
	}

	const saveSettingsInLS = (tableName: string, settings: object) => {
		MemoryManagingTableSettings.saveSettingsInLS(tableName, settings);
	};

	return {
		saveSettingsInLS,
		getSavedSettings,
	};
}
