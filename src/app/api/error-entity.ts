import { AxiosResponse } from 'axios';

type IError = AxiosResponse<{
	data: null;
	message: string;
	ok: boolean;
}>;

const ERROR_PLACEHOLDER = 'something_went_wrong';

export class ResponseError<Error extends string> {
	public response: IError;
	public message: Error;

	constructor(response, message) {
		this.response = response;
		this.message = message || ERROR_PLACEHOLDER;
	}
}
