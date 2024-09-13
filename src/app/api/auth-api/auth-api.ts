import { AxiosError, AxiosResponse } from 'axios';
import { BaseHttpServices } from 'shared/services/base-http-services';

import { getAuthApiErrorMessage } from 'app/api/auth-api/auth-api-error';
import { ResponseError } from 'app/api/error-entity';

export interface LoginDataDto {
	username: string;
	password: string;
}

export interface ForgotPasswordDataDto {
	usernameOrEmail: string;
}

export interface SetNewPasswordDto {
	token: string;
	password: string;
}

interface AuthApiInterface {
	login: (data: LoginDataDto) => Promise<string>;
	logout: () => Promise<AxiosResponse<any>>;
	forgotPassword: (data: ForgotPasswordDataDto) => Promise<string>;
	setNewPassword: (data: SetNewPasswordDto) => Promise<void>;
}

export class AuthApiService implements AuthApiInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
		this.http.getErrorMessage = (message) => getAuthApiErrorMessage(message);
	}

	login = async (data: LoginDataDto): Promise<string> => {
		try {
			const payload = await this.http.post<
				AxiosError<{ error: string; status: number }>,
				AxiosResponse<string>
			>(`/login`, data, undefined, false);

			return payload.data;
		} catch (e: any) {
			const message = getAuthApiErrorMessage(e.response.data.error);

			throw new ResponseError(e, message);
		}
	};

	logout = (): Promise<AxiosResponse<any>> => {
		return this.http.get(`/logout`);
	};

	forgotPassword = async (data: ForgotPasswordDataDto): Promise<string> => {
		const payload = await this.http.post(
			`/api/corepublic/reset/password/request`,
			data,
			undefined,
			false,
		);

		return payload.data.data;
	};

	setNewPassword = async (data: SetNewPasswordDto): Promise<void> => {
		return this.http.post(`/api/corepublic/reset/password/response`, data);
	};
}

export const AuthApi = new AuthApiService(new BaseHttpServices());
