import React from 'react';
import {
	DispositionSearchFormRef,
	SearchForm,
	SearchFormProps,
} from 'modules/disposition-searches/components/search-form';

import { AllDispositionActionsDto } from 'app/api/disposition-action-api/disposition-action-api';
import { DISPOSITION_SEARCHES_API_ERRORS } from 'app/api/disposition-searches-api/disposition-searche-api-error';

import { IDataSyncProvider } from 'shared/types/data-sync-provider';
import { IDispositionSearch } from 'shared/types/disposition-search';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';

interface UpdateSearchModalProps {
	formRef: React.Ref<DispositionSearchFormRef>;
	dispositionSearch: IDispositionSearch;
	dispositionsData: AllDispositionActionsDto[] | [];
	initialSearchProvider?: IDataSyncProvider;
	isLoading?: boolean;
	isInitialDataPrepering?: boolean;
	error?: DISPOSITION_SEARCHES_API_ERRORS;
	onSubmit: SearchFormProps['onSubmit'];
}

export const EditSearchModal: React.FC<UpdateSearchModalProps> = ({
	formRef,
	dispositionsData,
	initialSearchProvider,
	isInitialDataPrepering,
	dispositionSearch,
	isLoading,
	error,
	onSubmit,
}) => {
	const { t } = useTranslation();

	return (
		<>
			{isInitialDataPrepering ? (
				<Spinner />
			) : (
				<SearchForm
					innerRef={formRef}
					dispositionsData={dispositionsData}
					title={
						<>
							<HeaderTitle variant="h2_primary_semibold">
								{t('disposition_searches.edit_modal.title', {
									name: dispositionSearch.name,
								})}
							</HeaderTitle>
							<Text variant="body_2_secondary">
								{t('disposition_searches.create_modal.sub_title')}
							</Text>
						</>
					}
					dispositionSearch={dispositionSearch}
					initialSearchProvider={initialSearchProvider}
					error={error}
					finishButton={
						<Button
							type="submit"
							icon={ICON_COLLECTION.chevron_right}
							label={t('disposition_searches.edit_modal.actions.submit')}
							loading={isLoading}
							value="additional"
						/>
					}
					finishAndSearchButton={
						<Button
							type="submit"
							icon={ICON_COLLECTION.chevron_right}
							label={t('disposition_searches.edit_modal.actions.submit_search')}
							loading={isLoading}
						/>
					}
					onSubmit={onSubmit}
				/>
			)}
		</>
	);
};
