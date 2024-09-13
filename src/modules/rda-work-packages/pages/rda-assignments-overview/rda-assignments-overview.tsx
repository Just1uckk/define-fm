import React, { useReducer } from 'react';
import { useMutation } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { FetchLoader } from 'app/layout/components/site-navigation/header/fetch-loader';
import {
	DEFAULT_SETTINGS_LIST,
	findDefaultOption,
} from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';
import { RdaAssignmentListSkeleton } from 'modules/rda-work-packages/pages/rda-assignments-overview/components/skeleton';
import { DISPOSITION_CARD_VIEW_TYPES } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/disposition-card/disposition-card';
import { NoRdaResult } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/no-result';
import { NoRdaSearchResult } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/no-search-result';
import { MemoryManagingTableSettings } from 'shared/services/memory-managing-table-settings';
import styled from 'styled-components';

import {
	DispositionsApi,
	FindDispositionsDto,
} from 'app/api/dispositions-api/dispositions-api';
import { FindGroupsDto } from 'app/api/groups-api/group-api';
import {
	DefaultSettingsApi,
	SendDefaultSettingsDto,
} from 'app/api/user-api/user-api-default';

import { setDefaultSettings } from 'app/store/user/user-actions';
import {
	selectDefaultSettingsData,
	selectUserData,
} from 'app/store/user/user-selectors';

import { IWorkPackage } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useFilterRequest } from 'shared/hooks/use-filter-request';
import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';
import { useEvent } from 'shared/hooks/useEvent';

import { Breadcrumb } from 'shared/components/breadcrumbs/breadcrumb';
import { BreadcrumbPortal } from 'shared/components/breadcrumbs/breadcrumb-portal';
import { BREADCRUMB_CONTAINER } from 'shared/components/breadcrumbs/breadcrumbs';
import { SearchBar } from 'shared/components/search-bar/search-bar';
import {
	SortByButton,
	SortOption,
} from 'shared/components/table-controls/sort-button';
import { ViewTableToggle } from 'shared/components/table-controls/view-toggle';
import { Title } from 'shared/components/title/title';

import { TABLE_TOTAL } from '../rda-work-packages-overview/use-rda-work-packages-overview';

import { Table } from './components/table';
import {
	getInitialTableStateReducer,
	tableStateReducer,
	TableStateReducerStateType,
} from './table-state-reducer';

const Page = styled.div``;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const PageContent = styled.div`
	margin-top: 1.7rem;
`;

const ControlPanel = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 1.4rem;
`;

const ControlPanelLeft = styled.div`
	width: 100%;
	max-width: 566px;
`;

const ControlPanelRight = styled.div`
	display: flex;
	flex-shrink: 0;
	gap: 0.85rem;
	margin-left: 0.85rem;
