import React, { useImperativeHandle, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { getMultiLangValues } from 'shared/utils/multilang-helpers';
import styled from 'styled-components';
import * as yup from 'yup';

import { AllDispositionActionsDto } from 'app/api/disposition-action-api/disposition-action-api';
import {
	CreateDispositionDto,
	DispositionsApi,
} from 'app/api/dispositions-api/dispositions-api';

import i18n from 'app/settings/i18n/i18n';

import { ICoreConfig } from 'shared/types/core-config';
import {
	IDispositionType,
	IDispositionTypeDisposition,
	IDispositionTypeSnapshot,
	IWorkPackage,
} from 'shared/types/dispositions';
import { LanguageTypes } from 'shared/types/users';

import { LANGUAGE_CODES } from 'shared/constants/constans';

import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { ModalSteps } from 'shared/components/modal/modal-steps';

import { DispositionActionForm } from '../disposition-action-form/disposition-action-form';
import {
	IApproverShort,
	SelectApprovesForm,
} from '../select-approvers-form/select-approvers';

import { DetailedInformation } from './step-forms/detailed-information';
import { MainInformation } from './step-forms/main-information';

const CreateRdaFormRoot = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
`;

const schema = yup
	.object({
		multilingual: yup.object().shape({
			name: yup.object().shape({
				en: yup
					.string()
					.trim()
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.EN,
						then: (schema) =>
							schema.required('validation_errors.field_is_required'),
					}),
				fr_CA: yup
					.string()
					.trim()
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.FR_CD,
						then: (schema) =>
							schema.required('validation_errors.field_is_required'),
					}),
			}),
			approveButtonLabel: yup.object().shape({
				en: yup
					.string()
					.trim()
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.EN,
						then: () => yup.string(),
					}),
				fr_CA: yup
					.string()
					.trim()
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.FR_CD,
						then: () => yup.string(),
					}),
			}),
			rejectButtonLabel: yup.object().shape({
				en: yup
					.string()
					.trim()
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.EN,
						then: () => yup.string(),
					}),
				fr_CA: yup
					.string()
					.trim()
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.FR_CD,
						then: () => yup.string(),
					}),
			}),
			instructions: yup.object().shape({
				en: yup
					.string()
					.trim()
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.EN,
						then: () => yup.string(),
					}),
				fr_CA: yup
					.string()
					.trim()
					.when(['$currentLang'], {
						is: (currentLang: LANGUAGE_CODES) =>
							currentLang === LANGUAGE_CODES.FR_CD,
						then: () => yup.string(),
					}),
			}),
		}),
		rdaType: yup.object().required('validation_errors.field_is_required'),
		disposition: yup.object().required('validation_errors.field_is_required'),
		snapshot: yup.object().required('validation_errors.field_is_required'),
		numberOfDaysToComplete: yup.number().when('$currentStep', {
			is: (step) => step === 2,
			then: (schema) =>
				schema
					.min(
						1,
						i18n.t('validation_errors.min_value', {
							length: 1,
						}),
					)
					.required('validation_errors.field_is_required'),
			otherwise: (schema) => schema,
		}),
		securityOverride: yup.number().when('$currentStep', {
			is: (step) => step === 2,
			then: (schema) => schema.oneOf([0, 1]),
			otherwise: (schema) => schema,
		}),
		autoprocessApprovedItems: yup.number().when('$currentStep', {
			is: (step) => step === 2,
			then: (schema) => schema.oneOf([0, 1]),
			otherwise: (schema) => schema,
		}),
		approvers: yup.array(),
		additionalApprovers: yup.array(),
	})
	.defined();

export type CreateRdaFormDataTypes = {
	multilingual: Record<
		'name' | 'instructions' | 'approveButtonLabel' | 'rejectButtonLabel',
		Record<LanguageTypes, string>
	>;
	rdaType: IDispositionType;
	disposition: IDispositionTypeDisposition;
	snapshot: IDispositionTypeSnapshot;
	securityOverride: IWorkPackage['securityOverride'];
	autoprocessApprovedItems: IWorkPackage['autoprocessApprovedItems'];
	numberOfDaysToComplete: IWorkPackage['numberOfDaysToComplete'];
	approvers: IApproverShort[];
	additionalApprovers: IApproverShort[];
	dispositionAction: number;
};
export type CreateRdaFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

export interface CreateWorkPackageFormRef {
	isDirty: () => boolean;
	onSubmit: () => void;
}

interface CreateRdaFormProp {
	unsavedIsOpen: boolean;
	formRef: React.Ref<any>;
	allDispositionActions: AllDispositionActionsDto[] | [];
	rdaDefaultSettings?: {
		allowCustomLabels: ICoreConfig;
		instructions: string;
		approveButtonLabel: string;
		rejectButtonLabel: string;
		daysToComplete: ICoreConfig;
		overrideEnabledByDefault: ICoreConfig;
		allowAutoprocessOfApproved: ICoreConfig;
		securityOverride: ICoreConfig;
	};
	dispositionTypes: IDispositionType[];
	isLoading?: boolean;
	onSubmit: (
		data: CreateDispositionDto,
		approvers: IApproverShort[],
		additionalApprovers: IApproverShort[],
	) => void;
	onClose: () => void;
}

export const CreateRdaForm: React.FC<CreateRdaFormProp> = ({
	formRef,
	unsavedIsOpen,
	allDispositionActions,
	rdaDefaultSettings,
	dispositionTypes,
	isLoading,
	onClose,
	onSubmit,
}) => {
	const { t, currentLang } = useTranslation();
	const [step, setStep] = useState(1);
	const [dispositionSearches, setDispositionSearches] = useState<
		IDispositionTypeDisposition[]
	>([]);
	const [snapshots, setSnapshots] = useState<IDispositionTypeSnapshot[]>([]);
	const submitButtonFormRef = React.useRef<HTMLButtonElement>(null);

	const formData = useForm<CreateRdaFormDataTypes>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		defaultValues: {
			multilingual: getMultiLangValues(
				rdaDefaultSettings || {},
				['approveButtonLabel', 'rejectButtonLabel', 'instructions'],
				currentLang,
			),
			numberOfDaysToComplete: Number(rdaDefaultSettings?.daysToComplete.value),
			securityOverride:
				rdaDefaultSettings?.overrideEnabledByDefault.value === 'true' ? 1 : 0,
			autoprocessApprovedItems: 0,
			approvers: [],
			additionalApprovers: [],
			dispositionAction: 1,
		},
		context: {
			currentStep: step,
			currentLang,
		},
	});

	useImperativeHandle(formRef, () => {
		return {
			isDirty:
				formData.formState.isDirty &&
				Boolean(Object.keys(formData.formState.dirtyFields).length),
			onSubmit: () => submitButtonFormRef.current?.click(),
		};
	});

	const existsWorkPackageQuery = useFilterRequest<
		IWorkPackage[],
		{ name: string }
	>({
		manualTriggering: true,
		request: async (params) => {
			return await DispositionsApi.findDispositions({
				filters: false,
				elements: [
					{
						fields: ['name'],
						modifier: 'equal',
						values: [params.name],
					},
				],
				page: 1,
				pageSize: 1,
				signal: params.signal,
			});
		},
	});

	const onBack = () => setStep((prevValue) => prevValue - 1);

	const onSetDispositionAction = () => {
		const formValues = formData.getValues();

		onSubmit(
			{
				multilingual: formValues.multilingual,
				autoprocessApprovedItems: formValues.autoprocessApprovedItems ?? 0,
				dispNodeId: Number(formValues.disposition.dispositionId),
				rdaType: formValues.rdaType.id,
				securityOverride: formValues.securityOverride ?? 0,
				numberOfDaysToComplete: formValues.numberOfDaysToComplete ?? 30,
				snapshotDate: formValues.snapshot.snapshotDate,
				sourceId: formValues.snapshot.source,
				includeDefaultApprover: 0,
				dispositionActionId: formValues.dispositionAction,
			},
			formValues.approvers as IApproverShort[],
			formValues.additionalApprovers as IApproverShort[],
		);
	};

	const onSubmitApprovers = () => {
		setStep((prevValue) => prevValue + 1);
	};

	const onFinishSetMainInformation = async () => {
		const response = await existsWorkPackageQuery.refetchData(
			{
				name: formData.getValues().multilingual.name[currentLang],
			},
			{ silently: false },
		);

		if (response?.results.length) {
			formData.setError(`multilingual.name.${currentLang}`, {
				message:
					'dispositions.create_form.validations.DuplicateEntityException',
			});

			return;
		}

		setStep((prevValue) => prevValue + 1);
	};

	const onFinishSetDetailedInformation = async () => {
		setStep(3);
	};

	const steps = <ModalSteps totalSteps={4} step={step} />;

	const getForm = (step) => {
		switch (true) {
			case step === 1:
				return (
					<MainInformation
						unsavedIsOpen={unsavedIsOpen}
						snapshots={snapshots}
						onSnapshots={(type) => {
							setSnapshots(type);
						}}
						dispositionSearches={dispositionSearches}
						onDispositionSearches={(type) => {
							setDispositionSearches(type);
						}}
						dispositionTypes={dispositionTypes}
						onSubmit={onFinishSetMainInformation}
					>
						<button ref={submitButtonFormRef} type="submit" hidden />
						<Button
							type="submit"
							label={'Next'}
							icon={ICON_COLLECTION.chevron_right}
							loading={existsWorkPackageQuery.isRefetching}
						/>
						{steps}
					</MainInformation>
				);
			case step === 2:
				return (
					<DetailedInformation
						allowCustomLabels={
							rdaDefaultSettings?.allowCustomLabels.value === 'true'
						}
						showSecurityOverride={
							rdaDefaultSettings?.securityOverride.value === 'true'
						}
						showAutoprocessApprovedItemsToggle={
							rdaDefaultSettings?.allowAutoprocessOfApproved.value === 'true'
						}
						onSubmit={onFinishSetDetailedInformation}
					>
						<button ref={submitButtonFormRef} type="submit" hidden />
						<Button
							type="submit"
							label={t('dispositions.create_form.actions.select_approvers')}
							icon={ICON_COLLECTION.chevron_right}
							loading={existsWorkPackageQuery.isRefetching}
						/>
						{steps}
					</DetailedInformation>
				);
			case step === 3:
				return (
					<SelectApprovesForm
						onSubmit={onSubmitApprovers}
						unsavedIsOpen={unsavedIsOpen}
					>
						<button ref={submitButtonFormRef} type="submit" hidden />
						<Button
							type="submit"
							icon={ICON_COLLECTION.chevron_right}
							label={t(
								'dispositions.create_form.actions.set_disposition_action',
							)}
						/>
						{steps}
					</SelectApprovesForm>
				);
			case step === 4:
				return (
					<DispositionActionForm
						allDispositionActions={allDispositionActions}
						onSubmit={onSetDispositionAction}
					>
						<button ref={submitButtonFormRef} type="submit" hidden />
						<Button
							type="submit"
							icon={ICON_COLLECTION.chevron_right}
							label={t('dispositions.create_form.actions.create_rda')}
							loading={isLoading}
						/>
						{steps}
					</DispositionActionForm>
				);

			default:
				return null;
		}
	};

	return (
		<CreateRdaFormRoot>
			<ModalNavbar hasBack={step !== 1} onBack={onBack} onClose={onClose} />
			<FormProvider {...formData}>{getForm(step)}</FormProvider>
		</CreateRdaFormRoot>
	);
};
