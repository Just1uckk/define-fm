import { LocalStorageService } from 'shared/services/local-storage-service';

class MemoryManagingTableSettingsService {
	getSavedSettings(tableName: string) {
		const settings = LocalStorageService.get('table-settings');
		if (!settings) return {};

		const tableSettings = settings[tableName] || {};

		return tableSettings;
	}

	saveSettingsInLS(tableName: string, settings: object) {
		const currentSettings = LocalStorageService.get('table-settings');

		const parsedSettings = currentSettings || {};
		const oldTableSettings = parsedSettings[tableName] || {};

		parsedSettings[tableName] = {
			...oldTableSettings,
			...settings,
		};

		LocalStorageService.set('table-settings', JSON.stringify(parsedSettings));
	}

	removeSavedSettings(tableName: string) {
		LocalStorageService.remove('table-settings');
	}
}

export const MemoryManagingTableSettings =
	new MemoryManagingTableSettingsService();
