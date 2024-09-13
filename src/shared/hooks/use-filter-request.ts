import { useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { EventBus, EventBusEvents } from 'shared/utils/event-bus';

import { FindEntityResponse } from 'app/api/types';

export type UseFilterRequestRequestParams<P = object> = P & {
	signal?: AbortSignal;
};

interface UseFilterRequestParams<R, P = object, F = object> {
	enabled?: boolean;
	requestKey?: EventBusEvents;
	request: (
		params: UseFilterRequestRequestParams<P>,
	) => Promise<FindEntityResponse<R>>;
	searchRequest?: (params: F) => Promise<FindEntityResponse<R>>;
	manualTriggering?: boolean;
	searchFuncDependencies?: Array<any>;
}

export function useFilterRequest<R, P = object, F = object>({
	enabled = true,
	requestKey,
	request,
	searchRequest,
	manualTriggering,
	searchFuncDependencies = [],
}: UseFilterRequestParams<R, P, F>) {
	const [isRefetching, setIsRefetching] = useState(false);
	const [isInitialLoading, setIsInitialLoading] = useState(false);
	const [isInitialRequestSent, setInitialRequestSent] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [data, setData] = useState<FindEntityResponse<R> | undefined>();
	const abortController = useRef<AbortController>();

	useEffect(() => {
		if (manualTriggering || !enabled) return;

		(async () => {
			const result = await getData();
			setData(result);
		})();
	}, [enabled]);

	useEffect(() => {
		if (!requestKey) return;

		const handleEvent = (params?: { isRefetching: boolean }) => {
			if (params?.isRefetching) {
				refetchData();
			}
		};

		EventBus.on(requestKey, handleEvent);

		return () => {
			EventBus.off(requestKey, handleEvent);
		};
	}, [requestKey]);

	const searchMemoized = useCallback(
		debounce(async (getParams?: () => F, onSuccess?: () => void) => {
			try {
				setIsSearching(true);

				const params = getParams ? getParams() : {};
				const result = await getData(params as object, true);

				setIsSearching(false);
				setData(result);
				onSuccess && onSuccess();

				return result;
			} catch (e) {
				console.log(e);
				setIsSearching(false);
			}
		}, 300),
		[...searchFuncDependencies],
	);

	async function refetchData(
		params?: object,
		config: { silently: boolean } = { silently: true },
	) {
		try {
			!config.silently && setIsRefetching(true);

			let result = await getData(params);

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			if (result.query?.page > 1 && result.query?.page > result.stats.pages) {
				result = await getData({ ...params, page: result.stats.pages });
			}

			!config?.silently && setIsRefetching(false);
			setData(result);

			return result;
		} catch (e) {
			console.log(e);
			!config?.silently && setIsRefetching(false);
		}
	}

	async function getData(params = {}, isSearching?: boolean) {
		if (!isInitialRequestSent && !isSearching) {
			setIsInitialLoading(true);
		}

		// if (abortController.current) {
		// 	abortController.current.abort();
		// }
		abortController.current = new AbortController();

		const response = (isSearching && searchRequest
			? await searchRequest({
					...(params as F),
					signal: abortController.current?.signal,
			  })
			: await request({
					signal: abortController.current?.signal,
					...(params as P),
			  })) as unknown as Promise<FindEntityResponse<R>>;

		if (!isInitialRequestSent && !isSearching) {
			setIsInitialLoading(false);
			setInitialRequestSent(true);
		}

		return response;
	}

	const fetchData = async (params?: object) => {
		const result = await getData(params);
		setData(result);
	};

	return {
		data,
		isRefetching,
		isInitialLoading,
		isInitialRequestSent,
		isSearching,
		searchData: searchMemoized,
		getData,
		fetchData,
		refetchData,
	};
}
