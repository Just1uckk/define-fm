import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import {
	IDispositionSearch,
	IDispositionSearchSnapshot,
} from 'shared/types/disposition-search';
import { IWorkPackage } from 'shared/types/dispositions';

import { LANGUAGE_CODES } from 'shared/constants/constans';
import { DISPOSITION_SEARCH_ROUTES } from 'shared/constants/routes';

import { useTranslation } from 'shared/hooks/use-translation';

import {
	LangInput,
	LangInputCode,
	LangInputList,
	LangInputListRef,
} from 'shared/components/input/lang-input';
import { NumberField } from 'shared/components/input/number-field';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FieldToggle } from 'shared/components/modal-form/field-toggle';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageForm } from 'shared/components/modal-form/page-form';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Text } from 'shared/components/text/text';
import { TextEditor } from 'shared/components/text-editor/text-editor';

import { RdaSettingsFormDataTypes } from './change-settings-rda-form';

const FieldName = styled(Text)``;

const FieldValue = styled(Text)`
	margin-top: 0.2rem;
`;

const InfoSection = styled.section`
	padding-left: 0.5rem;
	padding-bottom: 1.2rem;
	margin-bottom: 1.2rem;
	border-bottom: ${({ theme }) => theme.border.base};
`;

const InfoField = styled.div`
	display: flex;
	align-items: center;

	& + & {
		margin-top: 10px;
	}

	${FieldName} {
		width: 35%;
	}

	${FieldValue} {
		margin-top: 0;
	}
`;

interface SettingsRdaForm {
	workPackage: IWorkPackage;
	dispositionSearch?: IDispositionSearch;
	dispositionSearchSnapshot?: IDispositionSearchSnapshot;
	allowCustomLabels: boolean;
	showAutoprocessOfApproved: boolean;
	showSecurityOverride: boolean;
	onSubmit: (data: RdaSettingsFormDataTypes) => void;
}

export const PrimaryInformationForm: React.FC<
	React.PropsWithChildren<SettingsRdaForm>
