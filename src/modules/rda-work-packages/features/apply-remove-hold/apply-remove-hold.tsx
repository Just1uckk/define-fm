import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { ApplyRemoveHoldForm } from 'modules/rda-work-packages/components/forms/aply-remove-hold-form';
import { useStateModalManager } from 'shared/context/modal-manager';
import styled from 'styled-components';
import * as yup from 'yup';

import {
	BulkApi,
	HoldInformationDto,
	SendHoldInformationInterface,
} from 'app/api/bulk-api/bulk-api';

import { IFile, IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { BULK_ACTION_MENU_QUERY_KEYS } from 'shared/constants/query-keys';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { Modal } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { PageForm } from 'shared/components/modal-form/page-form';
import { Option } from 'shared/components/select/select';

const StyledModalRoot = styled(Modal.Root)`
	.modal_content_wrapper {
		max-width: 500px;
	}
`;

export interface ApplyRemoveHoldInterface {
	workPackage: IWorkPackage | undefined;
	selectedItems: any;
	fileList: IFile[];
}

type useBulkActionsTypes = {
	holdID: number;
	holdAction: string;
};

const schema = yup
	.object({
		holdID: yup.number().required('validation_errors.field_is_required'),
		holdAction: yup.string().required('validation_errors.field_is_required'),
	})
	.defined();

const resolver = yupResolver(schema);

export function ApplyRemoveHold({
	workPackage,
	selectedItems,
	fileList,
}: ApplyRemoveHoldInterface) {
	const { t } = useTranslation();

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.APPLY_REMOVE_HOLD,
	);

	const { data: holdInformation = [], isLoading: isHoldInformationLoading } =
		useQuery({
			enabled: fileList.length > 1,
			queryKey: BULK_ACTION_MENU_QUERY_KEYS.hold_information,
			queryFn: () => BulkApi.getHoldInformation(fileList[0]?.id || 123),
		});

	const sendHoldInformationMutation = useMutation({
		mutationFn: async (holdInformation: SendHoldInformationInterface) => {
			await BulkApi.sendHoldInformation(holdInformation);
			modalState.close();
		},
	});

	const {
		formState: { errors },
		handleSubmit,
		watch,
		setValue,
		reset,
	} = useForm<useBulkActionsTypes>({
		resolver: resolver,
	});

	const holdWatch = watch('holdID');
	const holdActionWatch = watch('holdAction');

	const actionOptions: Option[] = [
		{
			key: 'add',
			value: 'Add',
			label: 'Add',
		},
		{
			key: 'remove',
			value: 'Remove',
			label: 'Remove',
		},
	];

	const selectedHold = useMemo(() => {
		if (holdInformation) {
			return holdInformation.find((element) => element.holdID === holdWatch);
		}
		return undefined;
	}, [holdWatch]);

	const selectedHoldAction = useMemo(() => {
		if (actionOptions) {
			return actionOptions.find((element) => element.value === holdActionWatch);
		}
		return undefined;
	}, [holdActionWatch]);

	const handleChangeHold = (holdData: HoldInformationDto | null) => {
		if (holdData) {
			setValue('holdID', holdData.holdID, {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	};

	const handleChangeHoldAction = (action: Option | null) => {
		if (action) {
			setValue('holdAction', `${action.value}`, {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	};

	const handleRefreshButton = () => {
		reset();
	};

	const onSubmit = () => {
		if (selectedItems) {
			let listId: any[] = Object.keys(selectedItems);
			if (listId.length) {
				listId = listId.map((element) => Number(element));
				sendHoldInformationMutation.mutate({
					rdaItems: listId,
					holdAction: holdActionWatch,
					holdId: holdWatch,
				});
			}
		}
	};

	return (
		<StyledModalRoot
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={modalState.close}
			placement="center"
		>
			<Modal.Page
				header={t('disposition_report.apply_remove_hold_modal.title')}
			>
				<PageForm onSubmit={handleSubmit(onSubmit)}>
					<ApplyRemoveHoldForm
						errors={errors}
						actionOptions={actionOptions}
						selectedHoldAction={selectedHoldAction}
						handleChangeHoldAction={handleChangeHoldAction}
						selectedHold={selectedHold}
						handleChangeHold={handleChangeHold}
						holdInformation={holdInformation}
						isHoldInformationLoading={isHoldInformationLoading}
					>
						<ModalFooter>
							<ButtonList justifyContent="center">
								<Button
									loading={sendHoldInformationMutation.isLoading}
									type="submit"
									label={t(
										'disposition_report.apply_remove_hold_modal.actions.apply',
									)}
								/>
								<Button
									type="button"
									label={t(
										'disposition_report.apply_remove_hold_modal.actions.cancel',
									)}
									onClick={() => {
										reset();
										modalState.close();
									}}
									variant="primary_outlined"
								/>
								<Button
									type="button"
									label={t(
										'disposition_report.apply_remove_hold_modal.actions.reset',
									)}
									variant="primary_outlined"
									onClick={handleRefreshButton}
								/>
							</ButtonList>
						</ModalFooter>
					</ApplyRemoveHoldForm>
				</PageForm>
			</Modal.Page>
		</StyledModalRoot>
	);
}
