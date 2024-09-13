import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SearchFormDataTypes } from 'modules/disposition-searches/components/search-form';

import { FindAuthProvidersDto } from 'app/api/auth-provider-api/auth-provider-api';
import {
	DataSyncProviderApi,
	FindDataSyncProviderDto,
} from 'app/api/data-sync-provider-api/data-sync-provider-api';

import { IDataSyncProvider } from 'shared/types/data-sync-provider';

import { LANGUAGE_CODES } from 'shared/constants/constans';

import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { useTranslation } from 'shared/hooks/use-translation';

import {
	LangInput,
	LangInputList,
	LangInputListRef,
} from 'shared/components/input/lang-input';
import { FormField } from 'shared/components/modal-form/form-field';
import { SelectAsyncFinder } from 'shared/components/select/select-async-finder';
import { Textarea } from 'shared/components/textarea/textarea';

export const SearchFromPrimaryInformation: React.FC = () => {
	const { t, multilingualT, tExists } = useTranslation();
	const nameInputsRef = React.useRef<LangInputListRef>();

	const {
		formState: { errors },
		formState,
		watch,
		register,
		setValue,
	} = useFormContext<SearchFormDataTypes>();
	const selectedProvider = watch('primaryInformation.primaryProvider');

	const {
		data: providersData,
		searchData: searchProviders,
		isInitialLoading: isInitialProvidersLoading,
		isSearching: isSearchingProviders,
	} = useFilterRequest<IDataSyncProvider[], undefined, FindDataSyncProviderDto>(
		{
			request: (params) => {
				return DataSyncProviderApi.find(getFindProvidersParams(params));
			},
			searchRequest: (params) => {
				return DataSyncProviderApi.find(params);
			},
		},
	);
	const providers = providersData?.results ?? [];

	function getFindProvidersParams(params) {
		const combinedParams = {
			...params,
		};

		const parsedParams: FindAuthProvidersDto = {
			orderBy: combinedParams.orderBy,
			elements: [],
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.search?.trim().length) {
			parsedParams.elements.push({
				fields: ['name', 'comment'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		return parsedParams;
	}

	const handleSelectProvider = (provider: IDataSyncProvider) => {
		setValue('primaryInformation.primaryProvider', provider, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	return (
		<>
			<FormField>
				<LangInputList innerRef={nameInputsRef}>
					<LangInput
						{...register('primaryInformation.multilingual.name.en')}
						error={
							errors?.primaryInformation?.multilingual?.name?.en?.message &&
							tExists(errors?.primaryInformation.multilingual.name.en.message)
								? t(errors?.primaryInformation?.multilingual.name.en.message)
								: errors?.primaryInformation?.multilingual?.name?.en?.message
						}
						label={t('disposition_searches.search_form.name')}
						lang={LANGUAGE_CODES.EN}
						autoComplete="off"
					/>
					<LangInput
						{...register('primaryInformation.multilingual.name.fr_CA')}
						error={
							errors?.primaryInformation?.multilingual?.name?.fr_CA?.message &&
							tExists(
								errors?.primaryInformation?.multilingual.name?.fr_CA?.message,
							)
								? t(errors?.primaryInformation?.multilingual.name.fr_CA.message)
								: errors?.primaryInformation?.multilingual?.name?.fr_CA?.message
						}
						lang={LANGUAGE_CODES.FR_CD}
						label={t('disposition_searches.search_form.name')}
						autoComplete="off"
					/>
				</LangInputList>
			</FormField>
			<FormField>
				<SelectAsyncFinder<IDataSyncProvider>
					label={t('disposition_searches.search_form.provider')}
					data={providers}
					value={selectedProvider}
					valueKey="id"
					optionKey="id"
					optionLabelKey="name"
					menuTrigger="focus"
					isInitialLoading={isInitialProvidersLoading}
					isSearchLoading={isSearchingProviders}
					onSelect={handleSelectProvider}
					onSearch={(value) =>
						searchProviders(() => getFindProvidersParams({ search: value }))
					}
					getOptionLabel={(option) =>
						multilingualT({
							field: 'name',
							translations: option.multilingual,
							fallbackValue: option.name,
						})
					}
					getValueLabel={(option) =>
						multilingualT({
							field: 'name',
							translations: option.multilingual,
							fallbackValue: option.name,
						})
					}
					error={
						typeof formState.errors?.primaryInformation?.primaryProvider
							?.message === 'string'
							? t(
									formState.errors?.primaryInformation?.primaryProvider
										?.message,
							  )
							: undefined
					}
				/>
			</FormField>
			<FormField>
				<Textarea
					label={t('disposition_searches.search_form.query')}
					{...register('primaryInformation.query')}
					error={
						errors?.primaryInformation?.query?.message &&
						tExists(errors?.primaryInformation?.query.message)
							? t(errors?.primaryInformation?.query.message)
							: errors?.primaryInformation?.query?.message
					}
					resize="vertical"
					fulfilled
				/>
			</FormField>
		</>
	);
};
