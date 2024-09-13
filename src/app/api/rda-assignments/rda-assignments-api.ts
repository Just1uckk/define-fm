import { BaseHttpServices } from 'shared/services/base-http-services';

import { getRdaAssignmentsApiErrorMessage } from 'app/api/rda-assignments/rda-assignments-api-errors';
import { FindEntityRequest, FindEntityResponse } from 'app/api/types';

import { IRdaAssignmentItem } from 'shared/types/dispositions';

import { RDA_ASSIGNMENT_ITEM_STATES } from 'shared/constants/constans';

export type FindRdaAssignmentFilesDto = FindEntityRequest;

interface FindRdaAssignmentById {
	id: IRdaAssignmentItem['id'];
}

export interface ApproveFileDto {
	rdaItemApprovals: Array<string | number>;
	state: RDA_ASSIGNMENT_ITEM_STATES;
}

export interface MoveToPendingFilesDto {
	rdaItemApprovals: Array<string | number>;
	state: RDA_ASSIGNMENT_ITEM_STATES.PENDING;
}

interface RdaAssignmentsApiServiceInterface {
	findOneById: (params: FindRdaAssignmentById) => Promise<IRdaAssignmentItem>;
	findAssignmentItems: (
		params: FindRdaAssignmentFilesDto,
	) => Promise<FindEntityResponse<IRdaAssignmentItem[]>>;
	approveFile: (payload: ApproveFileDto) => Promise<void>;
	moveToPendingFile: (payload: MoveToPendingFilesDto) => Promise<void>;
}

export class RdaAssignmentsApiService
	implements RdaAssignmentsApiServiceInterface
{
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
		this.http.getErrorMessage = (message: string) =>
			getRdaAssignmentsApiErrorMessage(message);
	}

	findOneById = async ({
		id,
	}: FindRdaAssignmentById): Promise<IRdaAssignmentItem> => {
		const payload = await this.http.get(`/api/rdaitemapproval/${id}`);

		return payload.data.data;
	};

	findAssignmentItems = async ({
		signal,
		...params
	}: FindRdaAssignmentFilesDto): Promise<
		FindEntityResponse<IRdaAssignmentItem[]>
	> => {
		const payload = await this.http.post(`/api/rdaitemapproval/find`, params, {
			signal: signal,
		});

		return payload.data.data;
	};

	approveFile = async (data: ApproveFileDto): Promise<void> => {
		return this.http.post(`/api/rdaitemapproval/decide`, data);
	};

	moveToPendingFile = async (data: MoveToPendingFilesDto): Promise<void> => {
		return this.http.post(`/api/rdaitemapproval/decide`, data);
	};
}

export const RdaAssignmentsApi = new RdaAssignmentsApiService(
	new BaseHttpServices(),
);
