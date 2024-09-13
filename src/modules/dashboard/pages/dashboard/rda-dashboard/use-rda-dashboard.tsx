import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
	endOfMonth,
	endOfYear,
	getMonth,
	startOfMonth,
	startOfYear,
	subMonths,
} from 'date-fns';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';

import {
	DASHBOARD_MODIFIERS,
	DashboardApi,
} from 'app/api/dashboard-api/dashboard-api';
import { FindEntityRequest } from 'app/api/types';
import { UserApi } from 'app/api/user-api/user-api';

import {
	IApprovedListRequest,
	IApprovedListResponse,
	ITotalRequest,
	UserParamsInterface,
} from 'shared/types/dashboard';

import { DASHBOARD_QUERY_KEYS } from 'shared/constants/query-keys';

import { useTranslation } from 'shared/hooks/use-translation';

import { IDateRange } from 'shared/components/input/input-date';

import { SelectInterface } from './components/number-records-final-state';

enum STAT_NAME {
	SAVED_DISKSPACE = 'Saved Diskspace',
	REVIEW_REQUESTED = 'Review Requested',
	REVIEWED_ITEM_STATUS = 'Reviewed Item Status',
	REVIEW_DURATION = 'ReviewDuration',
	RDA_WORK_PACKAGE_COMPLETED_ONTIME = 'RDAWorkPackageCompletedOntime',
	RDA_WORK_PACKAGE_COMPLETED_LATE = 'RDAWorkPackageCompletedLate',
	APPROVED = 'Approved',
	REJECTED = 'Rejected',
	REJECT_AND_EXTEND = 'Reject & Extend',
	APPROVE_FOR_DESTRUCTION = 'Approve for Destruction',
}
enum STAT_KEY {
	FINALSTATE = 'finalstate',
	ITEMSTATE = 'itemstate',
}

interface StateListInterface {
	name: string;
	data: number[];
}

