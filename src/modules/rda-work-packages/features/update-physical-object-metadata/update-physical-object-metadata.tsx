import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { UpdatePhysicalObjectMetadataForm } from 'modules/rda-work-packages/components/forms/update-physical-object-metadata-form';
import { useStateModalManager } from 'shared/context/modal-manager';
import styled from 'styled-components';
import * as yup from 'yup';

import { BulkApi, SendPhysicalInterface } from 'app/api/bulk-api/bulk-api';

import { IFile, IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { BULK_ACTION_MENU_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';
import { PageForm } from 'shared/components/modal-form/page-form';

const StyledModal = styled(Modal.Root)`
	.modal_content_wrapper {
		max-width: 750px;
	}
`;

interface UpdatePhysicalObjectMetadataInterface {
	workPackage: IWorkPackage | undefined;
	selectedItems: any;
	fileList: IFile[];
}

type usePhysicalObject = {
	homeLocation: string;
	currentLocation: string;
	fromDate: Date | null;
	toDate: Date | null;
	offsiteStorageId: number | null;
	temporaryId: number | null;
};

const schema = yup
	.object({
		homeLocation: yup.string().required('validation_errors.field_is_required'),
		currentLocation: yup
			.string()
			.required('validation_errors.field_is_required'),
		fromDate: yup
			.date()
			.required('validation_errors.field_is_required')
			.nullable(),
		toDate: yup
			.date()
			.required('validation_errors.field_is_required')
			.nullable(),
		offsiteStorageId: yup
			.number()
			.required('validation_errors.field_is_required')
			.nullable(),
		temporaryId: yup
			.number()
			.required('validation_errors.field_is_required')
			.nullable(),
	})
	.defined();

const resolver = yupResolver(schema);

export function UpdatePhysicalObjectMetadata({
	selectedItems,
	workPackage,
	fileList,
}: UpdatePhysicalObjectMetadataInterface) {
	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.UPDATE_PHYSICAL_OBJECT_METADATA,
	);

	const { data: physicalObject, isLoading } = useQuery({
		enabled: fileList.length > 1,
		queryKey: BULK_ACTION_MENU_QUERY_KEYS.update_physical_object_metadata,
		queryFn: () => BulkApi.getUpdatePhysicalObject(fileList[0]?.id || 123),
	});

	const physicalObjectMutation = useMutation({
		mutationFn: async (physicalInformation: SendPhysicalInterface) => {
			await BulkApi.sendPhysicalObject(physicalInformation);
			reset();
			modalState.close();
		},
	});

	const {
		formState: { errors },
		handleSubmit,
		watch,
		setValue,
		reset,
	} = useForm<usePhysicalObject>({
		resolver: resolver,
		defaultValues: {
			fromDate: null,
			toDate: null,
			offsiteStorageId: null,
			temporaryId: null,
		},
	});

	const homeLocation = watch('homeLocation');
	const currentLocation = watch('currentLocation');
	const fromDate = watch('fromDate');
	const toDate = watch('toDate');
	const offsiteStorageId = watch('offsiteStorageId');
	const temporaryId = watch('temporaryId');

	const selectedHomeLocation = useMemo(() => {
		if (physicalObject?.locationCodes) {
			return physicalObject.locationCodes.find(
				(element) => element.location === homeLocation,
			);
		}
		return undefined;
	}, [homeLocation]);

	const selectedCurrentLocation = useMemo(() => {
		if (physicalObject?.locationCodes) {
			return physicalObject.locationCodes.find(
				(element) => element.location === currentLocation,
			);
		}
		return undefined;
	}, [currentLocation]);

	const handleChange = (data: any) => {
		const objectKey: any = Object.keys(data)[0];
		if (objectKey === 'offsiteStorageId' || objectKey === 'temporaryId') {
			const value = Number(data[objectKey]);
			if (value <= 0) {
				data[objectKey] = null;
			} else {
				data[objectKey] = value;
			}
		}
		setValue(objectKey, data[objectKey], {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	const handleCancelButton = () => {
		reset();
		modalState.close();
	};

	const handleResetButton = () => {
		reset();
	};

	const onSubmit = () => {
		physicalObjectMutation.mutate({
			rdaItems: Object.keys(selectedItems).map((element) => Number(element)),
			homeLocation,
			currentLocation,
			fromDate,
			toDate,
			offsiteStorageId,
			temporaryId,
		});
	};

	return (
		<StyledModal
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={modalState.close}
			placement="center"
		>
			<Modal.Page header="Update Physical Object MetaData">
				<PageForm onSubmit={handleSubmit(onSubmit)}>
					<UpdatePhysicalObjectMetadataForm
						errors={errors}
						listOptions={physicalObject}
						selectedHomeLocation={selectedHomeLocation}
						selectedCurrentLocation={selectedCurrentLocation}
						selectedFromDate={fromDate}
						selectedToDate={toDate}
						selectedTemporaryId={temporaryId}
						selectedOffsiteStorageId={offsiteStorageId}
						handleChange={handleChange}
						handleCancelButton={handleCancelButton}
						handleResetButton={handleResetButton}
						isLoadingApplyButton={physicalObjectMutation.isLoading}
					/>
				</PageForm>
			</Modal.Page>
		</StyledModal>
	);
}
