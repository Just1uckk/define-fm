import { BaseHttpServices } from 'shared/services/base-http-services';

import { FindEntityRequest, FindEntityResponse } from 'app/api/types';

import {
	IDispositionType,
	IDispositionTypeDisposition,
	IDispositionTypeSnapshot,
	IFile,
	IFileCategory,
	IFileFullPath,
	IFileFullPathTotal,
	IFileSpecifics,
} from 'shared/types/dispositions';

export interface GetRdaByIdDto {
	id: number;
}

export interface GetRdaDto {
	id: number;
}

export interface GetFileFullPathDto {
	id: number;
}

export interface GetFileFullPathTotalDto {
	arrayIds: number[];
}

export interface GetFileCategoriesDto {
	id: number;
}

export interface GetFileSpecificDto {
	id: number;
}

export type FindRdaFilesDto = FindEntityRequest;
export type FindDispositionTypeSnapshotsDto = FindEntityRequest;
export type FindDispositionTypeDispositionsDto = FindEntityRequest;

export interface UpdateRdaDto {
	id: number | string;
	included?: number;
}

export interface AdditionalInfoDto {
	fileNumber: string;
	recordDate: string;
	status: string;
	statusDate: string | Date;
	receivedDate: string;
	essential: string;
	official: boolean;
	accession: string;
	subject: string;
	rsi: string;
	authorOrOriginator: string;
	addressees: string;
	otherAddressees: string;
	originating: string;
}

interface RdaApiInterface {
	getDispositionTypes: () => Promise<IDispositionType[]>;
	findDispositionTypeDispositions: (
		params: FindDispositionTypeDispositionsDto,
	) => Promise<FindEntityResponse<IDispositionTypeDisposition[]>>;
	findDispositionTypeSnapshots: (
		params: FindDispositionTypeSnapshotsDto,
	) => Promise<FindEntityResponse<IDispositionTypeSnapshot[]>>;
	getFileById: (data: GetRdaDto) => Promise<IFile>;
	getAdditionalInfo: (data: GetRdaDto) => Promise<AdditionalInfoDto>;
	getFileFullPathById: (data: GetFileFullPathDto) => Promise<IFileFullPath>;
	getFileCategoriesById: (
		data: GetFileCategoriesDto,
	) => Promise<IFileCategory[]>;
	getFileSpecificsById: (data: GetFileSpecificDto) => Promise<IFileSpecifics>;
	getFilesByRdaId: (data: GetRdaByIdDto) => Promise<IFile[]>;
	findFiles: (data: FindRdaFilesDto) => Promise<FindEntityResponse<IFile[]>>;
	updateFile: (data: UpdateRdaDto) => Promise<IFile>;
	approveFile: (data: UpdateRdaDto) => Promise<IFile>;
}

export class RdaApiService implements RdaApiInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
	}

	getDispositionTypes = async (): Promise<IDispositionType[]> => {
		const payload = await this.http.get(`/api/rdadispositiontype`);

		return payload.data.data;
	};

	findDispositionTypeDispositions = async ({
		signal,
		...params
	}: FindDispositionTypeDispositionsDto): Promise<
		FindEntityResponse<IDispositionTypeDisposition[]>
	> => {
		const payload = await this.http.post(
			`/api/rdadispositiontype/find/dispositions`,
			params,
			{ signal },
		);

		return payload.data.data;
	};

	findDispositionTypeSnapshots = async ({
		signal,
		...params
	}: FindDispositionTypeSnapshotsDto): Promise<
		FindEntityResponse<IDispositionTypeSnapshot[]>
	> => {
		const payload = await this.http.post(
			`/api/rdadispositiontype/find/snapshots`,
			params,
			{ signal },
		);

		return payload.data.data;
	};

	getFileById = async ({ id }: GetRdaDto): Promise<IFile> => {
		const payload = await this.http.get(`/api/rdaitem/${id}`);

		return payload.data.data;
	};

	getAdditionalInfo = async ({ id }: GetRdaDto): Promise<AdditionalInfoDto> => {
		const payload = await this.http.get(`/api/rdaitem/${id}/recorddetails`);

		return payload.data.data;
	};

	getFileFullPathById = async ({
		id,
	}: GetFileFullPathDto): Promise<IFileFullPath> => {
		const payload = await this.http.get(`/api/rdaitem/${id}/fullpath`);

		return payload.data.data;
	};

	getFileFullPathTotal = async ({
		arrayIds,
	}: GetFileFullPathTotalDto): Promise<IFileFullPathTotal> => {
		const payload = await this.http.post(`/api/rdaitem/fullpath`, arrayIds);

		return payload.data.data;
	};

	getFileCategoriesById = async ({
		id,
	}: GetFileCategoriesDto): Promise<IFileCategory[]> => {
		const payload = await this.http.get(`/api/rdaitem/${id}/categories`);

		return payload.data.data;
	};

	getFileSpecificsById = async ({
		id,
	}: GetFileSpecificDto): Promise<IFileSpecifics> => {
		const payload = await this.http.get(`/api/rdaitem/${id}/specifics`);

		return payload.data.data;
	};

	getFilesByRdaId = async ({ id }: GetRdaByIdDto): Promise<IFile[]> => {
		const payload = await this.http.get(`/api/rdaitem/rdaId/${id}`);

		return payload.data.data;
	};

	findFiles = async ({
		signal,
		...params
	}: FindRdaFilesDto): Promise<FindEntityResponse<IFile[]>> => {
		const payload = await this.http.post(`/api/rdaitem/find`, params, {
			signal: signal,
		});

		return payload.data.data;
	};

	updateFile = async ({ id, ...params }: UpdateRdaDto): Promise<IFile> => {
		const payload = await this.http.put(`/api/rdaitem/${id}`, params);

		return payload.data.data;
	};

	approveFile = async ({ id, ...params }: UpdateRdaDto): Promise<IFile> => {
		const payload = await this.http.put(`/api/rdaitem/approve/${id}`, params);

		return payload.data.data;
	};
}

export const RdaItemApi = new RdaApiService(new BaseHttpServices());
