import { LanguageTypes } from 'shared/types/users';

export interface IAuthProvider {
	id: number;
	comment: string;
	configs: Omit<IAuthProviderConfig, 'id'>[];
	createOn: 0 | 1;
	loadOrder: number;
	multilingual: Record<'name' | 'comment', Record<LanguageTypes, string>>;
	name: string;
	typeName: string;
	priorRun: string;
	synchronizeOn: 0 | 1;
	passwordMutable: boolean;
	type: number;
	createdBy: number;
	createdOn: string;
	mappings: Record<string, string> | null;
	modifiedBy: 1;
	modifiedOn: string;
	removable: boolean;
	syncable: boolean;
}

export interface ISyncType {
	id: number;
	name: string;
	clazz: string;
}

export interface IAuthSyncSchedule {
	id: number;
	name: string;
	valueMin: number;
	valueMax: number;
}

export interface IAuthProviderType {
	id: number;
	name: string;
	clazz: string;
	configurations: string[];
	removable: boolean;
	syncable: boolean;
	singleton: boolean;
	instanceCount: number;
}

export interface IAuthProviderConfig {
	id: number;
	configKey: string;
	configValue: string | null;
	providerId: number;
}
