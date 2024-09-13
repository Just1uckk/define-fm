import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from 'react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { UpdateRecordsManagementMetadataForm } from 'modules/rda-work-packages/components/forms/update-records-management-metadata-form';
import { useStateModalManager } from 'shared/context/modal-manager';
import styled from 'styled-components';
import * as yup from 'yup';

import {
	BulkApi,
	GetUpdateRecordsManagementDto,
	SendMetadataInterface,
} from 'app/api/bulk-api/bulk-api';

import { IFile, IWorkPackage } from 'shared/types/dispositions';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { BULK_ACTION_MENU_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';
import { PageForm } from 'shared/components/modal-form/page-form';
import { Option } from 'shared/components/select/select';

const StyledModal = styled(Modal.Root)`
	.modal_content_wrapper {
		max-width: 600px;
	}
`;

interface UpdateRecordsManagementMetadataInterface {
	selectedItems: any;
	workPackage: IWorkPackage | undefined;
	fileList: IFile[];
}

const officialOptions: Option[] = [
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

const emptyResponse: GetUpdateRecordsManagementDto = {
	rmrsi: [],
	rmAccession: [],
	rmEssCode: [],
	rmStatusCode: [],
	rmStorage: [],
};

type useMetadataTypes = {
	rsi: string | null;
	status: string;
	recordDate: Date;
	statusDate: Date;
	essential: string;
	storage: string;
	accession: string;
	official: string;
};

const schema = yup
	.object({
		rsi: yup
			.string()
			.required('validation_errors.field_is_required')
			.nullable(),
		status: yup.string().required('validation_errors.field_is_required'),
		recordDate: yup.date().required('validation_errors.field_is_required'),
		statusDate: yup.date().required('validation_errors.field_is_required'),
		essential: yup.string().required('validation_errors.field_is_required'),
		storage: yup.string().required('validation_errors.field_is_required'),
		accession: yup.string().required('validation_errors.field_is_required'),
		official: yup.string().required('validation_errors.field_is_required'),
	})
	.defined();

const resolver = yupResolver(schema);

export function UpdateRecordsManagementMetadata({
	selectedItems,
	workPackage,
	fileList,
}: UpdateRecordsManagementMetadataInterface) {
	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.UPDATE_RECORDS_MANAGEMENT_METADATA,
	);

	const { data: listOfOptions = emptyResponse, isLoading } = useQuery({
		enabled: fileList.length > 1,
		queryKey: BULK_ACTION_MENU_QUERY_KEYS.update_records_management_metadata,
		queryFn: async () => {
			return await BulkApi.getUpdateRecordsManagementMetadata(
				fileList[0]?.id || 123,
			);
		},
	});

	const sendMetadataMutation = useMutation({
		mutationFn: async (metadataInformation: SendMetadataInterface) => {
			await BulkApi.sendRecordsManagementMetadata(metadataInformation);
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
	} = useForm<useMetadataTypes>({
		resolver: resolver,
		defaultValues: {
			rsi: null,
		},
	});

	const rsi = watch('rsi');
	const status = watch('status');
	const recordDate = watch('recordDate');
	const statusDate = watch('statusDate');
	const essential = watch('essential');
	const storage = watch('storage');
	const accession = watch('accession');
	const official = watch('official');

	const selectedRecordDate = useMemo(() => {
		if (recordDate) {
			return recordDate;
		}
		return undefined;
	}, [recordDate]);

	const selectedStatusDate = useMemo(() => {
		if (recordDate) {
			return statusDate;
		}
		return undefined;
	}, [statusDate]);

	const selectedRsi = useMemo(() => {
		if (listOfOptions?.rmrsi) {
			return listOfOptions.rmrsi.find((element) => element.rsi === rsi);
		}
		return undefined;
	}, [rsi]);

	const selectedStatus = useMemo(() => {
		if (listOfOptions?.rmStatusCode) {
			return listOfOptions.rmStatusCode.find(
				(element) => element.status === status,
			);
		}
		return undefined;
	}, [status]);

	const selectedEssential = useMemo(() => {
		if (listOfOptions?.rmEssCode) {
			return listOfOptions.rmEssCode.find(
				(element) => element.essential === essential,
			);
		}
		return undefined;
	}, [essential]);

	const selectedStorage = useMemo(() => {
		if (listOfOptions?.rmStorage) {
			return listOfOptions.rmStorage.find(
				(element) => element.storage === storage,
			);
		}
		return undefined;
	}, [storage]);

	const selectedAccession = useMemo(() => {
		if (listOfOptions?.rmAccession) {
			return listOfOptions.rmAccession.find(
				(element) => element.accession === accession,
			);
		}
		return undefined;
	}, [accession]);

	const selectedOfficial = useMemo(() => {
		if (listOfOptions) {
			return officialOptions.find((element) => element.value === official);
		}
		return undefined;
	}, [official]);

	const handleChange = (data: any) => {
		if (data.description || data.description === null) delete data.description;
		if (data.dateString) delete data.dateString;
		if (data.value) {
			setValue('official', data.value, {
				shouldDirty: true,
				shouldValidate: true,
			});
		} else {
			const objectKey: any = Object.keys(data)[0];
			setValue(objectKey, data[objectKey], {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	};

	const handleCancelButton = () => {
		reset();
		modalState.close();
	};

	const handleResetButton = () => {
		reset();
	};

	const onSubmit = () => {
		if (selectedItems) {
			let listId: any[] = Object.keys(selectedItems);
			if (listId.length) {
				listId = listId.map((element) => Number(element));
				sendMetadataMutation.mutate({
					rdaItems: listId,
					rsi,
					recordDate,
					status,
					statusDate,
					essential,
					storage,
					accession,
					official,
				});
			}
		}
	};

	return (
		<StyledModal
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={modalState.close}
			placement="center"
		>
			<Modal.Page header="Update Records Management Metadata">
				<PageForm onSubmit={handleSubmit(onSubmit)}>
					<UpdateRecordsManagementMetadataForm
						isLoadingApplyButton={sendMetadataMutation.isLoading}
						errors={errors}
						officialOptions={officialOptions}
						listOfOptions={listOfOptions}
						isLoading={isLoading}
						selectedRsi={selectedRsi}
						selectedStatus={selectedStatus}
						selectedEssential={selectedEssential}
						selectedStorage={selectedStorage}
						selectedOfficial={selectedOfficial}
						selectedAccession={selectedAccession}
						selectedRecordDate={selectedRecordDate}
						selectedStatusDate={selectedStatusDate}
						handleChange={handleChange}
						handleCancelButton={handleCancelButton}
						handleResetButton={handleResetButton}
					/>
				</PageForm>
			</Modal.Page>
		</StyledModal>
	);
}
