import { BaseHttpServices } from 'shared/services/base-http-services';

import { getCoreConfigApiErrorMessage } from 'app/api/core-config-api/core-config-api-error';

import {
	ICoreConfig,
	ICoreConfigSectionGroup,
	ICoreLang,
} from 'shared/types/core-config';

export interface UpdateConfigPropertyDto
	extends Partial<Omit<ICoreConfig, 'id'>> {
	id: number;
}

interface ICoreConfigApiService {
	getSectionGroupList: () => Promise<ICoreConfigSectionGroup>;
	getConfigList: () => Promise<ICoreConfig[]>;
	getLanguageList: () => Promise<ICoreLang[]>;
	updateConfigProperty: (data: UpdateConfigPropertyDto) => Promise<ICoreConfig>;
}

class CoreConfigApiService implements ICoreConfigApiService {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
		this.http.getErrorMessage = (message) =>
			getCoreConfigApiErrorMessage(message);
	}

	getSectionGroupList = async (): Promise<ICoreConfigSectionGroup> => {
		const payload = await this.http.get(`/api/coreconfig/sectiongroup`);

		return payload.data.data;
	};

	getConfigList = async (): Promise<ICoreConfig[]> => {
		const payload = await this.http.get(`/api/coreconfig`);

		return payload.data.data;
	};

	getLanguageList = async (): Promise<ICoreLang[]> => {
		const payload = await this.http.get(`/api/corelang`, { useToken: false });

		return payload.data.data;
	};

	updateConfigProperty = async ({
		id,
		...data
	}: UpdateConfigPropertyDto): Promise<ICoreConfig> => {
		const payload = await this.http.put(`/api/coreconfig/${id}`, data);

		return payload.data.data;
	};

	sendTestEmail = (): Promise<void> => {
		return this.http.post(`/api/coreconfig/sendtestemail`);
	};
}

export const CoreConfigApi = new CoreConfigApiService(new BaseHttpServices());
