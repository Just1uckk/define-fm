import { LanguageTypes } from 'shared/types/users';

export interface IDispositionSearch {
	id: number;
	name: string;
	query: string;
	createdBy: number;
	createdOn: string;
	modifiedBy: number;
	modifiedOn: string;
	snapshotCount: number;
	createdByDisplay: string;
	lastRun: string | null;
	lastRunCount: number | null;
	primaryProviderId: number;
	dispositionActionId: number;
	multilingual: Record<'name', Record<LanguageTypes, string>> | null;
	dataFields?: any[];
	deleted?: boolean;
}

export interface IDispositionSearchSnapshot {
	id: number;
	count: number;
	dispositionId: number;
	name: string;
	ready: boolean;
	snapdate: string;
	dateFields: Array<string>;
}

export type IDispositionSearchSnapshotItem = Record<string, any>;
