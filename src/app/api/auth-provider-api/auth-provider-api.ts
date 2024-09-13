import { BaseHttpServices } from 'shared/services/base-http-services';

import { getAuthProviderApiErrorMessage } from 'app/api/auth-provider-api/auth-provider-api-error';
import { FindEntityRequest, FindEntityResponse } from 'app/api/types';

import {
	IAuthProvider,
	IAuthProviderConfig,
	IAuthProviderType,
	IAuthSyncSchedule,
	ISyncType,
} from 'shared/types/auth-provider';
import { LanguageTypes } from 'shared/types/users';

export interface CreateAuthProviderDto {
	multilingual: {
		name?: Partial<Record<LanguageTypes, string | undefined>>;
		comment?: Partial<Record<LanguageTypes, string | undefined>>;
	};
	name?: string;
	comment?: string;
	createOn?: number;
	synchronizeOn?: number;
	mappings?: Record<string, string>;
}

export interface UpdateAuthProviderDto extends Partial<CreateAuthProviderDto> {
	id: number;
}

export interface DeleteAuthProviderDto {
	id: number;
}

export interface SyncAuthProviderDto {
	id: number;
}

interface GetAuthProviderByIdDto {
	id: number;
}

interface GetProviderConfigByIdDto {
	id: number;
}

export type FindAuthProvidersDto = FindEntityRequest;

interface AuthProviderApiInterface {
	createProvider: (data: CreateAuthProviderDto) => Promise<IAuthProvider>;
	updateProvider: (data: UpdateAuthProviderDto) => Promise<IAuthProvider>;
	deleteProvider: (data: DeleteAuthProviderDto) => Promise<void>;
	syncProvider: (data: SyncAuthProviderDto) => Promise<void>;
	getProviderById: (data: GetAuthProviderByIdDto) => Promise<IAuthProvider>;
	getProviderList: () => Promise<IAuthProvider[]>;
	findProviders: (
		params: FindAuthProvidersDto,
	) => Promise<FindEntityResponse<IAuthProvider[]>>;
	getSyncTypeList: () => Promise<ISyncType[]>;
	getProviderTypeList: () => Promise<IAuthProviderType[]>;
	getSyncScheduleList: () => Promise<IAuthSyncSchedule[]>;
	getProviderConfigById: (
		data: GetProviderConfigByIdDto,
	) => Promise<IAuthProviderConfig[]>;
}

export class AuthProviderApiService implements AuthProviderApiInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
		this.http.getErrorMessage = (message) =>
			getAuthProviderApiErrorMessage(message);
	}

	createProvider = async (
		data: CreateAuthProviderDto,
	): Promise<IAuthProvider> => {
		const payload = await this.http.post(`/api/coreauthprovider`, data);

		return payload.data.data;
	};

	updateProvider = async ({
		id,
		...data
	}: UpdateAuthProviderDto): Promise<IAuthProvider> => {
		const payload = await this.http.put(`/api/coreauthprovider/${id}`, data);

		return payload.data.data;
	};

	deleteProvider = async ({ id }: DeleteAuthProviderDto): Promise<void> => {
		const payload = await this.http.delete(`/api/coreauthprovider/${id}`);

		return payload.data.data;
	};

	syncProvider = async ({ id }: SyncAuthProviderDto): Promise<void> => {
		const payload = await this.http.put(`/api/coreauthprovider/sync/${id}`);

		return payload.data.data;
	};

	getProviderById = async ({
		id,
	}: GetAuthProviderByIdDto): Promise<IAuthProvider> => {
		const payload = await this.http.get(`/api/coreauthprovider/${id}`);

		return payload.data.data;
	};

	getProviderList = async (): Promise<IAuthProvider[]> => {
		const payload = await this.http.get(`/api/coreauthprovider`);

		return payload.data.data;
	};

	findProviders = async ({
		signal,
		...params
	}: FindAuthProvidersDto): Promise<FindEntityResponse<IAuthProvider[]>> => {
		const payload = await this.http.post(`/api/coreauthprovider/find`, params, {
			signal,
		});

		return payload.data.data;
	};

	getSyncTypeList = async (): Promise<ISyncType[]> => {
		const payload = await this.http.get(`/api/coresynctype`);

		return payload.data.data;
	};

	getSyncScheduleList = async (): Promise<IAuthSyncSchedule[]> => {
		const payload = await this.http.get(`/api/coreschedule`);

		return payload.data.data;
	};

	getProviderTypeList = async (): Promise<IAuthProviderType[]> => {
		const payload = await this.http.get(`/api/coreauthprovidertype`);

		return payload.data.data;
	};

	getProviderConfigById = async ({
		id,
	}: GetProviderConfigByIdDto): Promise<IAuthProviderConfig[]> => {
		const payload = await this.http.get(
			`/api/coreauthproviderconfig/provider/${id}`,
		);

		return payload.data.data;
	};
}

export const AuthProviderApi = new AuthProviderApiService(
	new BaseHttpServices(),
);
