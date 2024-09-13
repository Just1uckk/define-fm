import fileDownload from 'js-file-download';
import { BaseHttpServices } from 'shared/services/base-http-services';

import { getDispositionsApiErrorMessage } from 'app/api/dispositions-api/disposition-api-error';
import { FindEntityRequest, FindEntityResponse } from 'app/api/types';

import { IDispositionSearchSnapshot } from 'shared/types/disposition-search';
import {
	IDispositionTableTab,
	IExtensionReason,
	IWorkPackage,
} from 'shared/types/dispositions';
import { LanguageTypes } from 'shared/types/users';

import { DISPOSITION_WORKFLOW_STATES } from 'shared/constants/constans';

type DispositionStatusCountsResp = Record<string, number>;

export type FindDispositionsDto = FindEntityRequest;

export interface CreateDispositionDto {
	name?: string;
	multilingual: Record<
		'name' | 'approveButtonLabel' | 'rejectButtonLabel' | 'instructions',
		Record<LanguageTypes, string>
	>;
	autoprocessApprovedItems: 0 | 1;
	includeDefaultApprover: 0 | 1;
	numberOfDaysToComplete: number;
	rdaType: number;
	securityOverride: 0 | 1;
	snapshotDate: string;
	dispNodeId: number;
	sourceId: number;
	instructions?: string;
	approveButtonLabel?: string;
	rejectButtonLabel?: string;
	dispositionActionId: number;
}

export interface UpdateDispositionDto {
	id: number;
	name?: string;
	instructions?: string;
	numberOfDaysToComplete?: number;
	approveButtonLabel?: string;
	rejectButtonLabel?: string;
	securityOverride?: number | 0 | 1;
	autoprocessApprovedItems?: number | 0 | 1;
	workflowStatus?: DISPOSITION_WORKFLOW_STATES;
}

export interface DeleteDispositionDto {
	id: number;
}

export interface InitiateDispositionDto {
	id: number;
}

export interface ForceDispositionsDto {
	rdaIdsToForce: Array<IWorkPackage['id']>;
}

export interface RecallDispositionsDto {
	rdaIdsToRecall: Array<IWorkPackage['id']>;
	comment: string;
}

export interface GetDispositionDto {
	id: number;
}

export interface GetDispositionSnapshotDto {
	id: number;
}

export interface RejectAndExtendDto {
	rdaItemApprovals: number[];
	reason?: string;
	comment?: string;
	state?: 2;
	overrideComment?: string;
}

export interface RejectAndExtendOverrideDto {
	rdaItems: number[];
	reason?: string;
	comment?: string;
	state?: 2;
	overrideComment?: string;
}

export interface RequestFeedbackDto {
	rdaItemApprovals: number[];
	feedbackUsers: number[];
	comment: string;
	state: 3;
}

export interface CompleteDispositionDto {
	rdaIdsToComplete: Array<number>;
}

export interface GenerateAuditDto {
	id: number;
	name: string;
}

interface DispositionsApiInterface {
	getExtensionReasonList: () => Promise<IExtensionReason[]>;
	getDispositionStatusCounts: () => Promise<DispositionStatusCountsResp>;
	getDispositionTableTabs: () => Promise<IDispositionTableTab[]>;
	findDispositions: (
		params: FindDispositionsDto,
	) => Promise<FindEntityResponse<IWorkPackage[]>>;
	getDispositions: () => Promise<IWorkPackage[]>;
	getDisposition: (payload: GetDispositionDto) => Promise<IWorkPackage>;
	getDispositionSnapshot: (
		payload: GetDispositionSnapshotDto,
	) => Promise<IDispositionSearchSnapshot>;
	createWorkPackage: (payload: CreateDispositionDto) => Promise<IWorkPackage>;
	deleteWorkPackage: (payload: DeleteDispositionDto) => Promise<IWorkPackage>;
	initiateWorkPackage: (
		payload: InitiateDispositionDto,
	) => Promise<IWorkPackage>;
	forceDispositions: (payload: ForceDispositionsDto) => Promise<IWorkPackage[]>;
	recallDispositions: (
		payload: RecallDispositionsDto,
	) => Promise<IWorkPackage[]>;
	rejectAndExtend: (payload: RejectAndExtendDto) => Promise<void>;
	requestFeedback: (payload: RequestFeedbackDto) => Promise<void>;
	completeDisposition: (
		payload: CompleteDispositionDto,
	) => Promise<IWorkPackage>;
	generateAudit: (payload: GenerateAuditDto) => Promise<void>;
	singleUsers: (ids: number[]) => Promise<any>;
}

