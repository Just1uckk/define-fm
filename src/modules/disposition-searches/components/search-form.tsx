import React, {
	useContext,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getMultiLangValues } from 'shared/utils/multilang-helpers';
import * as yup from 'yup';

import { AllDispositionActionsDto } from 'app/api/disposition-action-api/disposition-action-api';
import { DISPOSITION_SEARCHES_API_ERRORS } from 'app/api/disposition-searches-api/disposition-searche-api-error';

import i18n from 'app/settings/i18n/i18n';

import { IDataSyncProvider } from 'shared/types/data-sync-provider';
import { IDispositionSearch } from 'shared/types/disposition-search';
import { LanguageTypes } from 'shared/types/users';

import { LANGUAGE_CODES } from 'shared/constants/constans';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { ModalSteps } from 'shared/components/modal/modal-steps';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageForm } from 'shared/components/modal-form/page-form';
import { PageHeader } from 'shared/components/modal-form/page-header';

import { SearchFormActionSettings } from '../components/search-form/search-form-action-settings';
import { SearchFromPrimaryInformation } from '../components/search-form/search-from-primary-information';

const schema = yup
	.object({
		primaryInformation: yup.object().when('$currentStep', {
			is: (currentStep: number) => currentStep === 1,
			then: () =>
				yup.object({
					multilingual: yup.object().shape({
						name: yup.object().shape({
							en: yup
								.string()
								.trim()
								.when(['$currentLang'], {
									is: (currentLang: LANGUAGE_CODES) =>
										currentLang === LANGUAGE_CODES.EN,
									then: (schema) =>
										schema.required('validation_errors.field_is_required').max(
											100,
											i18n.t('validation_errors.max_length', {
												length: 100,
											}) as string,
										),
								}),
							fr_CA: yup
								.string()
								.trim()
								.when(['$currentLang'], {
									is: (currentLang: LANGUAGE_CODES) =>
										currentLang === LANGUAGE_CODES.FR_CD,
									then: (schema) =>
										schema.required('validation_errors.field_is_required').max(
											100,
											i18n.t('validation_errors.max_length', {
												length: 100,
											}) as string,
										),
								}),
						}),
					}),
					primaryProvider: yup
						.object()
						.required('validation_errors.field_is_required'),
					query: yup
						.string()
						.trim()
						.required('validation_errors.field_is_required')
						.max(
							4000,
							i18n.t('validation_errors.max_length', { length: 400 }) as string,
						),
				}),
		}),
	})
	.defined();

const resolver = yupResolver(schema);

export type SearchFormDataTypes = {
	primaryInformation: {
		multilingual: Record<'name', Record<LanguageTypes, string>>;
		primaryProvider: IDataSyncProvider;
		query: string;
	};
	actionSettings: {
		action: number;
	};
};

export interface DispositionSearchFormRef {
	isDirty: boolean;
	onSubmit: () => void;
}

export interface SearchFormProps {
	title: React.ReactNode;
	dispositionsData: AllDispositionActionsDto[] | [];
	innerRef?: React.Ref<DispositionSearchFormRef>;
	dispositionSearch?: IDispositionSearch;
	initialSearchProvider?: IDataSyncProvider;
	error?: DISPOSITION_SEARCHES_API_ERRORS;
	finishButton: React.ReactNode;
	finishAndSearchButton: React.ReactNode;
	onSubmit: (data: SearchFormDataTypes, isSearch: boolean) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({
	innerRef,
	title,
	dispositionSearch,
	dispositionsData,
	initialSearchProvider,
	finishButton,
	finishAndSearchButton,
	error,
	onSubmit,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);
	const { t, currentLang } = useTranslation();

	const [step, setStep] = useState(1);
	const submitButtonFormRef = React.useRef<HTMLButtonElement>(null);

	const formData = useForm<SearchFormDataTypes>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		defaultValues: {
			primaryInformation: {
				multilingual: getMultiLangValues(
					dispositionSearch || {},
					['name'],
					currentLang,
				),
				query: dispositionSearch?.query ?? '',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				primaryProvider: initialSearchProvider,
			},
			actionSettings: {
				action: dispositionSearch?.dispositionActionId || 1,
			},
		},
		context: {
			currentLang,
			currentStep: step,
		},
	});

	useEffect(() => {
		if (error === DISPOSITION_SEARCHES_API_ERRORS.DuplicateEntityException) {
			formData.setError(`primaryInformation.multilingual.name.${currentLang}`, {
				message: error,
			});
		}
	}, [error]);

	useImperativeHandle(innerRef, () => {
		return {
			isDirty:
				formData.formState.isDirty &&
				Boolean(Object.keys(formData.formState.dirtyFields).length),
			onSubmit: () => submitButtonFormRef.current?.click(),
		};
	});

	const handleBack = () => setStep((prevValue) => prevValue - 1);

	const onSubmitForm = (data: SearchFormDataTypes, event) => {
		if (step !== 2) {
			setStep((prevValue) => prevValue + 1);
			return;
		}
		let isSearch = true;
		if (
			event.nativeEvent.submitter.value &&
			event.nativeEvent.submitter.value === 'additional'
		) {
			isSearch = false;
			onSubmit(data, isSearch);
		}
		onSubmit(data, isSearch);
	};

	const steps = <ModalSteps fullWidth totalSteps={2} step={step} />;

	const forms = {
		1: <SearchFromPrimaryInformation />,
		2: <SearchFormActionSettings dispositionsData={dispositionsData} />,
	};

	return (
		<>
			<ModalNavbar hasBack={step !== 1} onBack={handleBack} hasClose={false} />
			{step === 1 && <PageHeader>{title}</PageHeader>}
			<PageBody>
				<PageForm onSubmit={formData.handleSubmit(onSubmitForm)}>
					<button ref={submitButtonFormRef} type="submit" hidden />
					<FormProvider {...formData}>{forms[step]}</FormProvider>
					<ModalFooter fullWidth>
						<ButtonList>
							{step === 1 ? (
								<Button
									type="submit"
									label="Set Disposition Action"
									icon={ICON_COLLECTION.chevron_right}
								/>
							) : (
								<>
									{finishAndSearchButton}
									{finishButton}
								</>
							)}
							<Button
								type="button"
								variant="primary_outlined"
								label={t('disposition_searches.create_modal.actions.cancel')}
								onClick={modalContext.onClose}
							/>
						</ButtonList>
						{steps}
					</ModalFooter>
				</PageForm>
			</PageBody>
		</>
	);
};
