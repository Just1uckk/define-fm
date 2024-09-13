import { BaseHttpServices } from 'shared/services/base-http-services';

import { FindEntityRequest, FindEntityResponse } from 'app/api/types';
import { getUsersApiErrorMessage } from 'app/api/user-api/user-api-error';

import { IGroup } from 'shared/types/group';
import { IUser, IUsersCount } from 'shared/types/users';

export interface CreateUserDto {
	username: string;
	enabled?: boolean;
	display: string;
	password: string;
	email: string;
	providerId: number;
	groups: string[];
}

export interface UpdateUserDto extends Partial<Omit<IUser, 'id'>> {
	id: number;
}

export interface DeleteUserDto {
	id: number;
}

export interface GetUserByUsernameDto {
	username: string;
}

export interface GetUserGroupsByUsernameDto {
	username: string;
}

export interface SetUserAvatarDto {
	id: number;
	file: File;
}

export interface DeleteUserAvatarDto {
	id: number;
}

export interface GetUsersDto {
	signal?: AbortSignal;
}

export type FindUsersDto = FindEntityRequest;

interface UserApiInterface {
	createUser: (data: CreateUserDto) => Promise<IUser>;
	updateUser: (data: UpdateUserDto) => Promise<IUser>;
	deleteUser: (data: DeleteUserDto) => Promise<any>;
	getUserByUsername: (data: GetUserByUsernameDto) => Promise<IUser>;
	getUsers: (data: GetUsersDto) => Promise<IUser[]>;
	findUsers: (data: FindUsersDto) => Promise<FindEntityResponse<IUser[]>>;
	getUsersCount: () => Promise<IUsersCount[]>;
	getUserById: (data: { id: number }) => Promise<IUser>;
	getUserGroupsByUsername: (
		data: GetUserGroupsByUsernameDto,
	) => Promise<IGroup[]>;
	setAvatar: (data: SetUserAvatarDto) => Promise<IUser>;
	deleteAvatar: (data: DeleteUserAvatarDto) => Promise<IUser>;
}

export class UserApiService implements UserApiInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
		this.http.getErrorMessage = (message) => getUsersApiErrorMessage(message);
	}

	createUser = async (data: CreateUserDto): Promise<IUser> => {
		const payload = await this.http.post(
			`/api/coreuser`,
			data,
			undefined,
			false,
		);

		return payload.data.data;
	};

	updateUser = async ({ id, ...rest }: UpdateUserDto): Promise<IUser> => {
		const payload = await this.http.put(
			`/api/coreuser/${id}`,
			rest,
			undefined,
			false,
		);

		return payload.data.data;
	};

	deleteUser = async ({ id }: DeleteUserDto) => {
		const payload = await this.http.delete(`/api/coreuser/${id}`);

		return payload.data.data;
	};

	getUserByUsername = async ({
		username,
	}: GetUserByUsernameDto): Promise<IUser> => {
		const payload = await this.http.get(`/api/coreuser/username/${username}`);

		return payload.data.data;
	};

	getUsers = async ({ signal }: GetUsersDto): Promise<IUser[]> => {
		const payload = await this.http.get(`/api/coreuser`, { signal });

		return payload.data.data;
	};

	findUsers = async ({
		signal,
		...params
	}: FindUsersDto): Promise<FindEntityResponse<IUser[]>> => {
		const payload = await this.http.post(`/api/coreuser/find`, params, {
			signal,
		});

		return payload.data.data;
	};

	getUsersCount = async (): Promise<IUsersCount[]> => {
		const payload = await this.http.get(`/api/coreuser/counts`);

		return payload.data.data;
	};

	getUserById = async ({ id }: { id: number }): Promise<IUser> => {
		const payload = await this.http.get(`/api/coreuser/${id}`);

		return payload.data.data;
	};

	getUsersByName = async (username: string): Promise<IUser[]> => {
		const payload = await this.http.get(`/api/coreuser/username/${username}`);

		return payload.data.data;
	};

	getUserGroupsByUsername = async ({
		username,
	}: GetUserGroupsByUsernameDto): Promise<IGroup[]> => {
		const payload = await this.http.get(
			`/api/coregroupuser/username/${username}`,
		);

		return payload.data.data;
	};

	setAvatar = async ({ id, file }: SetUserAvatarDto): Promise<IUser> => {
		const data = new FormData();
		data.set('file', file);

		const payload = await this.http.post(
			`/api/coreuser/profile/image/${id}`,
			data,
		);

		return payload.data.data;
	};

	deleteAvatar = async ({ id }: DeleteUserAvatarDto): Promise<IUser> => {
		const payload = await this.http.delete(`/api/coreuser/profile/image/${id}`);

		return payload.data.data;
	};
}

export const UserApi = new UserApiService(new BaseHttpServices());