export class DispositionsApiService implements DispositionsApiInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
		this.http.getErrorMessage = (message: string) =>
			getDispositionsApiErrorMessage(message);
	}

	getExtensionReasonList = async (): Promise<IExtensionReason[]> => {
		const payload = await this.http.get('/api/rdamain/extension/reasonlist');

		return payload.data.data;
	};

	getDispositionStatusCounts =
		async (): Promise<DispositionStatusCountsResp> => {
			const payload = await this.http.get('/api/rdamain/counts');

			return payload.data.data;
		};

	getDispositionTableTabs = async (): Promise<IDispositionTableTab[]> => {
		const payload = await this.http.get('/api/rdamain/tabs');

		return payload.data.data;
	};

	getDispositions = async (): Promise<IWorkPackage[]> => {
		const payload = await this.http.get('/api/rdamain');

		return payload.data.data;
	};

	findDispositions = async ({
		signal,
		...params
	}: FindDispositionsDto): Promise<FindEntityResponse<IWorkPackage[]>> => {
		const payload = await this.http.post('/api/rdamain/find', params, {
			signal,
		});

		return payload.data.data;
	};

	getDisposition = async ({ id }: GetDispositionDto): Promise<IWorkPackage> => {
		const payload = await this.http.get(`/api/rdamain/${id}`, undefined, false);

		return payload.data.data;
	};

	getDispositionSnapshot = async ({
		id,
	}: GetDispositionDto): Promise<IDispositionSearchSnapshot> => {
		const payload = await this.http.get(
			`/api/rdamain/${id}/rdadispositionsnapshot`,
		);

		return payload.data.data;
	};

	createWorkPackage = async (
		data: CreateDispositionDto,
	): Promise<IWorkPackage> => {
		const payload = await this.http.post('/api/rdamain', data);

		return payload.data.data;
	};

	initiateWorkPackage = async ({
		id,
	}: InitiateDispositionDto): Promise<IWorkPackage> => {
		const payload = await this.http.post(`/api/rdamain/initiate`, {
			id,
			workflowStatus: DISPOSITION_WORKFLOW_STATES.INITIATED,
		});

		return payload.data.data;
	};

	forceDispositions = async (
		data: ForceDispositionsDto,
	): Promise<IWorkPackage[]> => {
		const payload = await this.http.post('/api/rdamain/force', data);

		return payload.data.data;
	};

	recallDispositions = async (
		data: RecallDispositionsDto,
	): Promise<IWorkPackage[]> => {
		const payload = await this.http.post('/api/rdamain/recall', data);

		return payload.data.data;
	};

	updateDisposition = async ({
		id,
		...data
	}: UpdateDispositionDto): Promise<IWorkPackage> => {
		const payload = await this.http.put(`/api/rdamain/${id}`, data);

		return payload.data.data;
	};

	deleteWorkPackage = async ({
		id,
	}: DeleteDispositionDto): Promise<IWorkPackage> => {
		const payload = await this.http.delete(`/api/rdamain/${id}`);

		return payload.data.data;
	};

	rejectAndExtend = async (data: RejectAndExtendDto): Promise<void> => {
		const payload = await this.http.post(`/api/rdaitemapproval/decide`, data);

		return payload.data.data;
	};

	requestFeedback = async (data: RequestFeedbackDto): Promise<void> => {
		const payload = await this.http.post(
			`/api/rdaitemapproval/decidefeedback`,
			data,
		);

		return payload.data.data;
	};

	completeDisposition = async (
		data: CompleteDispositionDto,
	): Promise<IWorkPackage> => {
		const payload = await this.http.post(`/api/rdamain/complete`, data);

		return payload.data.data;
	};

	generateAudit = async (data: GenerateAuditDto): Promise<void> => {
		const payload = await this.http.get(`/api/rdamain/audit/${data.id}`, {
			responseType: 'blob',
		});

		await fileDownload(
			payload.data,
			data.name,
			payload.headers['content-type'],
		);
	};

	singleUsers = async (ids: number[]): Promise<any> => {
		const payload = await this.http.post(
			`/api/rdaapprover/commonfeedbackusers`,
			ids,
		);

		return payload.data.data;
	};
}

export const DispositionsApi = new DispositionsApiService(
	new BaseHttpServices(),
);
