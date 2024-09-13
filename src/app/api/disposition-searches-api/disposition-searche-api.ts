import { BaseHttpServices } from 'shared/services/base-http-services';

import { getDispositionSearchApiErrorMessage } from 'app/api/disposition-searches-api/disposition-searche-api-error';
import { FindEntityRequest, FindEntityResponse } from 'app/api/types';

import {
	IDispositionSearch,
	IDispositionSearchSnapshot,
	IDispositionSearchSnapshotItem,
} from 'shared/types/disposition-search';
import { LanguageTypes } from 'shared/types/users';

export interface GetDispositionSearchDto {
	id: number;
}

export interface CreateDispositionSearchDto {
	name?: string;
	multilingual: Record<'name', Record<LanguageTypes, string>>;
	query: string;
	primaryProviderId: number;
	dispositionActionId: number;
}

export interface UpdateDispositionSearchDto {
	id: number;
	name?: string;
	multilingual: Record<'name', Record<LanguageTypes, string>>;
	query: string;
	primaryProviderId: number;
	dispositionActionId: number;
}

export interface DeleteDispositionSearchDto {
	id: number;
}

export type FindDispositionSearchesDto = FindEntityRequest;
export type FindDispositionSearchSnapshotsDto = FindEntityRequest;
export type FindDispositionSearchSnapshotItemsDto = FindEntityRequest;

export interface CreateDispositionSearchSnapshot {
	dispositionId: number;
}

export interface GetDispositionSearchSnapshotDto {
	id: number;
}

export interface DeleteDispositionSearchSnapshotDto {
	id: number;
}

interface DispositionsApiInterface {
	getOne: (data: GetDispositionSearchDto) => Promise<IDispositionSearch>;
	createOne: (data: CreateDispositionSearchDto) => Promise<IDispositionSearch>;
	updateOne: (data: UpdateDispositionSearchDto) => Promise<IDispositionSearch>;
	deleteOne: (data: DeleteDispositionSearchDto) => Promise<void>;
	findDispositionSearches: (
		params: FindDispositionSearchesDto,
	) => Promise<FindEntityResponse<IDispositionSearch[]>>;
	createSearchSnapshot: (
		data: CreateDispositionSearchSnapshot,
	) => Promise<IDispositionSearchSnapshot>;
	getSearchSnapshot: (
		data: GetDispositionSearchSnapshotDto,
	) => Promise<IDispositionSearchSnapshot>;
	deleteSearchSnapshot: (
		data: DeleteDispositionSearchSnapshotDto,
	) => Promise<void>;
	findSearchSnapshots: (
		params: FindDispositionSearchSnapshotsDto,
	) => Promise<FindEntityResponse<IDispositionSearchSnapshot[]>>;
	findSearchSnapshotItems: (
		params: FindDispositionSearchSnapshotItemsDto,
	) => Promise<FindEntityResponse<IDispositionSearchSnapshotItem[]>>;
}

class DispositionSearcheApiService implements DispositionsApiInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
		this.http.getErrorMessage = (message) =>
			getDispositionSearchApiErrorMessage(message);
	}

	getOne = async ({
		id,
	}: GetDispositionSearchDto): Promise<IDispositionSearch> => {
		const payload = await this.http.get(`/api/rdadisposition/${id}`);

		return payload.data.data;
	};

	createOne = async (
		data: CreateDispositionSearchDto,
	): Promise<IDispositionSearch> => {
		const payload = await this.http.post(
			'/api/rdadisposition',
			data,
			undefined,
			false,
		);

		return payload.data.data;
	};

	updateOne = async ({
		id,
		...data
	}: UpdateDispositionSearchDto): Promise<IDispositionSearch> => {
		const payload = await this.http.put(`/api/rdadisposition/${id}`, data);

		return payload.data.data;
	};

	deleteOne = async ({ id }: DeleteDispositionSearchDto): Promise<void> => {
		const payload = await this.http.delete(`/api/rdadisposition/${id}`);

		return payload.data.data;
	};

	findDispositionSearches = async ({
		signal,
		...params
	}: FindDispositionSearchesDto): Promise<
		FindEntityResponse<IDispositionSearch[]>
	> => {
		const payload = await this.http.post('/api/rdadisposition/find', params, {
			signal,
		});

		return payload.data.data;
	};

	createSearchSnapshot = async (
		data: CreateDispositionSearchSnapshot,
	): Promise<IDispositionSearchSnapshot> => {
		const payload = await this.http.post('/api/rdadispositionsnapshot', data);

		return payload.data.data;
	};

	getSearchSnapshot = async ({
		id,
	}: GetDispositionSearchSnapshotDto): Promise<IDispositionSearchSnapshot> => {
		const payload = await this.http.get(`/api/rdadispositionsnapshot/${id}`);

		return payload.data.data;
	};

	deleteSearchSnapshot = async ({
		id,
	}: DeleteDispositionSearchSnapshotDto): Promise<void> => {
		return this.http.delete(`/api/rdadispositionsnapshot/${id}`);
	};

	findSearchSnapshots = async ({
		signal,
		...params
	}: FindDispositionSearchSnapshotsDto): Promise<
		FindEntityResponse<IDispositionSearchSnapshot[]>
	> => {
		const payload = await this.http.post(
			'/api/rdadispositionsnapshot/find',
			params,
			{
				signal,
			},
		);

		return payload.data.data;
	};

	findSearchSnapshotItems = async ({
		signal,
		...params
	}: FindDispositionSearchSnapshotItemsDto): Promise<
		FindEntityResponse<IDispositionSearchSnapshotItem[]>
	> => {
		const payload = await this.http.post(
			'/api/rdadispositionsnapshotitem/find',
			params,
			{
				signal,
			},
		);

		return payload.data.data;
	};
}

export const DispositionSearcheApi = new DispositionSearcheApiService(
	new BaseHttpServices(),
);
