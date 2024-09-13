import { BaseHttpServices } from 'shared/services/base-http-services';

import { getDataSyncProviderApiErrorMessage } from 'app/api/data-sync-provider-api/data-sync-provider-api-error';
import { FindEntityRequest, FindEntityResponse } from 'app/api/types';

import {
	IDataSyncProvider,
	IDataSyncProviderType,
} from 'shared/types/data-sync-provider';

interface GetDataSyncProviderById {
	id: number;
}

export interface CreateDataSyncProviderDto {
	name?: string;
	comment?: string;
	multilingual: IDataSyncProvider['multilingual'];
	destination?: string;
	scheduleId: number | null;
	configuration?: Array<{
		name: string;
		value?: string;
	}>;
	providerTypeId: number;
}

export interface UpdateDataSyncProviderDto {
	id: number;
	name?: string;
	comment?: string;
	multilingual: IDataSyncProvider['multilingual'];
	destination?: string;
	scheduleId: number | null;
	configuration?: Array<{
		name: string;
		value?: string;
	}>;
	providerTypeId: number;
}

export interface DeleteDataSyncProvider {
	id: number;
}

export type FindDataSyncProviderDto = FindEntityRequest;

export interface SyncDataSyncProviderDto {
	id: number;
}

interface DataSyncProviderApiInterface {
	getOne: (payload: GetDataSyncProviderById) => Promise<IDataSyncProvider>;
	createOne: (payload: CreateDataSyncProviderDto) => Promise<IDataSyncProvider>;
	updateOne: (payload: UpdateDataSyncProviderDto) => Promise<IDataSyncProvider>;
	deleteOne: (payload: DeleteDataSyncProvider) => Promise<void>;
	findAll: () => Promise<IDataSyncProvider[]>;
	find: (
		payload: FindDataSyncProviderDto,
	) => Promise<FindEntityResponse<IDataSyncProvider[]>>;
	getDataSyncProviderTypes: () => Promise<IDataSyncProviderType[]>;
	syncProvider: (payload: SyncDataSyncProviderDto) => Promise<void>;
}

export class DataSyncProviderApiService
	implements DataSyncProviderApiInterface
{
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
		this.http.getErrorMessage = (message) =>
			getDataSyncProviderApiErrorMessage(message);
	}

	getOne = async ({
		id,
	}: GetDataSyncProviderById): Promise<IDataSyncProvider> => {
		const payload = await this.http.get(`/api/coresyncprovider/${id}`);

		return payload.data.data;
	};

	deleteOne = async ({ id }: DeleteDataSyncProvider): Promise<void> => {
		const payload = await this.http.delete(
			`/api/coresyncprovider/${id}`,
			undefined,
			false,
		);

		return payload.data.data;
	};

	createOne = async (
		data: CreateDataSyncProviderDto,
	): Promise<IDataSyncProvider> => {
		const payload = await this.http.post(`/api/coresyncprovider`, data);

		return payload.data.data;
	};

	updateOne = async ({
		id,
		...data
	}: UpdateDataSyncProviderDto): Promise<IDataSyncProvider> => {
		const payload = await this.http.put(`/api/coresyncprovider/${id}`, data);

		return payload.data.data;
	};

	findAll = async (): Promise<IDataSyncProvider[]> => {
		const payload = await this.http.get(`/api/coresyncprovider`);

		return payload.data.data;
	};

	find = async ({
		signal,
		...payload
	}: FindDataSyncProviderDto): Promise<
		FindEntityResponse<IDataSyncProvider[]>
	> => {
		const resp = await this.http.post(`/api/coresyncprovider/find`, payload, {
			signal,
		});

		return resp.data.data;
	};

	getDataSyncProviderTypes = async (): Promise<IDataSyncProviderType[]> => {
		const payload = await this.http.get(`/api/coresyncprovidertype`);

		return payload.data.data;
	};

	syncProvider = async ({ id }: SyncDataSyncProviderDto): Promise<void> => {
		return this.http.put(`/api/coresyncprovider/sync/${id}`);
	};
}

export const DataSyncProviderApi = new DataSyncProviderApiService(
	new BaseHttpServices(),
);