> = ({
	workPackage,
	dispositionSearch,
	dispositionSearchSnapshot,
	allowCustomLabels,
	showAutoprocessOfApproved,
	showSecurityOverride,
	onSubmit,
	children,
}) => {
	const { t, multilingualT } = useTranslation();
	const submitButtonFormRef = React.useRef<HTMLButtonElement>(null);
	const nameInputsRef = React.useRef<LangInputListRef>();
	const approveButtonLabelInputsRef = React.useRef<LangInputListRef>();
	const rejectButtonLabelInputsRef = React.useRef<LangInputListRef>();

	const {
		handleSubmit,
		register,
		watch,
		setValue,
		formState,
		formState: { errors },
		control,
	} = useFormContext<RdaSettingsFormDataTypes>();

	const instructionsValue = watch(
		'primaryInformation.multilingual.instructions',
	);
	const securityOverrideValue = watch('primaryInformation.securityOverride');
	const autoprocessApprovedItemsValue = watch(
		'primaryInformation.autoprocessApprovedItems',
	);

	const toggleSecurityOverride = () => {
		setValue(
			'primaryInformation.securityOverride',
			Number(
				!securityOverrideValue,
			) as RdaSettingsFormDataTypes['primaryInformation']['securityOverride'],
			{
				shouldValidate: true,
				shouldDirty: true,
			},
		);
	};

	const toggleAutoProcessApprovedItems = () => {
		setValue(
			'primaryInformation.autoprocessApprovedItems',
			Number(
				!autoprocessApprovedItemsValue,
			) as RdaSettingsFormDataTypes['primaryInformation']['autoprocessApprovedItems'],
			{
				shouldValidate: true,
				shouldDirty: true,
			},
		);
	};

	const onChangeInstructions = (value: string, lang: LANGUAGE_CODES) => {
		setValue(`primaryInformation.multilingual.instructions.${lang}`, value, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	return (
		<>
			<PageHeader>
				<HeaderTitle variant="h2_primary">
					{t('disposition.rda_settings_modal.title')}
				</HeaderTitle>
			</PageHeader>

			<PageForm onSubmit={handleSubmit(onSubmit)}>
				<button ref={submitButtonFormRef} type="submit" hidden />

				<InfoSection>
					<InfoField>
						<FieldName variant="body_3_primary">
							{t('rda_report.work_package_information.fields.source')}
						</FieldName>
						<FieldValue variant="body_3_secondary">
							{workPackage.sourceName}
						</FieldValue>
					</InfoField>

					<InfoField>
						<FieldName variant="body_3_primary">
							{t('rda_report.work_package_information.fields.disposition')}
						</FieldName>
						<FieldValue variant="body_3_secondary">
							<Link
								to={DISPOSITION_SEARCH_ROUTES.SEARCH.generate(
									dispositionSearch?.id as number,
								)}
								target="_blank"
								rel="noreferrer"
							>
								{
									multilingualT({
										field: 'name',
										translations: dispositionSearch?.multilingual,
										fallbackValue: dispositionSearch?.name,
									}) as string
								}
							</Link>
						</FieldValue>
					</InfoField>

					<InfoField>
						<FieldName variant="body_3_primary">
							{t(
								'rda_report.work_package_information.fields.disposition_snapshot',
							)}
						</FieldName>
						<FieldValue variant="body_3_secondary">
							<Link
								to={DISPOSITION_SEARCH_ROUTES.SNAPSHOT.generate(
									dispositionSearch?.id as number,
									dispositionSearchSnapshot?.id as number,
								)}
								target="_blank"
								rel="noreferrer"
							>
								{dispositionSearchSnapshot?.name}
							</Link>
						</FieldValue>
					</InfoField>
				</InfoSection>

				<FormGroup>
					<FormField>
						<LangInputList innerRef={nameInputsRef}>
							<LangInput
								{...register('primaryInformation.multilingual.name.en')}
								error={
									formState.errors.primaryInformation?.multilingual?.name?.en
										?.message
										? t(
												formState.errors.primaryInformation?.multilingual?.name
													?.en?.message,
										  )
										: formState.errors.primaryInformation?.multilingual?.name
												?.en?.message
								}
								label={t('auth_provider.provider_form.name')}
								lang={LANGUAGE_CODES.EN}
								autoComplete="off"
							/>
							<LangInput
								{...register('primaryInformation.multilingual.name.fr_CA')}
								error={
									formState.errors.primaryInformation?.multilingual?.name?.fr_CA
										?.message
										? t(
												formState.errors.primaryInformation?.multilingual?.name
													?.fr_CA?.message,
										  )
										: formState.errors.primaryInformation?.multilingual?.name
												?.fr_CA?.message
								}
								lang={LANGUAGE_CODES.FR_CD}
								label={t('auth_provider.provider_form.name')}
								autoComplete="off"
							/>
						</LangInputList>
					</FormField>
					<FormField>
						<Controller
							control={control}
							name="primaryInformation.numberOfDaysToComplete"
							render={({ field }) => (
								<NumberField
									{...field}
									label={t('disposition.rda_settings_form.time_to_complete')}
									errorMessage={
										errors.primaryInformation?.numberOfDaysToComplete?.message
											? t(
													errors.primaryInformation?.numberOfDaysToComplete
														.message,
											  )
											: errors?.primaryInformation?.numberOfDaysToComplete
													?.message
									}
									fulfilled
									minValue={0}
								/>
							)}
						/>
					</FormField>
					<FormField>
						<LangInputList innerRef={approveButtonLabelInputsRef}>
							<LangInput
								{...register(
									'primaryInformation.multilingual.approveButtonLabel.en',
								)}
								error={
									formState.errors.primaryInformation?.multilingual
										?.approveButtonLabel?.en?.message
										? t(
												formState.errors.primaryInformation?.multilingual
													?.approveButtonLabel?.en?.message,
										  )
										: formState.errors.primaryInformation?.multilingual
												?.approveButtonLabel?.en?.message
								}
								label={t('disposition.rda_settings_form.approve_button_label')}
								lang={LANGUAGE_CODES.EN}
								autoComplete="off"
								disabled={!allowCustomLabels}
							/>
							<LangInput
								{...register(
									'primaryInformation.multilingual.approveButtonLabel.fr_CA',
								)}
								error={
									formState.errors.primaryInformation?.multilingual
										?.approveButtonLabel?.fr_CA?.message
										? t(
												formState.errors.primaryInformation?.multilingual
													?.approveButtonLabel?.fr_CA?.message,
										  )
										: formState.errors.primaryInformation?.multilingual
												?.approveButtonLabel?.fr_CA?.message
								}
								lang={LANGUAGE_CODES.FR_CD}
								label={t('disposition.rda_settings_form.approve_button_label')}
								autoComplete="off"
								disabled={!allowCustomLabels}
							/>
						</LangInputList>

						<LangInputList innerRef={rejectButtonLabelInputsRef}>
							<LangInput
								{...register(
									'primaryInformation.multilingual.rejectButtonLabel.en',
								)}
								error={
									formState.errors.primaryInformation?.multilingual
										?.rejectButtonLabel?.en?.message
										? t(
												formState.errors.primaryInformation?.multilingual
													?.rejectButtonLabel?.en?.message,
										  )
										: formState.errors.primaryInformation?.multilingual
												?.rejectButtonLabel?.en?.message
								}
								label={t('disposition.rda_settings_form.reject_button_label')}
								lang={LANGUAGE_CODES.EN}
								autoComplete="off"
								disabled={!allowCustomLabels}
							/>
							<LangInput
								{...register(
									'primaryInformation.multilingual.rejectButtonLabel.fr_CA',
								)}
								error={
									formState.errors.primaryInformation?.multilingual
										?.rejectButtonLabel?.fr_CA?.message
										? t(
												formState.errors.primaryInformation?.multilingual
													?.rejectButtonLabel?.fr_CA?.message,
										  )
										: formState.errors.primaryInformation?.multilingual
												?.rejectButtonLabel?.fr_CA?.message
								}
								lang={LANGUAGE_CODES.FR_CD}
								label={t('disposition.rda_settings_form.reject_button_label')}
								autoComplete="off"
								disabled={!allowCustomLabels}
							/>
						</LangInputList>
					</FormField>
					<FormField>
						<LangInputList>
							<LangInputCode lang={LANGUAGE_CODES.EN}>
								<TextEditor
									label={t('disposition.rda_settings_form.instructions')}
									value={instructionsValue[LANGUAGE_CODES.EN]}
									onChange={(value) =>
										onChangeInstructions(value, LANGUAGE_CODES.EN)
									}
								/>
							</LangInputCode>

							<LangInputCode lang={LANGUAGE_CODES.FR_CD}>
								<TextEditor
									label={t('disposition.rda_settings_form.instructions')}
									value={instructionsValue[LANGUAGE_CODES.FR_CD]}
									onChange={(value) =>
										onChangeInstructions(value, LANGUAGE_CODES.FR_CD)
									}
								/>
							</LangInputCode>
						</LangInputList>
					</FormField>
					{showSecurityOverride && (
						<FormField grid={false}>
							<FieldToggle
								label={
									<Text>
										{t('disposition.rda_settings_form.security_override.name')}
									</Text>
								}
								subText={t(
									'disposition.rda_settings_form.security_override.sub_text',
								)}
								onChange={toggleSecurityOverride}
								checked={Boolean(securityOverrideValue)}
								justifyContent="space-between"
							/>
						</FormField>
					)}
					{showAutoprocessOfApproved && (
						<FormField grid={false}>
							<FieldToggle
								label={
									<Text>
										{t(
											'disposition.rda_settings_form.autoprocess_approved_items.name',
										)}
									</Text>
								}
								subText={t(
									'disposition.rda_settings_form.autoprocess_approved_items.sub_text',
								)}
								justifyContent="space-between"
								onChange={toggleAutoProcessApprovedItems}
								checked={Boolean(autoprocessApprovedItemsValue)}
							/>
						</FormField>
					)}
				</FormGroup>
				<ModalFooter>{children}</ModalFooter>
			</PageForm>
		</>
	);
};
