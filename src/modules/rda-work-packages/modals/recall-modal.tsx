import React, { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import * as yup from 'yup';

import { ThemeProps } from 'app/settings/theme/theme';

import { IWorkPackage } from 'shared/types/dispositions';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ExternalTranslation } from 'shared/components/external-translation';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	Modal,
	ModalContext,
	ModalContextProps,
} from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { Text } from 'shared/components/text/text';
import { TextEditor } from 'shared/components/text-editor/text-editor';
import { Title } from 'shared/components/title/title';

const StyledIcon = styled(Icon)<ThemeProps>`
	margin-top: 1.875rem;
	color: ${({ theme }) => theme.colors.yellow.style_1};

	svg {
		width: 2.3rem;
		height: auto;
	}
`;

const ModalBody = styled.div`
	text-align: center;
`;

const Form = styled.form`
	display: flex;
	flex-direction: column;
`;

const TextAreaWrapper = styled.div`
	margin-top: 1.5rem;
	margin-bottom: 0.75rem;
	padding: 0 1rem;
`;

const schema = yup
	.object({
		comment: yup
			.string()
			.trim()
			.required('validation_errors.field_is_required'),
	})
	.defined();

export type RecallFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

interface RecallModalProps {
	dispositions: IWorkPackage[];
	defaultRecallText?: string;
	isLoading: boolean;
	onSubmit: (data: RecallFormData) => void;
}

export const RecallModal: React.FC<RecallModalProps> = ({
	dispositions,
	defaultRecallText,
	isLoading,
	onSubmit,
}) => {
	const { t } = useTranslation();
	const modalContext = useContext<ModalContextProps>(ModalContext);

	const { formState, setValue, handleSubmit, watch } = useForm<RecallFormData>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		defaultValues: {
			comment: defaultRecallText,
		},
	});

	const comment = watch('comment');

	const handleChangeMessage = (value: string) => {
		setValue('comment', value, { shouldDirty: true, shouldValidate: true });
	};

	return (
		<Modal.Page>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<ModalBody>
					<StyledIcon icon={ICON_COLLECTION.warning} />
					<Title variant="h2_primary_semibold" mt="0.8rem">
						{dispositions.length > 1 &&
							t('disposition.recall_disposition_modal.many_items.title', {
								count: dispositions.length,
							})}
						{dispositions.length === 1 && (
							<>
								{t('disposition.recall_disposition_modal.single_item.title')}
								<div>
									<ExternalTranslation
										field="name"
										translations={dispositions[0].multilingual}
										fallbackValue={dispositions[0].name}
									/>
								</div>
							</>
						)}
					</Title>

					<Text variant="body_1_primary" mt="1.25rem">
						{t('disposition.recall_disposition_modal.description_text')}
					</Text>

					<TextAreaWrapper>
						<TextEditor
							label={t('disposition.recall_disposition_modal.form.comment')}
							value={comment}
							error={
								formState.errors?.comment?.message
									? t(formState.errors.comment.message)
									: formState.errors?.comment?.message
							}
							onChange={handleChangeMessage}
						/>
					</TextAreaWrapper>
				</ModalBody>
				<ModalFooter>
					<ButtonList justifyContent="center">
						<Button
							icon={ICON_COLLECTION.chevron_right}
							label={t('disposition.recall_disposition_modal.actions.submit')}
							loading={isLoading}
						/>
						<Button
							type="button"
							variant="primary_outlined"
							label={t('disposition.recall_disposition_modal.actions.cancel')}
							onClick={modalContext.onClose}
							disabled={isLoading}
						/>
					</ButtonList>
				</ModalFooter>
			</Form>
		</Modal.Page>
	);
};
