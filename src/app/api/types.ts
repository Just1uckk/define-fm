export interface IValidationApiError<T extends string> {
	message: T;
	status?: number;
}

export interface FindEntityRequest {
	orderBy?: string;
	filters?: boolean;
	matchAll?: boolean;
	elements: Array<{
		fields: Array<string>;
		modifier: 'contain' | 'equal' | 'between';
		values: Array<any>;
		include?: boolean;
		filter?: boolean;
	}>;
	page: number;
	pageSize: number;
	signal?: AbortSignal;
}

export interface FindEntityResponse<T = any> {
	query: {
		elements: Array<FindEntityResponseFilterGroup>;
		filters: boolean;
		matchAll: boolean;
		orderBy?: string;
		page: number;
		pageSize: number;
	};
	results: T;
	stats: {
		objects: number;
		pages: number;
		filters: Array<FindEntityResponseFilterGroup>;
	};
}

export interface FindEntityResponseFilterGroup {
	field: string;
	name: string;
	multilingual: { string: string };
	values: Array<FindEntityResponseFilterGroupField>;
}

export interface FindEntityResponseFilterGroupField {
	count: number;
	multilingual: { string: string };
	name: string;
	value: string;
}
