import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import styled from 'styled-components';
import * as yup from 'yup';

import { BulkApi, SendMoveInterface } from 'app/api/bulk-api/bulk-api';

import { IWorkPackage } from 'shared/types/dispositions';

import { BULK_ACTION_MENU_QUERY_KEYS } from 'shared/constants/query-keys';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { Input } from 'shared/components/input/input';
import { useModalContext } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { PageForm } from 'shared/components/modal-form/page-form';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';
import { Toggle } from 'shared/components/toggle/toggle';

const StyledFormField = styled(FormField)`
	grid-template-columns: 16% 48% 38%;
`;

const StyledPageForm = styled(PageForm)`
	gap: 2rem;
`;

const BrowseContentButton = styled(Button)`
	justify-self: flex-start;
	margin-left: 1rem;
`;

const ToggleList = styled.div`
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
`;

const SpinnerContainer = styled.div`
	height: 200px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const FolderRow = styled.div`
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	padding: 12px 24px;
	border-radius: 0.5rem;
	margin: 10px 0px;
	grid-template-columns: 50% 30% 20%;
	display: grid;
	align-items: center;
`;

const BrowserFolderContainer = styled.div`
	max-height: 400px;
	min-height: 200px;
`;

const FolderDiv = styled.div`
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	padding-right: 30px;
`;

interface MoveItemsFormInterface {
	workPackage: IWorkPackage | undefined;
	selectedItems: any;
	closeModal: () => void;
}

enum CATEGORY_RETENTION {
	KEEP_ORIGINAl = 0,
	INHERIT = 1,
	MERGE = 2,
}

type useMoveItemInterfase = {
	targetContainerId: number;
	nameConflict: number;
	categoryRetention: number;
	classificationRetention: number;
};

const schema = yup
	.object({
		targetContainerId: yup
			.number()
			.required('validation_errors.field_is_required'),
		nameConflict: yup.number().required('validation_errors.field_is_required'),
		categoryRetention: yup
			.number()
			.required('validation_errors.field_is_required'),
		classificationRetention: yup
			.number()
			.required('validation_errors.field_is_required'),
	})
	.defined();

const resolver = yupResolver(schema);

export const MoveItemsForm: React.FC<MoveItemsFormInterface> = ({
	workPackage,
	selectedItems,
	closeModal,
}) => {
	const contextModal = useModalContext();
	const { t } = useTranslation();
	const [browseContent, setBrowseContent] = useState<boolean>(false);

	const { data: moveInformation, isLoading: isLoadingMoveInformation } =
		useQuery({
			queryKey: BULK_ACTION_MENU_QUERY_KEYS.move_information,
			queryFn: async () => {
				return await BulkApi.getMoveInformation(
					Number(Object.keys(selectedItems)[0]) || 123,
				);
			},
		});

	const sendMoveInformationMutation = useMutation({
		mutationFn: async (sendMoveInformation: SendMoveInterface) => {
			await BulkApi.sendNoveInformation(sendMoveInformation);
			reset();
			closeModal();
		},
	});

	const {
		formState: { errors },
		handleSubmit,
		watch,
		setValue,
		reset,
	} = useForm<useMoveItemInterfase>({
		resolver: resolver,
		defaultValues: {
			classificationRetention: 0,
			categoryRetention: 0,
			nameConflict: 0,
		},
	});

	const targetContainerId = watch('targetContainerId');
	const categoryRetention = watch('categoryRetention');
	const nameConflict = watch('nameConflict');
	const classificationRetention = watch('classificationRetention');

	const handleFolderChange = (id: number) => {
		setValue('targetContainerId', id, {
			shouldDirty: true,
			shouldValidate: true,
		});
		setBrowseContent(false);
	};

	const onSubmit = () => {
		sendMoveInformationMutation.mutate({
			rdaItems: Object.keys(selectedItems).map((element) => Number(element)),
			targetContainerId,
			nameConflict,
			categoryRetention,
			classificationRetention,
		});
	};

	const inputValue = useMemo(() => {
		if (moveInformation && moveInformation.length && targetContainerId) {
			const info = moveInformation.find(
				(element) => element.dataId === targetContainerId,
			);
			return info?.name;
		}
		return '';
	}, [moveInformation, targetContainerId]);

	return (
		<StyledPageForm onSubmit={handleSubmit(onSubmit)}>
			{!browseContent ? (
				<>
					<StyledFormField alignItems="center">
						<Text variant="body_3_secondary">Move to:</Text>
						<Input
							error={
								errors?.targetContainerId?.message
									? t(errors?.targetContainerId?.message)
									: errors?.targetContainerId?.message
							}
							value={inputValue}
							readonly
						/>
						<BrowseContentButton
							type="button"
							label="Browse Content Server"
							onClick={() => {
								setBrowseContent(true);
							}}
						/>
					</StyledFormField>
					<StyledFormField>
						<Text variant="body_3_secondary">Categories:</Text>
						<ToggleList>
							<Toggle
								onChange={() => {
									setValue(
										'categoryRetention',
										CATEGORY_RETENTION.KEEP_ORIGINAl,
										{
											shouldDirty: true,
											shouldValidate: true,
										},
									);
								}}
								checked={categoryRetention === CATEGORY_RETENTION.KEEP_ORIGINAl}
								label="Keep Original"
							/>
							<Toggle
								onChange={() => {
									setValue('categoryRetention', CATEGORY_RETENTION.INHERIT, {
										shouldDirty: true,
										shouldValidate: true,
									});
								}}
								checked={categoryRetention === CATEGORY_RETENTION.INHERIT}
								label="Inherit from Desctination"
							/>
						</ToggleList>
					</StyledFormField>
					<StyledFormField>
						<Text variant="body_3_secondary">RM Classifications:</Text>
						<ToggleList>
							<Toggle disabled label="Keep Original" />
							<Toggle disabled label="Inherit from Desctination" />
						</ToggleList>
					</StyledFormField>
					<ModalFooter>
						<ButtonList justifyContent="center">
							<Button
								loading={sendMoveInformationMutation.isLoading}
								type="submit"
								label={'Apply'}
							/>
							<Button
								type="button"
								variant="primary_outlined"
								label={'Cancel'}
								onClick={() => {
									reset();
									closeModal();
								}}
							/>
							<Button
								type="button"
								variant="primary_outlined"
								label={'Reset'}
								onClick={() => {
									reset();
								}}
							/>
						</ButtonList>
					</ModalFooter>
				</>
			) : (
				<BrowserFolderContainer>
					{moveInformation?.length ? (
						moveInformation.map((element) => (
							<FolderRow key={element.dataId}>
								<FolderDiv>{element.name}</FolderDiv>
								<FolderDiv>Type: {element.displayType}</FolderDiv>
								<Button
									onClick={() => {
										handleFolderChange(element.dataId);
									}}
									type="button"
									alignContent
									label={'Select'}
								/>
							</FolderRow>
						))
					) : (
						<SpinnerContainer>
							<Spinner />
						</SpinnerContainer>
					)}
				</BrowserFolderContainer>
			)}
		</StyledPageForm>
	);
};