export function useRdaDashboard() {
	const { t, currentLang } = useTranslation();

	const RejectionsTotalRecordsChartOption: EChartsOption = {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
		},
		grid: {
			top: '3%',
			left: '3%',
			bottom: '3%',
			containLabel: true,
		},
		xAxis: [
			{
				type: 'category',
				data: [
					'Jan',
					'Feb',
					'Mar',
					'Apr',
					'May',
					'Jun',
					'Jul',
					'Aug',
					'Sep',
					'Oct',
					'Nov',
					'Dec',
				],
				axisLabel: {
					color: 'var(--palette-secondary)',
				},
			},
		],
		yAxis: [
			{
				type: 'value',
				axisLabel: {
					color: 'var(--palette-secondary)',
				},
			},
		],
		series: [
			{
				name: 'Total',
				type: 'bar',
				stack: '',
				emphasis: {
					focus: 'series',
				},
				data: [],
				color: 'transparent',
				barWidth: '30%',
				barGap: '-100%',
			},
			{
				name: 'Approved',
				type: 'bar',
				stack: 'Ad',
				emphasis: {
					focus: 'series',
				},
				data: [],
				color: '#4574F6',
				barWidth: '30%',
			},
			{
				name: 'Rejections',
				type: 'bar',
				stack: 'Ad',
				emphasis: {
					focus: 'series',
				},
				data: [],
				color: '#E3EAEF',
			},
		],
	};

	const TotalRecordsCurrentStateChartOption: EChartsOption = {
		tooltip: {
			trigger: 'axis',
		},
		legend: {
			icon: 'circle',
			data: [
				t(
					'dashboard.rda_dashboard.total_number_records_current_state.legenda.approved',
				),
				t(
					'dashboard.rda_dashboard.total_number_records_current_state.legenda.rejected',
				),
				// t(
				// 	'dashboard.rda_dashboard.total_number_records_current_state.legenda.approved_archive',
				// ),
			],
			textStyle: {
				color: 'var(--palette-secondary)',
			},
		},
		grid: {
			top: '18%',
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: [
				'Jan',
				'Feb',
				'Mar',
				'Apr',
				'May',
				'Jun',
				'Jul',
				'Aug',
				'Sep',
				'Oct',
				'Nov',
				'Dec',
			],
		},
		yAxis: {
			type: 'value',
		},
		series: [
			{
				name: t(
					'dashboard.rda_dashboard.total_number_records_current_state.legenda.approved',
				),
				type: 'line',
				color: '#31D5A7',
				data: [],
				smooth: true,
			},
			{
				name: t(
					'dashboard.rda_dashboard.total_number_records_current_state.legenda.rejected',
				),
				type: 'line',
				color: '#4574F6',
				data: [],
				smooth: true,
			},
			// {
			// 	name: t(
			// 		'dashboard.rda_dashboard.total_number_records_current_state.legenda.approved_archive',
			// 	),
			// 	type: 'line',
			// 	color: '#F7CF69',
			// 	data: [150, 232, 201, 154, 190, 330, 410],
			// 	smooth: true,
			// },
		],
	};

	const DiskSpaceSavedBySourceSystemOption: EChartsOption = {
		tooltip: {
			trigger: 'axis',
		},
		legend: {
			data: [],
			icon: 'circle',
			bottom: 'bottom',
			textStyle: {
				color: 'var(--palette-secondary)',
			},
		},
		grid: {
			top: '3%',
			left: '3%',
			bottom: '13%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			axisLabel: {
				color: 'var(--palette-secondary)',
			},
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				color: 'var(--palette-secondary)',
			},
		},
		series: [],
	};

	const NumberRecordsFinalStateChartOption: EChartsOption = {
		tooltip: {
			trigger: 'axis',
		},
		grid: {
			top: '3%',
			left: '3%',
			bottom: '3%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			axisLabel: {
				color: 'var(--palette-secondary)',
			},
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				color: 'var(--palette-secondary)',
			},
		},
		series: [
			{
				type: 'line',
				color: '#4574F6',
				itemStyle: {
					color: '#4574F6',
				},
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: 'rgba(69, 116, 246,0.8)',
						},
						{
							offset: 1,
							color: 'rgba(69, 116, 246,0.3)',
						},
					]),
				},
				data: [],
			},
		],
	};

	const requestDataTotalApprovers: ITotalRequest = {
		name: STAT_NAME.APPROVED,
		start: startOfMonth(new Date()),
		end: endOfMonth(new Date()),
	};

	const requestDataTotalApproversLastMonth = (): ITotalRequest => {
		const currentDate = new Date();
		const previousMonth = subMonths(currentDate, 1);
		const startOfPreviousMonth = startOfMonth(previousMonth);
		const endOfPreviousMonth = endOfMonth(previousMonth);

		return {
			name: STAT_NAME.APPROVED,
			start: startOfPreviousMonth,
			end: endOfPreviousMonth,
		};
	};

	const requestDataRejectionsTotalRecords: IApprovedListRequest = {
		orderBy: '',
		elements: [
			{
				fields: ['name'],
				modifier: 'equal',
				values: [STAT_NAME.APPROVED, STAT_NAME.REJECTED],
			},
			{
				fields: ['statKey'],
				modifier: 'equal',
				values: [STAT_KEY.FINALSTATE],
			},
		],
		page: 1,
		pageSize: 1000,
	};

	const requestDataTotalRecordsCurrent: IApprovedListRequest = {
		orderBy: '',
		elements: [
			{
				fields: ['name'],
				modifier: 'equal',
				values: [
					STAT_NAME.APPROVE_FOR_DESTRUCTION,
					STAT_NAME.REJECT_AND_EXTEND,
				],
			},
			{
				fields: ['statKey'],
				modifier: 'equal',
				values: [STAT_KEY.FINALSTATE],
			},
		],
		page: 1,
		pageSize: 1000,
	};

	const requestNumberOfRecords: IApprovedListRequest = {
		orderBy: '',
		elements: [
			{
				fields: ['statKey'],
				modifier: 'equal',
				values: [STAT_KEY.FINALSTATE],
			},
		],
		page: 1,
		pageSize: 1000,
	};

	const [currentState, setCurrentState] = useState<SelectInterface | null>(
		null,
	);
	const [currentDate, setCurrentDate] = useState<IDateRange>({
		start: startOfYear(new Date()),
		end: endOfYear(new Date()),
	});

	const [currentStateDSS, setCurrentStateDSS] =
		useState<SelectInterface | null>({ id: 9999, name: 'All' });
	const [currentDateDSS, setCurrentDateDSS] = useState<IDateRange>({
		start: startOfYear(new Date()),
		end: endOfYear(new Date()),
	});

	const requestDataDSS = useMemo(() => {
		const request: any = [
			{
				fields: ['name'],
				modifier: 'equal',
				values: [STAT_NAME.SAVED_DISKSPACE],
			},
			{
				fields: ['period'],
				modifier: DASHBOARD_MODIFIERS.MODIFIER_BETWEEN,
				values: [currentDateDSS.start, currentDateDSS.end],
			},
		];
		if (!currentStateDSS || currentStateDSS.name === 'All') {
			return request;
		} else {
			request.push({
				fields: ['statKey'],
				modifier: 'equal',
				values: [currentStateDSS.name],
			});
			return request;
		}
	}, [currentStateDSS, currentDateDSS]);

	const topApprovers = useQuery({
		queryKey: DASHBOARD_QUERY_KEYS.top_approvers,
		queryFn: () => DashboardApi.totalList(requestDataTotalApprovers),
		onSuccess(data) {
			if (data.finalstate) delete data.finalstate;
			if (data.itemstate) delete data.itemstate;
			getTopApproversMutation.mutate(data);
		},
	});

	const topApproversLastMonth = useQuery({
		queryKey: DASHBOARD_QUERY_KEYS.top_approvers_last_month,
		queryFn: () => DashboardApi.totalList(requestDataTotalApproversLastMonth()),
		onSuccess(data) {
			if (data.finalstate) delete data.finalstate;
			if (data.itemstate) delete data.itemstate;
			getTopApproversLastMonthMutation.mutate(data);
		},
	});

	const {
		data: rejectionsTotalRecords,
		isLoading: isLoadingRejectionsTotalRecords,
	} = useQuery({
		queryKey: DASHBOARD_QUERY_KEYS.rejections_total_records_review,
		queryFn: () =>
			DashboardApi.rejectionsTotalRecordReview(
				requestDataRejectionsTotalRecords,
			),
	});

	const { data: totalRecords, isLoading: isLoadingTotalRecordsCurrentState } =
		useQuery({
			queryKey: DASHBOARD_QUERY_KEYS.total_records_current_state,
			queryFn: () =>
				DashboardApi.rejectionsTotalRecordReview(
					requestDataTotalRecordsCurrent,
				),
		});

	const { data: numberOfRecords, isLoading: isLoadingNumberOfRecords } =
		useQuery({
			queryKey: DASHBOARD_QUERY_KEYS.number_of_records,
			queryFn: () =>
				DashboardApi.rejectionsTotalRecordReview(requestNumberOfRecords),
		});

	const DiskSpaceSavedSourceSystemMutation = useMutation({
		mutationFn: async (
			requestData: IApprovedListRequest,
		): Promise<IApprovedListResponse[]> => {
			const response = await DashboardApi.rejectionsTotalRecordReview(
				requestData,
			);
			return response;
		},
	});

	const numberOfRecordsByState = useMutation({
		mutationFn: async (
			requestData: IApprovedListRequest,
		): Promise<IApprovedListResponse[]> => {
			const response = await DashboardApi.rejectionsTotalRecordReview(
				requestData,
			);
			return response;
		},
	});

	const getTopApproversMutation = useMutation({
		mutationFn: async (data: any): Promise<UserParamsInterface[]> => {
			const userIdList = Object.keys(data);
			if (userIdList.length) {
				let idListNumber = userIdList.map((str) => parseInt(str));
				idListNumber = idListNumber.filter(
					(item) => typeof item === 'number' && item !== null && !isNaN(item),
				);
				const requestBody: FindEntityRequest = {
					elements: [
						{
							fields: ['id'],
							modifier: 'equal',
							values: idListNumber,
							include: true,
							filter: false,
						},
					],
					filters: false,
					orderBy: '',
					page: 1,
					pageSize: 3,
				};
				const payload: any = await UserApi.findUsers(requestBody);
				const approversList: UserParamsInterface[] = [...payload.results];
				approversList.map(
					(user: UserParamsInterface) => (user['count'] = data[user.id]),
				);
				return approversList;
			} else {
				return [];
			}
		},
	});

	const getTopApproversLastMonthMutation = useMutation({
		mutationFn: async (data: any): Promise<UserParamsInterface[]> => {
			const userIdList = Object.keys(data);
			if (userIdList.length) {
				const idListNumber = userIdList.map((str) => parseInt(str));
				const requestBody: FindEntityRequest = {
					elements: [
						{
							fields: ['id'],
							modifier: 'equal',
							values: idListNumber,
							include: true,
							filter: false,
						},
					],
					filters: false,
					orderBy: '',
					page: 1,
					pageSize: 3,
				};
				const payload: any = await UserApi.findUsers(requestBody);
				const approversList: UserParamsInterface[] = [...payload.results];
				approversList.map(
					(user: UserParamsInterface) => (user['count'] = data[user.id]),
				);
				return approversList;
			} else {
				return [];
			}
		},
	});

	const rejectionsTotalRecordsSentForReview = useMemo((): EChartsOption => {
		if (rejectionsTotalRecords) {
			const currentMonthNumber = getMonth(new Date()) + 1;
			const summaryMonthTotal = new Array(currentMonthNumber).fill(0);
			const summaryMonthApproved = new Array(currentMonthNumber).fill(0);
			const summaryMonthRejected = new Array(currentMonthNumber).fill(0);
			const currentYear = new Date().getFullYear();
			rejectionsTotalRecords.forEach((el) => {
				const date = new Date(el.period);
				const elementYear = date.getFullYear();
				const index = date.getMonth();
				if (currentYear === elementYear) {
					if (el.name === STAT_NAME.REJECTED) {
						summaryMonthRejected[index] += el.value;
					}
					if (el.name === STAT_NAME.APPROVED) {
						summaryMonthApproved[index] += el.value;
					}
					summaryMonthTotal[index] += el.value;
				}
			});
			if (RejectionsTotalRecordsChartOption.series) {
				RejectionsTotalRecordsChartOption.series[0].data = summaryMonthTotal;
				RejectionsTotalRecordsChartOption.series[1].data = summaryMonthApproved;
				RejectionsTotalRecordsChartOption.series[2].data = summaryMonthRejected;
			}

			return RejectionsTotalRecordsChartOption;
		} else {
			return RejectionsTotalRecordsChartOption;
		}
	}, [rejectionsTotalRecords]);

	const totalRecordsCurrentState: EChartsOption = useMemo(() => {
		if (totalRecords) {
			const currentMonthNumber = getMonth(new Date()) + 1;
			const summaryMonthApproved = new Array(currentMonthNumber).fill(0);
			const summaryMonthRejected = new Array(currentMonthNumber).fill(0);
			const currentYear = new Date().getFullYear();
			totalRecords.forEach((el) => {
				const date = new Date(el.period);
				const elementYear = date.getFullYear();
				const index = date.getMonth();
				if (currentYear === elementYear) {
					if (el.name === STAT_NAME.REJECT_AND_EXTEND) {
						summaryMonthRejected[index] += el.value;
					}
					if (el.name === STAT_NAME.APPROVE_FOR_DESTRUCTION) {
						summaryMonthApproved[index] += el.value;
					}
				}
			});
			if (TotalRecordsCurrentStateChartOption.series) {
				TotalRecordsCurrentStateChartOption.series[0].data =
					summaryMonthApproved;
				TotalRecordsCurrentStateChartOption.series[1].data =
					summaryMonthRejected;
			}

			return TotalRecordsCurrentStateChartOption;
		} else {
			return TotalRecordsCurrentStateChartOption;
		}
	}, [currentLang, totalRecords]);

	const diskSpaceSavedSource: EChartsOption = useMemo(() => {
		const copyOptions: any = { ...DiskSpaceSavedBySourceSystemOption };
		const numberStartYear = currentDateDSS.start.getFullYear();
		const numberEndYear = currentDateDSS.end.getFullYear();
		const startMonth = currentDateDSS.start.getMonth();
		const endMonth = currentDateDSS.end.getMonth();

		const data = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];

		const differentYear = numberEndYear - numberStartYear;

		if (DiskSpaceSavedSourceSystemMutation.data) {
			if (differentYear === 0) {
				const stateList: StateListInterface[] = [];
				DiskSpaceSavedSourceSystemMutation.data.forEach((element) => {
					if (stateList.length) {
						if (!stateList.some((el) => el.name === element.statKey)) {
							const arrayWithData: number[] = new Array(12).fill(0);
							const date = new Date(element.period);
							const index = date.getMonth();
							arrayWithData[index] += element.value;
							stateList.push({ name: element.statKey, data: arrayWithData });
						} else {
							const indexState = stateList.findIndex(
								(item) => item.name === element.statKey,
							);
							const date = new Date(element.period);
							const index = date.getMonth();
							stateList[indexState].data[index] += element.value;
						}
					} else {
						const arrayWithData: number[] = new Array(12).fill(0);
						const date = new Date(element.period);
						const index = date.getMonth();
						arrayWithData[index] += element.value;
						stateList.push({ name: element.statKey, data: arrayWithData });
					}
				});

				copyOptions.xAxis!['data'] = data.slice(startMonth, endMonth + 1);
				const legendArray: string[] = [];

				stateList.forEach((dataField, index) => {
					legendArray.push(dataField.name);
					copyOptions.series!.push({
						name: `${dataField.name}`,
						type: 'line',
						stack: 'Total',
						data: dataField.data.slice(startMonth, endMonth + 1),
					});
				});

				copyOptions.legend!.data = legendArray;
			}
		}
		return copyOptions;
	}, [DiskSpaceSavedSourceSystemMutation.data]);

	const numberRecordsFinalState: EChartsOption = useMemo(() => {
		const copyOptions = { ...NumberRecordsFinalStateChartOption };
		const numberStartYear = currentDate.start.getFullYear();
		const numberEndYear = currentDate.end.getFullYear();
		const startMonth = currentDate.start.getMonth();
		const endMonth = currentDate.end.getMonth();

		const data = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
		];

		const differentYear = numberEndYear - numberStartYear;

		if (numberOfRecordsByState.data) {
			if (differentYear === 0) {
				const dataPointArray = new Array(12).fill(0);
				numberOfRecordsByState.data.forEach((el) => {
					const date = new Date(el.period);
					const index = date.getMonth();
					dataPointArray[index] += el.value;
				});
				copyOptions.xAxis!['data'] = data.slice(startMonth, endMonth + 1);
				copyOptions.series![0].data = dataPointArray.slice(
					startMonth,
					endMonth + 1,
				);
			}
		}

		return copyOptions;
	}, [numberOfRecordsByState.data]);

	const numberOfRecordsStateList = useMemo(() => {
		if (numberOfRecords) {
			const stateList: SelectInterface[] = [];
			numberOfRecords.forEach((item: any) => {
				if (stateList.length) {
					if (!stateList.some((element) => element.name === item.name)) {
						stateList.push({ id: item.id, name: item.name });
					}
				} else {
					stateList.push({ id: item.id, name: item.name });
					setCurrentState({ id: item.id, name: item.name });
				}
			});
			return stateList;
		}
		return [];
	}, [numberOfRecords]);

	const [dssList, setDssList] = useState<SelectInterface[]>([]);
	useEffect(() => {
		if (DiskSpaceSavedSourceSystemMutation.data) {
			if (dssList.length === 0) {
				const stateList: SelectInterface[] = [];
				stateList.push({ id: 9999, name: 'All' });
				DiskSpaceSavedSourceSystemMutation.data.forEach((item: any) => {
					if (stateList.length) {
						if (!stateList.some((element) => element.name === item.statKey)) {
							stateList.push({ id: item.id, name: item.statKey });
						}
					} else {
						stateList.push({ id: item.id, name: item.statKey });
					}
				});
				setDssList(stateList);
			}
		}
	}, [DiskSpaceSavedSourceSystemMutation.data]);

	useEffect(() => {
		DiskSpaceSavedSourceSystemMutation.mutate({
			orderBy: '',
			elements: requestDataDSS,
			page: 1,
			pageSize: 1000,
		});
	}, [requestDataDSS]);

	useEffect(() => {
		numberOfRecordsByState.mutate({
			orderBy: '',
			elements: [
				{
					fields: ['name'],
					modifier: DASHBOARD_MODIFIERS.MODIFIER_MATCH,
					values: [currentState?.name || 'Approved'],
				},
				{
					fields: ['statKey'],
					modifier: DASHBOARD_MODIFIERS.MODIFIER_MATCH,
					values: [STAT_KEY.FINALSTATE],
				},
				{
					fields: ['period'],
					modifier: DASHBOARD_MODIFIERS.MODIFIER_BETWEEN,
					values: [currentDate.start, currentDate.end],
				},
			],
			page: 1,
			pageSize: 1000,
		});
	}, [currentState, currentDate]);

	const changeCurrentState = (data: SelectInterface | null) => {
		setCurrentState(data);
	};

	const changeCurrentDate = (data: IDateRange) => {
		setCurrentDate(data);
	};

	const changeCurrentStateDSS = (data: SelectInterface | null) => {
		setCurrentStateDSS(data);
	};

	const changeCurrentDateDSS = (data: IDateRange) => {
		setCurrentDateDSS(data);
	};

	return {
		models: {
			topApprovers: getTopApproversMutation.data,
			topApproversLastMonth: getTopApproversLastMonthMutation.data,
			isLoadingTopApprovers: getTopApproversMutation.isSuccess,
			isLoadingNumberOfRecords,
			rejectionsTotalRecordsSentForReview,
			isLoadingRejectionsTotalRecords,
			totalRecordsCurrentState,
			isLoadingTotalRecordsCurrentState,
			numberRecordsFinalState,
			numberOfRecordsStateList,
			currentState,
			currentDate,
			diskSpaceSavedSource,
			diskSpaceSavedSystemList: dssList,
			currentStateDSS,
			currentDateDSS,
		},
		commands: {
			changeCurrentState,
			changeCurrentDate,
			changeCurrentDateDSS,
			changeCurrentStateDSS,
		},
	};
}
