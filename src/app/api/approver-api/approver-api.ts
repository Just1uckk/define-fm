import { BaseHttpServices } from 'shared/services/base-http-services';

import { FindEntityRequest, FindEntityResponse } from 'app/api/types';

import { IApprovalHistory, IApprover } from 'shared/types/dispositions';

import { APPROVER_STATES } from 'shared/constants/constans';

export interface GetRdaApproversByIdDto {
	id: number;
}
export interface GetApprovalHistoryByIdDto {
	id: number;
}

export type FindApproversDto = FindEntityRequest;

export interface FindRdaApproversDto {
	rdaId?: number;
	state?: APPROVER_STATES;
}

export interface CreateApproverDto {
	rdaId: number;
	conditionalApprover: 0 | 1;
	userId: number;
	orderBy: number;
	assignedDate: Date;
}

export type UpdateApproverDto = Partial<IApprover>;

export interface DeleteApproverDto {
	approverId: number;
}

export interface ReassignApproverDto {
	rdaApproverId: number;
	userIdToAssign: number;
	comment?: string;
	emailComment: boolean;
}

export interface CompleteApproverDto {
	rdaApproverId: number;
}

interface ApproverApiInterface {
	getRdaApproversById: (data: GetRdaApproversByIdDto) => Promise<IApprover[]>;
	getApprovalHistoryById: (
		data: GetApprovalHistoryByIdDto,
	) => Promise<IApprovalHistory[]>;
	createApprover: (data: CreateApproverDto) => Promise<IApprover>;
	updateApprover: (data: UpdateApproverDto) => Promise<IApprover>;
	reassignApprover: (data: ReassignApproverDto) => Promise<IApprover>;
	completeApprover: (data: CompleteApproverDto) => Promise<IApprover>;
}

export class ApproverApiService implements ApproverApiInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
	}

	find = async ({
		signal,
		...payload
	}: FindApproversDto): Promise<FindEntityResponse<IApprover[]>> => {
		const res = await this.http.post(`/api/rdaapprover/find`, payload, {
			signal,
		});

		return res.data.data;
	};

	getRdaApproversById = async ({
		id,
	}: GetRdaApproversByIdDto): Promise<IApprover[]> => {
		const payload = await this.http.get(`/api/rdaapprover/rdaid/${id}`);

		return payload.data.data;
	};

	getApprovalHistoryById = async ({
		id,
	}: GetRdaApproversByIdDto): Promise<IApprovalHistory[]> => {
		const payload = await this.http.get(
			`/api/rdaitemapprovalhistory/find/?itemId=${id}`,
		);

		return payload.data.data;
	};

	findRdaApprovers = async (
		params: FindRdaApproversDto,
	): Promise<IApprover[]> => {
		const payload = await this.http.get(`/api/rdaapprover/find`, { params });

		return payload.data.data;
	};

	createApprover = async (data: CreateApproverDto): Promise<IApprover> => {
		const payload = await this.http.post(`/api/rdaapprover`, data);

		return payload.data.data;
	};

	updateApprover = async ({
		approverId,
		...data
	}: UpdateApproverDto): Promise<IApprover> => {
		const payload = await this.http.put(`/api/rdaapprover/${approverId}`, data);

		return payload.data.data;
	};

	deleteApprover = async ({
		approverId,
	}: DeleteApproverDto): Promise<IApprover> => {
		const payload = await this.http.delete(`/api/rdaapprover/${approverId}`);

		return payload.data.data;
	};

	reassignApprover = async (data: ReassignApproverDto): Promise<IApprover> => {
		const payload = await this.http.post(`/api/rdaapprover/reassign`, data);

		return payload.data.data;
	};

	completeApprover = async (data: CompleteApproverDto): Promise<IApprover> => {
		const payload = await this.http.post(`/api/rdaapprover/complete`, data);

		return payload.data.data;
	};
}

export const ApproverApi = new ApproverApiService(new BaseHttpServices());
