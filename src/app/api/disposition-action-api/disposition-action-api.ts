import { BaseHttpServices } from 'shared/services/base-http-services';

import { FindEntityRequest, FindEntityResponse } from 'app/api/types';

export type FindDispositionActionsDto = FindEntityRequest;

interface processAllActionsDto {
	id: number;
}

export interface AllDispositionActionsDto {
	dateFields: any[];
	dispositionActionProviders: any[];
	id: number;
	multilingual: any;
	name: string;
}

interface IDispositionActionApiService {
	find: (params: FindDispositionActionsDto) => Promise<FindEntityResponse>;
	getAllActions: () => Promise<AllDispositionActionsDto[]>;
	processAllActions: (params: processAllActionsDto) => Promise<any>;
	processSelectedActions: (params: string[]) => Promise<any>;
}

class DispositionActionApiService implements IDispositionActionApiService {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
	}

	find = async ({
		signal,
		...params
	}: FindDispositionActionsDto): Promise<FindEntityResponse> => {
		const payload = await this.http.post(
			'/api/dispositionaction/find',
			params,
			{
				signal,
			},
		);

		return payload.data.data;
	};

	getAllActions = async (): Promise<AllDispositionActionsDto[]> => {
		const payload = await this.http.get('/api/dispositionaction');
		return payload.data.data;
	};

	processAllActions = async (params: processAllActionsDto): Promise<string> => {
		const payload = await this.http.post(
			'/api/dispositionaction/disposition/main',
			params,
		);

		return payload.data.data;
	};

	processSelectedActions = async (params: string[]): Promise<string> => {
		const payload = await this.http.post(
			'/api/dispositionaction/disposition/items',
			params,
		);

		return payload.data.data;
	};
}

export const DispositionActionApi = new DispositionActionApiService(
	new BaseHttpServices(),
);
