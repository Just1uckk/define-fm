import React, { useEffect } from 'react';
import { SubmitHandler, useFormContext } from 'react-hook-form';
import { Item } from 'react-stately';

import { FindGroupsDto } from 'app/api/groups-api/group-api';
import {
	FindDispositionTypeDispositionsDto,
	FindDispositionTypeSnapshotsDto,
	RdaItemApi,
} from 'app/api/rda-item-api/rda-item-api';

import {
	IDispositionType,
	IDispositionTypeDisposition,
	IDispositionTypeSnapshot,
} from 'shared/types/dispositions';

import { LANGUAGE_CODES } from 'shared/constants/constans';

import {
	useFilterRequest,
	UseFilterRequestRequestParams,
} from 'shared/hooks/use-filter-request';
import { useTranslation } from 'shared/hooks/use-translation';

import {
	LangInput,
	LangInputList,
	LangInputListRef,
} from 'shared/components/input/lang-input';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageForm } from 'shared/components/modal-form/page-form';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { SectionTitle } from 'shared/components/modal-form/section-title';
import { Select } from 'shared/components/select/select';
import { Text } from 'shared/components/text/text';

import { CreateRdaFormDataTypes } from '../create-rda-form';

interface MainInformationProps {
	unsavedIsOpen?: boolean;
	snapshots: IDispositionTypeSnapshot[];
	dispositionSearches: IDispositionTypeDisposition[];
	dispositionTypes: IDispositionType[];
	onDispositionSearches: (type: IDispositionTypeDisposition[]) => void;
	onSnapshots: (type: IDispositionTypeSnapshot[]) => void;
	onSubmit: SubmitHandler<CreateRdaFormDataTypes>;
}

export const MainInformation: React.FC<
	React.PropsWithChildren<MainInformationProps>
