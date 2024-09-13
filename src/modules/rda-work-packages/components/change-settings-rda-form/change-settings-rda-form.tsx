import React, { useImperativeHandle, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { PrimaryInformationForm } from 'modules/rda-work-packages/components/change-settings-rda-form/primary-information';
import { DispositionActionForm } from 'modules/rda-work-packages/components/disposition-action-form/disposition-action-form';
import { getMultiLangValues } from 'shared/utils/multilang-helpers';
import * as yup from 'yup';

import { AllDispositionActionsDto } from 'app/api/disposition-action-api/disposition-action-api';

import i18n from 'app/settings/i18n/i18n';

import {
	IDispositionSearch,
	IDispositionSearchSnapshot,
} from 'shared/types/disposition-search';
import { IWorkPackage } from 'shared/types/dispositions';
import { LanguageTypes } from 'shared/types/users';

import { LANGUAGE_CODES } from 'shared/constants/constans';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { useModalContext } from 'shared/components/modal';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { ModalSteps } from 'shared/components/modal/modal-steps';

const schema = yup
	.object({
		primaryInformation: yup.object().when(['$currentStep'], {
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
					numberOfDaysToComplete: yup
						.number()
						.min(
							1,
							i18n.t('validation_errors.min_value', {
								length: 1,
							}),
						)
						.required('validation_errors.field_is_required'),
					rejectButtonLabel: yup.string().trim(),
					securityOverride: yup.number().oneOf([0, 1]),
					autoprocessApprovedItems: yup.number().oneOf([0, 1]),
				}),
		}),
	})
	.defined();

const resolver = yupResolver(schema);

export type RdaSettingsFormDataTypes = {
	primaryInformation: {
		multilingual: Record<
			'name' | 'approveButtonLabel' | 'rejectButtonLabel' | 'instructions',
			Record<LanguageTypes, string>
		>;
		numberOfDaysToComplete: IWorkPackage['numberOfDaysToComplete'];
		securityOverride: IWorkPackage['securityOverride'];
		autoprocessApprovedItems: IWorkPackage['autoprocessApprovedItems'];
	};
	dispositionAction: number;
};

export interface WorkPackageSettingsFormRef {
	isDirty: boolean;
	onSubmit: () => void;
}

interface SettingsRdaForm {
	formRef: React.Ref<WorkPackageSettingsFormRef>;
	workPackage: IWorkPackage;
	allDispositionActions: AllDispositionActionsDto[] | [];
	dispositionSearch?: IDispositionSearch;
	dispositionSearchSnapshot?: IDispositionSearchSnapshot;
	allowCustomLabels: boolean;
	isSubmitting?: boolean;
	showAutoprocessOfApproved: boolean;
	showSecurityOverride: boolean;
	onSubmit: (data: RdaSettingsFormDataTypes) => void;
}

export const ChangeSettingsRdaForm: React.FC<
	React.PropsWithChildren<SettingsRdaForm>
> = ({
	formRef,
	workPackage,
	dispositionSearch,
	dispositionSearchSnapshot,
	allDispositionActions,
	allowCustomLabels,
	isSubmitting,
	showAutoprocessOfApproved,
	showSecurityOverride,
	onSubmit,
}) => {
	const modalContext = useModalContext();
	const { t, currentLang } = useTranslation();
	const [step, setStep] = useState(1);
	const submitButtonFormRef = React.useRef<HTMLButtonElement>(null);

	const formData = useForm<RdaSettingsFormDataTypes>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		defaultValues: {
			primaryInformation: {
				multilingual: getMultiLangValues(
					workPackage,
					['name', 'approveButtonLabel', 'rejectButtonLabel', 'instructions'],
					currentLang,
				),
				numberOfDaysToComplete: workPackage.numberOfDaysToComplete,
				securityOverride: workPackage.securityOverride,
				autoprocessApprovedItems: workPackage.autoprocessApprovedItems,
			},
			dispositionAction: workPackage.dispositionActionId || 1,
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

	const onBack = () => setStep((prevValue) => prevValue - 1);

	const steps = <ModalSteps totalSteps={2} step={step} />;

	const handleFinishForm = () => {
		const data = formData.getValues();

		onSubmit(data);
	};

	const handleFinishPrimary = () => {
		setStep((prevValue) => prevValue + 1);
	};

	const forms = {
		1: (
			<PrimaryInformationForm
				workPackage={workPackage}
				allowCustomLabels={allowCustomLabels}
				dispositionSearch={dispositionSearch}
				dispositionSearchSnapshot={dispositionSearchSnapshot}
				onSubmit={handleFinishPrimary}
				showAutoprocessOfApproved={showAutoprocessOfApproved}
				showSecurityOverride={showSecurityOverride}
			>
				<button ref={submitButtonFormRef} type="submit" hidden />
				<ButtonList>
					<Button
						type="submit"
						icon={ICON_COLLECTION.chevron_right}
						label={t(
							'disposition.rda_settings_modal.actions.set_disposition_action',
						)}
						loading={isSubmitting}
					/>
					<Button
						variant="primary_outlined"
						label={t('disposition.rda_settings_modal.actions.cancel')}
						disabled={isSubmitting}
						onClick={modalContext.onClose}
					/>
				</ButtonList>
				{steps}
			</PrimaryInformationForm>
		),
		2: (
			<DispositionActionForm
				allDispositionActions={allDispositionActions}
				onSubmit={handleFinishForm}
			>
				<button ref={submitButtonFormRef} type="submit" hidden />
				<ButtonList>
					<Button
						type="submit"
						icon={ICON_COLLECTION.chevron_right}
						label={t('disposition.rda_settings_modal.actions.save_changes')}
						loading={isSubmitting}
					/>
					<Button
						variant="primary_outlined"
						label={t('disposition.rda_settings_modal.actions.cancel')}
						disabled={isSubmitting}
						onClick={modalContext.onClose}
					/>
				</ButtonList>

				{steps}
			</DispositionActionForm>
		),
	};

	return (
		<>
			<ModalNavbar
				hasBack={step !== 1}
				onBack={onBack}
				onClose={modalContext.onClose}
			/>
			<FormProvider {...formData}>{forms[step]}</FormProvider>
		</>
	);
};
