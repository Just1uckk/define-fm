import { IUser } from './users';

export interface IDashboardStatusStats {
	late: number;
	completed: number;
	onTime: number;
}

export interface IApprovedListRequest {
	orderBy: string;
	elements: {
		fields: string[];
		modifier: string;
		values: string[] | number[] | Date[];
	}[];
	page: number;
	pageSize: number;
}

export interface IApprovedListResponse {
	id: number;
	name: string;
	statKey: string;
	value: number;
	period: Date;
	user?: IUser;
}

export interface ITotalRequest {
	name: string;
	start: Date;
	end: Date;
}

export interface UserParamsInterface extends IUser {
	count: number;
}