> = ({
	dispositionTypes,
	onSubmit,
	children,
	unsavedIsOpen,
	onDispositionSearches,
	dispositionSearches,
	snapshots,
	onSnapshots,
}) => {
	const { t } = useTranslation();
	const { formState, ...methods } = useFormContext<CreateRdaFormDataTypes>();
	const nameInputsRef = React.useRef<LangInputListRef>();

	const selectedDispType = methods.watch('rdaType');
	const selectedDisposition = methods.watch('disposition');
	const selectedSnapshot = methods.watch('snapshot');

	const {
		data: dispositionSearchesData,
		refetchData: refetchDispositionSearches,
		searchData: searchDispositionSearches,
		isSearching: isSearchingDispositionSearches,
	} = useFilterRequest<
		IDispositionTypeDisposition[],
		Partial<{ search: string; rdaType: number }>,
		FindDispositionTypeDispositionsDto
	>({
		manualTriggering: true,
		request: (params) => {
			return RdaItemApi.findDispositionTypeDispositions(
				getFindDispositionSearchesParams(params),
			);
		},
		searchRequest: (params) => {
			return RdaItemApi.findDispositionTypeDispositions(params);
		},
	});
	useEffect(() => {
		if (dispositionSearchesData?.results) {
			onDispositionSearches(dispositionSearchesData.results);
		}
	}, [dispositionSearchesData]);

	const {
		data: searchSnapshotsData,
		refetchData: refetchSearchSnapshots,
		searchData: searchDispositionSearchSnapshots,
		isSearching: isSearchingDispositionSearchSnapshots,
	} = useFilterRequest<
		IDispositionTypeSnapshot[],
		Partial<{
			dispositionId?: IDispositionTypeSnapshot['dispositionId'];
			search?: string;
			rdaType?: number;
		}>,
		FindDispositionTypeSnapshotsDto
	>({
		manualTriggering: true,
		request: (params) => {
			return RdaItemApi.findDispositionTypeSnapshots(
				getFindDispositionSearchSnapshotsParams(params),
			);
		},
		searchRequest: (params) => {
			return RdaItemApi.findDispositionTypeSnapshots(params);
		},
	});

	useEffect(() => {
		if (searchSnapshotsData?.results) {
			onSnapshots(searchSnapshotsData.results);
			if (searchSnapshotsData.results.length === 1) {
				onSelectDispositionSearchSnapshot(searchSnapshotsData.results[0]);
			}
		}
	}, [searchSnapshotsData]);

	function getFindDispositionSearchesParams(
		params: UseFilterRequestRequestParams<{
			search?: string;
			rdaType?: number;
		}>,
	) {
		const { rdaType = selectedDispType?.id, search } = params;

		const parsedParams: FindDispositionTypeDispositionsDto = {
			elements: [],
			page: 1,
			pageSize: 20,
			signal: params.signal,
		};

		if (search?.trim().length) {
			parsedParams.elements.push({
				fields: ['name'],
				modifier: 'contain',
				values: [search],
			});
		}

		if (typeof rdaType === 'number') {
			parsedParams.elements.push({
				fields: ['type'],
				modifier: 'equal',
				values: [rdaType],
			});
		}

		return parsedParams;
	}

	function getFindDispositionSearchSnapshotsParams(
		params: UseFilterRequestRequestParams<{
			dispositionId?: IDispositionTypeSnapshot['dispositionId'];
			search?: string;
			rdaType?: number;
		}>,
	) {
		const {
			signal,
			search,
			rdaType = selectedDispType?.id,
			dispositionId = Number(selectedDisposition?.dispositionId),
		} = params;

		const parsedParams: FindGroupsDto = {
			elements: [],
			page: 1,
			pageSize: 20,
			signal: signal,
		};

		if (search?.trim().length) {
			parsedParams.elements.push({
				fields: ['name', 'snapshotDate'],
				modifier: 'contain',
				values: [search],
			});
		}

		if (dispositionId) {
			parsedParams.elements.push({
				fields: ['dispositionId'],
				modifier: 'equal',
				values: [dispositionId],
			});
		}

		if (typeof rdaType === 'number') {
			parsedParams.elements.push({
				fields: ['type'],
				modifier: 'equal',
				values: [rdaType],
			});
		}

		return parsedParams;
	}

	const onSelectDispositionType = (option: IDispositionType | null) => {
		if (!option) return;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		methods.setValue('rdaType', option, {
			shouldDirty: true,
			shouldValidate: true,
		});

		if (selectedDisposition) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			methods.setValue('disposition', undefined);
		}

		if (selectedSnapshot) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			methods.setValue('snapshot', undefined);
		}

		refetchDispositionSearches({ rdaType: option.id });
	};

	const onSelectDispositionSearch = (
		entity: IDispositionTypeDisposition | null,
	) => {
		if (entity !== null) {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			methods.setValue('disposition', entity, {
				shouldDirty: true,
				shouldValidate: true,
			});

			if (selectedSnapshot) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				methods.setValue('snapshot', undefined);
			}

			refetchSearchSnapshots({ dispositionId: entity.dispositionId });
		}
	};
	const onSelectDispositionSearchSnapshot = (
		entity: IDispositionTypeSnapshot | null,
	) => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		methods.setValue('snapshot', entity, {
			shouldDirty: true,
			shouldValidate: true,
		});
	};

	return (
		<>
			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					{t('dispositions.create_modal.title')}
				</HeaderTitle>
				<Text variant="body_2_secondary">
					{t('dispositions.create_modal.sub_title')}
				</Text>
			</PageHeader>
			<PageBody>
				<PageForm onSubmit={methods.handleSubmit(onSubmit)}>
					<FormGroup>
						<SectionTitle variant="body_1_primary_bold">
							<LocalTranslation tk="dispositions.create_form.title" />
						</SectionTitle>
						<FormField>
							<LangInputList innerRef={nameInputsRef}>
								<LangInput
									{...methods.register('multilingual.name.en')}
									error={
										formState.errors.multilingual?.name?.en?.message
											? t(formState.errors.multilingual?.name?.en?.message)
											: formState.errors.multilingual?.name?.en?.message
									}
									label={t('dispositions.create_form.fields.name')}
									lang={LANGUAGE_CODES.EN}
									autoComplete="off"
								/>
								<LangInput
									{...methods.register('multilingual.name.fr_CA')}
									error={
										formState.errors.multilingual?.name?.fr_CA?.message
											? t(formState.errors.multilingual?.name?.fr_CA?.message)
											: formState.errors.multilingual?.name?.fr_CA?.message
									}
									lang={LANGUAGE_CODES.FR_CD}
									label={t('dispositions.create_form.fields.name')}
									autoComplete="off"
								/>
							</LangInputList>
						</FormField>
						<FormField>
							<Select<IDispositionType>
								unsavedIsOpen={unsavedIsOpen}
								label={t('dispositions.create_form.fields.source')}
								options={dispositionTypes}
								selectedKey={selectedDispType?.id?.toString()}
								onChange={onSelectDispositionType}
								error={
									typeof formState.errors?.rdaType?.message === 'string'
										? t(formState.errors?.rdaType?.message)
										: undefined
								}
							>
								{(option) => (
									<Item key={option.id} textValue={option.name}>
										{option.name}
									</Item>
								)}
							</Select>
						</FormField>
						<FormField>
							<Select<IDispositionTypeDisposition>
								unsavedIsOpen={unsavedIsOpen}
								label={t('dispositions.create_form.fields.select_disposition')}
								options={dispositionSearches}
								selectedKey={selectedDisposition?.dispositionId}
								onChange={(e) => {
									onSelectDispositionSearch(e);
								}}
								isDisabled={!selectedDispType || !dispositionSearches.length}
								error={
									typeof formState.errors?.disposition?.message === 'string'
										? t(formState.errors?.disposition?.message)
										: undefined
								}
							>
								{(option) => (
									<Item key={option.dispositionId} textValue={option.name}>
										{option.name}
									</Item>
								)}
							</Select>
						</FormField>
						<FormField>
							<Select<IDispositionTypeSnapshot>
								unsavedIsOpen={unsavedIsOpen}
								label={t('dispositions.create_form.fields.snapshot')}
								options={snapshots}
								selectedKey={selectedSnapshot?.snapshotId}
								onChange={(e) => {
									onSelectDispositionSearchSnapshot(e);
								}}
								isDisabled={!selectedDisposition || !snapshots.length}
								error={
									typeof formState.errors?.snapshot?.message === 'string'
										? t(formState.errors?.snapshot?.message)
										: undefined
								}
							>
								{(option) => (
									<Item key={option.snapshotId} textValue={option.name}>
										{option.name}
									</Item>
								)}
							</Select>
						</FormField>
					</FormGroup>
					<ModalFooter justifyContent="space-between">{children}</ModalFooter>
				</PageForm>
			</PageBody>
		</>
	);
};
