import Axios from 'axios';
import { CustomAxiosRequestConfig } from 'shared/services/base-http-services';
import { LocalStorageService } from 'shared/services/local-storage-service';

import { API_BASE_URL } from 'shared/constants/variables';

const axiosInstance = Axios.create({
	baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	function (config: CustomAxiosRequestConfig) {
		if (config.useToken !== false) {
			const token = LocalStorageService.get('token');

			(config.headers || {})['Authorization'] = token
				? LocalStorageService.get('token')
				: undefined;
		}

		return config;
	},
	function (error) {
		return Promise.reject(error);
	},
);

export const axios = axiosInstance;
