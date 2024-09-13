import { endOfMonth, startOfMonth } from 'date-fns';
import { BaseHttpServices } from 'shared/services/base-http-services';

import {
	IApprovedListRequest,
	IApprovedListResponse,
	IDashboardStatusStats,
	ITotalRequest,
} from 'shared/types/dashboard';

export enum DASHBOARD_VALUES {
	TOP_APPROVERS = 'TopAppover',
	SAVED_DISKSPACE = 'Saved Diskspace',
	KEY_FINALSTATE = 'finalstate',
	KEY_RDA_ITEM_STATE = 'itemstate',
	REVIEW_REQUESTED = 'Review Requested',
	REVIEW_ITEM_STATUS = 'Reviewed Item Status',
	REVIEW_DURATION = 'ReviewDuration',
	RDA_ITEM_APPROVED = 'Approved',
	RDA_ITEM_REJECTED = 'Rejected',
	RDA_WORKPACKAGE_COMPLETED_ONTIME = 'RDAWorkPackageCompletedOntime',
	RDA_WORKPACKAGE_COMPLETED_LATE = 'RDAWorkPackageCompletedLate',
}

export enum DASHBOARD_MODIFIERS {
	MODIFIER_MATCH = 'equal',
	MODIFIER_CONTAIN = 'contain',
	MODIFIER_BETWEEN = 'between',
	MODIFIER_BEGIN = 'begin',
	MODIFIER_END = 'end',
}

export enum DASHBOARD_FIELDS {
	FIELD_NAME = 'name',
	FIELD_PERIOD = 'period',
}

interface DashboardApiInterface {
	statusStats: () => Promise<IDashboardStatusStats>;
	// diskSpaceSaved: (
	// 	requestData: IApprovedListRequest,
	// ) => Promise<IApprovedListResponse[]>;
	rejectionsTotalRecordReview: (
		requestData: IApprovedListRequest,
	) => Promise<IApprovedListResponse[]>;
	topApproversThisMonth: (
		requestData: IApprovedListRequest,
	) => Promise<IApprovedListResponse[]>;
	totalList: (requestData: ITotalRequest) => Promise<any>;
	diskSpaceSaved: (requestData: ITotalRequest) => Promise<any>;
	test2: () => Promise<any>;
	test3: () => Promise<any>;
}

export class DashboardApiService implements DashboardApiInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
	}

	statusStats = async (): Promise<IDashboardStatusStats> => {
		const payload = await this.http.get('/api/dashboard/packagecountbystatus');

		return payload.data.data;
	};

	// diskSpaceSaved = async (
	// 	requestData: IApprovedListRequest,
	// ): Promise<IApprovedListResponse[]> => {
	// 	const payload = await this.http.post(
	// 		'/api/dashboard/find/statistic',
	// 		requestData,
	// 	);

	// 	return payload.data.data.results;
	// };

	rejectionsTotalRecordReview = async (
		requestData: IApprovedListRequest,
	): Promise<IApprovedListResponse[]> => {
		const payload = await this.http.post(
			'/api/dashboard/find/statistic',
			requestData,
		);

		return payload.data.data.results;
	};

	topApproversThisMonth = async (
		requestData: IApprovedListRequest,
	): Promise<IApprovedListResponse[]> => {
		const payload = await this.http.post(
			'/api/dashboard/find/statistic',
			requestData,
		);
		return payload.data.data.results;
	};

	totalList = async (requestData: ITotalRequest): Promise<any> => {
		const payload = await this.http.post('/api/dashboard/totals', requestData);

		return payload.data.data;
	};

	diskSpaceSaved = async (requestData: ITotalRequest): Promise<any> => {
		const payload = await this.http.post('/api/dashboard/totals', requestData);

		return payload.data.data;
	};

	test2 = async (): Promise<any> => {
		const data: any = {
			orderBy: '',
			elements: [
				{
					fields: ['name'],
					modifier: DASHBOARD_MODIFIERS.MODIFIER_MATCH,
					values: ['TopAppover'],
				},
				{
					fields: ['period'],
					modifier: DASHBOARD_MODIFIERS.MODIFIER_BETWEEN,
					values: [startOfMonth(new Date()), endOfMonth(new Date())],
				},
			],
			page: 1,
			pageSize: 1000,
		};
		const payload = await this.http.post('/api/dashboard/find/statistic', data);
		console.log('test2');
		console.log(payload.data.data);
	};
	test3 = async (): Promise<any> => {
		const data: any = {
			orderBy: '',
			elements: [],
			page: 1,
			pageSize: 1000,
		};
		const payload = await this.http.post('/api/dashboard/find/statistic', data);
		console.log('test3');
		let test = [...payload.data.data.results];
		test = test.splice(174, 100);
		console.log(test);
	};
}

export const DashboardApi = new DashboardApiService(new BaseHttpServices());