`;

export const TABLE_NAME = 'rda-assignments-overview';

const SORT_OPTIONS = [
	{ label: 'rda_assignments.sort_by.name', value: 'name' },
	{ label: 'rda_assignments.sort_by.added_date', value: 'createDate' },
	{ label: 'rda_assignments.sort_by.days_left', value: 'daysLeft' },
] as const;

const RdaAssignmentsOverviewPage: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams({
		p: String(1),
		s: '',
		orderBy: '',
	});
	const { t } = useTranslation();
	useTitle(t('rda_assignments.title'));
	const date = useDate();

	const currentUser = selectUserData() as IUser;
	const tableView = selectDefaultSettingsData();
	const setDefaultSettingsUser = setDefaultSettings();

	const [tableState, dispatchTableState] = useReducer(
		tableStateReducer,
		getInitialTableStateReducer(searchParams),
	);

	const {
		data: dispositionsData,
		refetchData: refetchDispositions,
		searchData: searchDispositions,
		isInitialLoading: isInitialLoadingDispositions,
		isRefetching: isRefetchingDispositions,
		isSearching: isSearchingDispositions,
	} = useFilterRequest<
		IWorkPackage[],
		Partial<TableStateReducerStateType>,
		FindDispositionsDto
	>({
		request: (params) => {
			return DispositionsApi.findDispositions(
				getFindDispositionsParams(params),
			);
		},
		searchRequest: (params) => {
			return DispositionsApi.findDispositions(params);
		},
	});
	const dispositions = dispositionsData?.results ?? [];

	useEffectAfterMount(() => {
		refetchDispositions(undefined, { silently: false }).then(() => {
			setSearchParams(
				(prev) => {
					prev.set('p', String(tableState.page));
					prev.set('orderBy', String(tableState.orderBy));
					return prev;
				},
				{ replace: true },
			);
		});
	}, [tableState.orderBy, tableState.pageSize, tableState.page]);
	useEffectAfterMount(() => {
		searchDispositions(
			() => getFindDispositionsParams(tableState),
			() => {
				setSearchParams(
					(prev) => {
						prev.set('s', tableState.search);
						return prev;
					},
					{ replace: true },
				);
			},
		);
	}, [tableState.search]);

	function getFindDispositionsParams(params) {
		const combinedParams = {
			...tableState,
			...params,
		};

		const parsedParams: FindGroupsDto = {
			orderBy: combinedParams.orderBy,
			elements: [
				{
					fields: ['currentApproverUserId', 'activeFeedbackUsers'],
					modifier: 'equal',
					values: [currentUser.id],
				},
			],
			page: combinedParams.page,
			pageSize: combinedParams.pageSize,
			signal: params.signal,
		};

		if (combinedParams.search.trim().length) {
			parsedParams.elements.push({
				fields: ['name'],
				modifier: 'contain',
				values: [combinedParams.search],
			});
		}

		return parsedParams;
	}

	const onChangeTableView = (view: DISPOSITION_CARD_VIEW_TYPES) => {
		dispatchTableState({ type: 'tableView', payload: view });

		MemoryManagingTableSettings.saveSettingsInLS(TABLE_NAME, {
			tableView: view,
		});

		MemoryManagingTableSettings.saveSettingsInLS(TABLE_TOTAL, {
			tableView: view,
		});
	};

	// const onChangeTableViewMutation = useMutation({
	// 	mutationFn: async (view: DISPOSITION_CARD_VIEW_TYPES) => {
	// 		dispatchTableState({ type: 'tableView', payload: view });
	// 		const sendRequestBody: SendDefaultSettingsDto[] = [];
	// 		sendRequestBody.push({
	// 			userId: currentUser.id,
	// 			value: `${view}`,
	// 			property: DEFAULT_SETTINGS_LIST.PREFERRED_VIEW,
	// 		});
	// 		const updatedUserSettings =
	// 			await DefaultSettingsApi.updateDefaultUserSettings(
	// 				currentUser.id,
	// 				sendRequestBody,
	// 			);
	// 		setDefaultSettingsUser(updatedUserSettings);

	// 		return updatedUserSettings;
	// 	},
	// });

	const onSort = (value: SortOption['value']) => {
		dispatchTableState({ type: 'orderBy', payload: value });
	};

	const onSearch = (value: string) => {
		dispatchTableState({ type: 'search', payload: value });
	};

	const onClearSearch = () => {
		dispatchTableState({ type: 'search', payload: '' });
	};

	const onChangedPageSize = useEvent((size: number) => {
		dispatchTableState({ type: 'pageSize', payload: size });
	});

	const onChangePage = useEvent((page: number) => {
		dispatchTableState({ type: 'page', payload: { page: page + 1 } });
	});

	return (
		<>
			<FetchLoader active={isRefetchingDispositions} />
			<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
				<Breadcrumb
					breadcrumb={t('breadcrumbs.rda_assignments')}
					path={DISPOSITIONS_ROUTES.RDA_ASSIGNMENTS_OVERVIEW.path}
					isLast
				/>
			</BreadcrumbPortal>
			<Page>
				<PageHeader>
					<Title subHeader={date.formats.pageHead()}>
						{t('rda_assignments.title')}
					</Title>
				</PageHeader>

				<PageContent>
					<ControlPanel>
						<ControlPanelLeft>
							<SearchBar
								placeholder={t('dispositions.table_controls.search')}
								value={tableState.search}
								isLoading={isSearchingDispositions}
								onChange={onSearch}
								onClear={onClearSearch}
								fulfilled
							/>
						</ControlPanelLeft>
						<ControlPanelRight>
							<SortByButton
								sortBy={tableState.orderBy}
								options={SORT_OPTIONS}
								onSelect={onSort}
								onOptionLabel={(_, idx) => t(SORT_OPTIONS[idx].label)}
								onSelectedOptionLabel={(option) => t(option.label)}
							/>
							<ViewTableToggle
								active={tableState.tableView}
								onChange={(view) => {
									onChangeTableView(view);
								}}
							/>
						</ControlPanelRight>
					</ControlPanel>
					<>
						{isInitialLoadingDispositions && <RdaAssignmentListSkeleton />}
						{!isInitialLoadingDispositions && (
							<>
								{!dispositions.length && !!tableState.search.trim().length && (
									<NoRdaSearchResult />
								)}
								{!dispositions.length && !tableState.search.trim().length && (
									<NoRdaResult />
								)}
							</>
						)}
					</>

					{!isInitialLoadingDispositions && (
						<Table
							defaultSettings={tableView}
							page={tableState.page - 1}
							pageSize={
								dispositionsData?.query?.pageSize ?? tableState.pageSize
							}
							totalPages={dispositionsData?.stats.pages ?? 0}
							totalItems={dispositionsData?.stats.objects ?? 0}
							dispositions={dispositions}
							currentUser={currentUser}
							view={
								tableState.tableView
								// findDefaultOption(
								// 	tableView,
								// 	DEFAULT_SETTINGS_LIST.PREFERRED_VIEW,
								// )?.value as DISPOSITION_CARD_VIEW_TYPES
							}
							onChangedPageSize={onChangedPageSize}
							onChangePage={onChangePage}
						/>
					)}
				</PageContent>
			</Page>
		</>
	);
};

export default RdaAssignmentsOverviewPage;
