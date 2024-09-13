import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Item } from 'react-stately';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import * as yup from 'yup';

import { ICoreConfig } from 'shared/types/core-config';
import { IExtensionReason } from 'shared/types/dispositions';

import { useTranslation } from 'shared/hooks/use-translation';

import { FormField } from 'shared/components/modal-form/form-field';
import { Select } from 'shared/components/select/select';
import { Textarea } from 'shared/components/textarea/textarea';

const schema = yup
	.object({
		reason: yup
			.string()
			.trim()
			.when('$isReasonRequired', {
				is: true,
				then: (schema) =>
					schema.required('validation_errors.field_is_required'),
			}),
		comment: yup
			.string()
			.trim()
			.when('$isCommentRequired', {
				is: true,
				then: (schema) =>
					schema.required('validation_errors.field_is_required'),
			}),
	})
	.defined();

export type RejectAndExtendFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

const Form = styled.form``;

interface RejectExtendFormProps {
	reasonList: IExtensionReason[];
	rejectRdaSettings: {
		reasonSetting?: ICoreConfig;
		commentSetting?: ICoreConfig;
	};
	onSubmit: (data: RejectAndExtendFormData) => void;
}

export const RejectExtendForm: React.FC<
	React.PropsWithChildren<RejectExtendFormProps>
> = ({ reasonList, rejectRdaSettings, onSubmit, children }) => {
	const { t } = useTranslation();

	const { register, setValue, watch, handleSubmit, formState } =
		useForm<RejectAndExtendFormData>({
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			resolver: resolver,
			context: {
				isReasonRequired: rejectRdaSettings.reasonSetting?.value === 'true',
				isCommentRequired: rejectRdaSettings.commentSetting?.value === 'true',
			},
		});
	const reasonValue = watch('reason');

	const handleChangeReason = (option: { value: IExtensionReason } | null) => {
		if (!option) return;

		setValue('reason', option.value, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const convertedReasonList = useMemo(
		() => reasonList.map((reason) => ({ value: reason })),
		[reasonList],
	);

	return (
		<Form onSubmit={handleSubmit(onSubmit)}>
			<FormField>
				<Select<{ value: IExtensionReason }>
					{...register('reason')}
					label={t('disposition.reject_and_extend_form.reason')}
					onChange={handleChangeReason}
					options={convertedReasonList}
					selectedKey={reasonValue}
					error={
						formState.errors?.reason?.message
							? t(formState.errors.reason.message)
							: formState.errors?.reason?.message
					}
				>
					{(option) => (
						<Item key={option.value} textValue={option.value}>
							{option.value}
						</Item>
					)}
				</Select>
			</FormField>
			<FormField>
				<Textarea
					{...register('comment')}
					label={t('disposition.reject_and_extend_form.comment')}
					error={
						formState.errors?.comment?.message
							? t(formState.errors.comment.message)
							: formState.errors?.comment?.message
					}
				/>
			</FormField>
			{children}
		</Form>
	);
};
