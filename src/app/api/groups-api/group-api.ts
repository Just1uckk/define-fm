import { BaseHttpServices } from 'shared/services/base-http-services';

import { getGroupApiErrorMessage } from 'app/api/groups-api/errors';
import { FindEntityRequest, FindEntityResponse } from 'app/api/types';

import { IGroup } from 'shared/types/group';
import { IUser } from 'shared/types/users';

export interface GetGroupByIdDto {
	id: number;
}

export type FindGroupsDto = FindEntityRequest;

export interface GetGroupsCountResponse {
	enabled: number;
	disabled: number;
	total: number;
}

export interface CreateGroupDto {
	name: string;
	comment?: string | null;
	enabled: boolean;
}

export interface UpdateGroupDto extends Partial<CreateGroupDto> {
	id: number;
}

export interface DeleteGroupDto {
	id: number;
}

export interface AddUserToGroupDto {
	group: IGroup;
	user: IUser;
}

export interface AddUserToGroupResponseDto {
	group: IGroup;
	user: IUser;
}

export interface DeleteUserFromGroupDto {
	groupId: number;
	userId: number;
	userName?: string;
	groupName?: string;
}

export interface DeleteUserFromGroupResponseDto {
	group: IGroup;
	user: IUser;
}

export interface GetGroupUsersByNameDto {
	name: string;
}

interface GroupApiInterface {
	getGroupList: () => Promise<IGroup[]>;
	getGroupById: (data: GetGroupByIdDto) => Promise<IGroup>;
	findGroups: (params: FindGroupsDto) => Promise<FindEntityResponse<IGroup[]>>;
	getGroupsCount: () => Promise<GetGroupsCountResponse>;
	createGroup: (data: CreateGroupDto) => Promise<IGroup>;
	updateGroup: (data: UpdateGroupDto) => Promise<IGroup>;
	deleteGroup: (data: DeleteGroupDto) => Promise<void>;
	addUserToGroup: (
		data: AddUserToGroupDto,
	) => Promise<AddUserToGroupResponseDto>;
	deleteUserFromGroup: (
		data: DeleteUserFromGroupDto,
	) => Promise<DeleteUserFromGroupResponseDto>;
	getGroupUsersByName: (data: GetGroupUsersByNameDto) => Promise<IUser[]>;
}

export class GroupApiService implements GroupApiInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
		this.http.getErrorMessage = (message: string) =>
			getGroupApiErrorMessage(message);
	}

	getGroupList = async (): Promise<IGroup[]> => {
		const payload = await this.http.get(`/api/coregroup`);

		return payload.data.data;
	};

	getGroupById = async ({ id }: GetGroupByIdDto): Promise<IGroup> => {
		const payload = await this.http.get(`/api/coregroup/${id}`);

		return payload.data.data;
	};

	findGroups = async ({
		signal,
		...params
	}: FindGroupsDto): Promise<FindEntityResponse<IGroup[]>> => {
		const payload = await this.http.post(`/api/coregroup/find`, params, {
			signal: signal,
		});

		return payload.data.data;
	};

	getGroupsCount = async (): Promise<GetGroupsCountResponse> => {
		const payload = await this.http.get(`/api/coregroup/counts`);

		return payload.data.data;
	};

	createGroup = async (data: CreateGroupDto): Promise<IGroup> => {
		const payload = await this.http.post(`/api/coregroup`, data);

		return payload.data.data;
	};

	updateGroup = async ({ id, ...data }: UpdateGroupDto): Promise<IGroup> => {
		const payload = await this.http.put(`/api/coregroup/${id}`, data);

		return payload.data.data;
	};

	deleteGroup = async ({ id }: DeleteGroupDto): Promise<void> => {
		const payload = await this.http.delete(`/api/coregroup/${id}`);
		return payload.data.data;
	};

	addUserToGroup = async (
		data: AddUserToGroupDto,
	): Promise<AddUserToGroupResponseDto> => {
		const payload = await this.http.post(`/api/coregroupuser`, data);
		return payload.data.data;
	};

	deleteUserFromGroup = async ({
		groupId,
		userId,
		userName,
		groupName,
	}: DeleteUserFromGroupDto): Promise<DeleteUserFromGroupResponseDto> => {
		const payload = await this.http.delete(`/api/coregroupuser`, {
			params: {
				groupid: groupId,
				userid: userId,
				groupname: groupName,
				username: userName,
			},
		});
		return payload.data.data;
	};

	getGroupUsersByName = async ({
		name,
	}: GetGroupUsersByNameDto): Promise<IUser[]> => {
		const payload = await this.http.get(`/api/coregroupuser/groupname/${name}`);
		const notDeletedUsers = payload.data.data.filter((user) => !user.deleted);

		return notDeletedUsers;
	};
}

export const GroupApi = new GroupApiService(new BaseHttpServices());
