import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { CreateRdaFormDataTypes } from 'modules/rda-work-packages/components/create-rda-form/create-rda-form';

import { LANGUAGE_CODES } from 'shared/constants/constans';

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
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageForm } from 'shared/components/modal-form/page-form';
import { Text } from 'shared/components/text/text';
import { TextEditor } from 'shared/components/text-editor/text-editor';

interface DetailedInformationProps {
	allowCustomLabels: boolean;
	showSecurityOverride: boolean;
	showAutoprocessApprovedItemsToggle: boolean;
	onSubmit: () => void;
}

export const DetailedInformation: React.FC<
	React.PropsWithChildren<DetailedInformationProps>
> = ({
	showSecurityOverride,
	allowCustomLabels,
	showAutoprocessApprovedItemsToggle,
	onSubmit,
	children,
}) => {
	const { t } = useTranslation();
	const approveButtonLabelInputsRef = React.useRef<LangInputListRef>();
	const rejectButtonLabelInputsRef = React.useRef<LangInputListRef>();
	const {
		formState,
		formState: { errors },
		register,
		control,
		getValues,
		...methods
	} = useFormContext<CreateRdaFormDataTypes>();

	const instructionsValue = methods.watch('multilingual.instructions');
	const securityOverrideValue = methods.watch('securityOverride');
	const autoprocessApprovedItemsValue = methods.watch(
		'autoprocessApprovedItems',
	);

	const toggleSecurityOverride = () => {
		methods.setValue(
			'securityOverride',
			Number(
				!securityOverrideValue,
			) as CreateRdaFormDataTypes['securityOverride'],
			{
				shouldValidate: true,
				shouldDirty: true,
			},
		);
	};

	const toggleAutoProcessApprovedItems = () => {
		methods.setValue(
			'autoprocessApprovedItems',
			Number(
				!autoprocessApprovedItemsValue,
			) as CreateRdaFormDataTypes['autoprocessApprovedItems'],
			{
				shouldValidate: true,
				shouldDirty: true,
			},
		);
	};

	const onChangeInstructions = (value: string, lang: LANGUAGE_CODES) => {
		methods.setValue(`multilingual.instructions.${lang}`, value, {
			shouldValidate: true,
			shouldDirty: true,
		});
	};

	return (
		<PageBody>
			<PageForm onSubmit={methods.handleSubmit(onSubmit)}>
				<FormGroup>
					<FormField>
						<Controller
							control={control}
							name="numberOfDaysToComplete"
							render={({ field }) => (
								<NumberField
									{...field}
									label={t('disposition.rda_settings_form.time_to_complete')}
									errorMessage={
										errors?.numberOfDaysToComplete?.message
											? t(errors.numberOfDaysToComplete.message)
											: errors?.numberOfDaysToComplete?.message
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
								{...register('multilingual.approveButtonLabel.en')}
								error={
									formState.errors.multilingual?.approveButtonLabel?.en?.message
										? t(
												formState.errors.multilingual?.approveButtonLabel?.en
													?.message,
										  )
										: formState.errors.multilingual?.approveButtonLabel?.en
												?.message
								}
								label={t('disposition.rda_settings_form.approve_button_label')}
								lang={LANGUAGE_CODES.EN}
								autoComplete="off"
								disabled={!allowCustomLabels}
							/>
							<LangInput
								{...register('multilingual.approveButtonLabel.fr_CA')}
								error={
									formState.errors.multilingual?.approveButtonLabel?.fr_CA
										?.message
										? t(
												formState.errors.multilingual?.approveButtonLabel?.fr_CA
													?.message,
										  )
										: formState.errors.multilingual?.approveButtonLabel?.fr_CA
												?.message
								}
								lang={LANGUAGE_CODES.FR_CD}
								label={t('disposition.rda_settings_form.approve_button_label')}
								autoComplete="off"
								disabled={!allowCustomLabels}
							/>
						</LangInputList>

						<LangInputList innerRef={rejectButtonLabelInputsRef}>
							<LangInput
								{...register('multilingual.rejectButtonLabel.en')}
								error={
									formState.errors.multilingual?.rejectButtonLabel?.en?.message
										? t(
												formState.errors.multilingual?.rejectButtonLabel?.en
													?.message,
										  )
										: formState.errors.multilingual?.rejectButtonLabel?.en
												?.message
								}
								label={t('disposition.rda_settings_form.reject_button_label')}
								lang={LANGUAGE_CODES.EN}
								autoComplete="off"
								disabled={!allowCustomLabels}
							/>
							<LangInput
								{...register('multilingual.rejectButtonLabel.fr_CA')}
								error={
									formState.errors.multilingual?.rejectButtonLabel?.fr_CA
										?.message
										? t(
												formState.errors.multilingual?.rejectButtonLabel?.fr_CA
													?.message,
										  )
										: formState.errors.multilingual?.rejectButtonLabel?.fr_CA
												?.message
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
					{showAutoprocessApprovedItemsToggle && (
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
				<ModalFooter justifyContent="space-between">{children}</ModalFooter>
			</PageForm>
		</PageBody>
	);
};
