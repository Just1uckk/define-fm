import React from 'react';
import {
	DispositionSearchFormRef,
	SearchForm,
	SearchFormProps,
} from 'modules/disposition-searches/components/search-form';

import { AllDispositionActionsDto } from 'app/api/disposition-action-api/disposition-action-api';
import { DISPOSITION_SEARCHES_API_ERRORS } from 'app/api/disposition-searches-api/disposition-searche-api-error';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { Text } from 'shared/components/text/text';

interface CreateSearchModalProps {
	formRef: React.Ref<DispositionSearchFormRef>;
	isLoading?: boolean;
	error?: DISPOSITION_SEARCHES_API_ERRORS;
	dispositionsData: AllDispositionActionsDto[] | [];
	onSubmit: SearchFormProps['onSubmit'];
}

export const CreateSearchModal: React.FC<CreateSearchModalProps> = ({
	formRef,
	isLoading,
	error,
	dispositionsData,
	onSubmit,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<SearchForm
				dispositionsData={dispositionsData}
				innerRef={formRef}
				title={
					<>
						<HeaderTitle variant="h2_primary_semibold">
							{t('disposition_searches.create_modal.title')}
						</HeaderTitle>
						<Text variant="body_2_secondary">
							{t('disposition_searches.create_modal.sub_title')}
						</Text>
					</>
				}
				error={error}
				onSubmit={onSubmit}
				finishButton={
					<Button
						type="submit"
						icon={ICON_COLLECTION.chevron_right}
						label={t('disposition_searches.create_modal.actions.submit')}
						loading={isLoading}
						value="additional"
					/>
				}
				finishAndSearchButton={
					<Button
						type="submit"
						icon={ICON_COLLECTION.chevron_right}
						label={t('disposition_searches.create_modal.actions.submit_search')}
						loading={isLoading}
					/>
				}
			/>
		</>
	);
};
