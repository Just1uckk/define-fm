import { BaseHttpServices } from 'shared/services/base-http-services';

import { getUsersApiErrorMessage } from 'app/api/user-api/user-api-error';

export interface DefaultSettingsDto {
	id: null | number;
	userId: null | number;
	property: string;
	value: string;
	dateFields: any[];
}

export interface SendDefaultSettingsDto {
	userId: null | number;
	property: string;
	value: string;
}

interface DefaultSettingsInterface {
	getDefaultUserSettings: (id: number) => Promise<DefaultSettingsDto[]>;
	updateDefaultUserSettings: (
		id: number,
		data: SendDefaultSettingsDto[],
	) => Promise<DefaultSettingsDto[]>;
}

interface GetDefaultInterface {
	data: {
		data: any[];
	};
	message: string;
	ok: boolean;
}

export class DefaultSettingsService implements DefaultSettingsInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
		this.http.getErrorMessage = (message) => getUsersApiErrorMessage(message);
	}

	getDefaultUserSettings = async (id: number): Promise<any> => {
		const payload: GetDefaultInterface = await this.http.get(
			`/api/coreuserpreference/user/${id}`,
		);

		if (!payload.data.data.length) {
			await this.http.post(`/api/coreuserpreference/user/${id}`, [
				{
					userId: id,
					property: 'rda.preference.theme',
					value: 'light',
				},
				{
					userId: id,
					property: 'rda.preference.itemsperpage',
					value: 25,
				},
				{
					userId: id,
					property: 'rda.preference.homepage',
					value: 'RDA',
				},
				{
					userId: id,
					property: 'rda.preference.wsdefaulttab',
					value: 'pending',
				},
				{
					userId: id,
					property: 'rda.preference.preferredview',
					value: 'row',
				},
			]);
		}

		return payload.data.data;
	};

	updateDefaultUserSettings = async (
		id: number,
		data: SendDefaultSettingsDto[],
	): Promise<DefaultSettingsDto[]> => {
		const payload = await this.http.post(
			`/api/coreuserpreference/user/${id}`,
			data,
		);
		return payload.data.data;
	};
}

export const DefaultSettingsApi = new DefaultSettingsService(
	new BaseHttpServices(),
);
