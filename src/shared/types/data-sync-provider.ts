import { LanguageTypes } from 'shared/types/users';

export interface IDataSyncProvider {
	id: number;
	name: string;
	comment: string;
	destination: string;
	sqlCreate: string;
	sqlInsert: string;
	sqlUpdate: string;
	scheduleAt: number;
	priorRun: string;
	configuration: Array<IDataSyncProviderConfiguration>;
	createdBy: number;
	createdOn: string;
	modifiedBy: number;
	modifiedOn: string;
	scheduleId: number;
	providerTypeId: number;
	multilingual: Record<'name' | 'comment', Record<LanguageTypes, string>>;
}

export interface IDataSyncProviderConfiguration {
	id: number;
	provider: string;
	name: string;
	value: string;
	providerId: number;
}

export interface IDataSyncProviderType {
	id: number;
	clazz: string;
	name: string;
	configurations: Array<string>;
}
