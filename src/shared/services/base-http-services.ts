import { AxiosResponse, RawAxiosRequestConfig } from 'axios';
import { ToastService } from 'shared/services/toast';

import { ResponseError } from 'app/api/error-entity';

import { axios } from 'app/settings/axios/axios';

export interface CustomAxiosRequestConfig<P = any>
	extends RawAxiosRequestConfig<P> {
	useToken?: boolean;
}

export class BaseHttpServices {
	getErrorMessage(message: string): string | undefined {
		return message;
	}

	onResponse(response: any, showToast = true) {
		if (
			typeof response.data === 'object' &&
			'ok' in response.data &&
			!response.data.ok
		) {
			const error = new ResponseError(
				response,
				this.getErrorMessage(response.data.message),
			);

			if (showToast) {
				ToastService.showError({
					text: error.message,
				});
			}

			throw error;
		}
	}

	async get<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		config?: CustomAxiosRequestConfig<D>,
		showToast?: boolean,
	): Promise<R> {
		const response = await axios.get(url, config);

		this.onResponse(response, showToast);

		return response as unknown as Promise<R>;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async post<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		data?: any,
		config?: CustomAxiosRequestConfig<any>,
		showToast?: boolean,
	): Promise<R> {
		const response = await axios.post(url, data, config);

		this.onResponse(response, showToast);

		return response as unknown as Promise<R>;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async put<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		data?: any,
		config?: CustomAxiosRequestConfig<any>,
		showToast?: boolean,
	): Promise<R> {
		const response = await axios.put(url, data, config);

		this.onResponse(response, showToast);

		return response as unknown as Promise<R>;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async delete<T = any, R = AxiosResponse<T>, D = any>(
		url: string,
		config?: CustomAxiosRequestConfig<any>,
		showToast?: boolean,
	): Promise<R> {
		const response = await axios.delete(url, config);

		this.onResponse(response, showToast);

		return response as unknown as Promise<R>;
	}
}
