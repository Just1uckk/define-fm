import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
	endOfMonth,
	endOfQuarter,
	startOfMonth,
	startOfQuarter,
} from 'date-fns';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';

import {
	DASHBOARD_MODIFIERS,
	DashboardApi,
} from 'app/api/dashboard-api/dashboard-api';
import { FindEntityRequest } from 'app/api/types';
import { UserApi } from 'app/api/user-api/user-api';

import { selectUserData } from 'app/store/user/user-selectors';

import { THEME_COLORS } from 'app/settings/theme/theme';

import {
	IApprovedListRequest,
	ITotalRequest,
	UserParamsInterface,
} from 'shared/types/dashboard';
import { IUser } from 'shared/types/users';

import {
	DASHBOARD_QUERY_KEYS,
	PERSONAL_DASHBOARD_QUERY_KEYS,
} from 'shared/constants/query-keys';

import { useTranslation } from 'shared/hooks/use-translation';

import { IDateRange } from 'shared/components/input/input-date';

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

export function usePersonalDashboard() {
	const { t, currentLang } = useTranslation();

	const numberOfRecordChartOption: EChartsOption = {
		grid: {
			top: '3%',
			left: '3%',
			right: '3%',
			bottom: '3%',
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			boundaryGap: false,
			data: [],
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
				data: [],
				type: 'line',
				itemStyle: {
					color: '#31D5A7',
				},
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: 'rgba(49, 213, 167,0.8)',
						},
						{
							offset: 1,
							color: 'rgba(49, 213, 167,0.3)',
						},
					]),
				},
			},
		],
	};

	const onTimeCompletionChartOption: EChartsOption = {
		series: [
			{
				type: 'gauge',
				center: ['50%', '50%'],
				silent: true,
				startAngle: 180,
				endAngle: 0,
				min: 0,
				max: 100,
				splitNumber: 1,

				itemStyle: {
					color: '#4574F6',
				},
				progress: {
					show: true,
					roundCap: true,
					width: 6,
				},
				pointer: {
					show: false,
				},

				axisLabel: {
					show: false,
				},

				axisLine: {
					roundCap: true,
					lineStyle: {
						width: 6,
						color: [[1, '#F0F0F0']],
					},
				},

				axisTick: {
					show: false,
				},
				splitLine: {
					show: false,
				},
				title: {
					show: false,
				},
				detail: {
					valueAnimation: true,
					width: '60%',
					offsetCenter: [0, '-15%'],
					fontSize: 12,
					lineHeight: 16,
					fontWeight: 'bolder',
					formatter: '',
					color: 'inherit',
				},
				data: [
					{
						value: 0,
					},
				],
			},
			{
				name: 'start',
				type: 'scatter',
				silent: true,
				data: [[0, 0]],
				symbolSize: 0,

				label: {
					position: 'left',
					formatter: '0',
					show: true,
					color: THEME_COLORS.secondary,
					fontSize: 10,
					fontWeight: 700,
					offset: [-50, 20],
				},
			},
			{
				name: 'end',
				type: 'scatter',
				silent: true,
				data: [[0, 0]],
				symbolSize: 0,

				label: {
					position: 'right',
					formatter: '100%',
					show: true,
					color: THEME_COLORS.secondary,
					fontSize: 10,
					fontWeight: 700,
					offset: [40, 20],
				},
			},
		],
		xAxis: {
			axisLabel: { show: false },
			axisLine: { show: false },
			splitLine: { show: false },
			axisTick: { show: false },
			min: -1,
			max: 1,
		},
		yAxis: {
			axisLabel: { show: false },
			axisLine: { show: false },
			splitLine: { show: false },
			axisTick: { show: false },
			min: -1,
			max: 1,
		},
	};

	const [currentDate, setCurrentDate] = useState({
		start: startOfQuarter(new Date()),
		end: endOfQuarter(new Date()),
	});

	const [currentDateLabel, setCurrentDateLabel] = useState('per Quarter');

	const [percent, setPercent] = useState(0);

	const currentUser = selectUserData() as IUser;

	const changeDate = (date: IDateRange) => {
		setCurrentDate(date);
	};

	const onClickDateLabel = (dateLabel: string) => {
		setCurrentDateLabel(dateLabel);
	};

	const requestDataTotalApprovers: ITotalRequest = {
		name: STAT_NAME.APPROVED,
		start: startOfMonth(new Date()),
		end: endOfMonth(new Date()),
	};

	const topApprovers = useQuery({
		queryKey: PERSONAL_DASHBOARD_QUERY_KEYS.top_approvers,
		queryFn: () => DashboardApi.totalList(requestDataTotalApprovers),
		onSuccess(data) {
			if (data.finalstate) delete data.finalstate;
			if (data.itemstate) delete data.itemstate;
			getTopApproversMutation.mutate(data);
		},
	});

	const { data: onTimeCompletion, isSuccess: isLoadingOnTimeCompletion } =
		useQuery({
			queryKey: DASHBOARD_QUERY_KEYS.status_stats,
			queryFn: () => DashboardApi.statusStats(),
		});

	const numberOfRecords = useMutation({
		mutationFn: (requestData: IApprovedListRequest) =>
			DashboardApi.rejectionsTotalRecordReview(requestData),
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
					pageSize: 1000,
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

	useEffect(() => {
		numberOfRecords.mutate({
			orderBy: '',
			elements: [
				{
					fields: ['name'],
					modifier: 'equal',
					values: [STAT_NAME.APPROVED],
				},
				{
					fields: ['statKey'],
					modifier: 'equal',
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
	}, [currentDate]);

	const numberOfRecordsReviewed: EChartsOption = useMemo(() => {
		const copyOptions = { ...numberOfRecordChartOption };
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

		if (numberOfRecords.data) {
			if (differentYear === 0) {
				const dataPointArray = new Array(12).fill(0);
				numberOfRecords.data.forEach((el) => {
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
	}, [numberOfRecords.data]);

	const onTimeCompletionChart: EChartsOption = useMemo(() => {
		if (onTimeCompletion) {
			if (onTimeCompletion.late + onTimeCompletion.onTime > 0) {
				const calculatedPercent =
					(onTimeCompletion.onTime /
						(onTimeCompletion.late + onTimeCompletion.onTime)) *
					100;
				setPercent(calculatedPercent);
				onTimeCompletionChartOption.series![0].data[0].value =
					calculatedPercent;
				if (calculatedPercent <= 33) {
					onTimeCompletionChartOption.series![0].detail.formatter = t(
						'dashboard.personal_dashboard.on_time_completion.chart_result_title.bad',
					);
				}
				if (calculatedPercent > 33 && calculatedPercent <= 66) {
					onTimeCompletionChartOption.series![0].detail.formatter = t(
						'dashboard.personal_dashboard.on_time_completion.chart_result_title.good',
					);
				}
				if (calculatedPercent > 66) {
					onTimeCompletionChartOption.series![0].detail.formatter = t(
						'dashboard.personal_dashboard.on_time_completion.chart_result_title.excellent',
					);
				}
				return onTimeCompletionChartOption;
			}
			onTimeCompletionChartOption.series![0].data[0].value = 100;
			onTimeCompletionChartOption.series![0].detail.formatter = t(
				'dashboard.personal_dashboard.on_time_completion.chart_result_title.excellent',
			);
			return onTimeCompletionChartOption;
		}
		return onTimeCompletionChartOption;
	}, [onTimeCompletion]);

	return {
		models: {
			currentUser,
			topApprovers: getTopApproversMutation.data,
			isLoadingTopApprovers: getTopApproversMutation.isSuccess,
			numberOfRecordsReviewed,
			isLoadingNumberOfRecordsReviewed: numberOfRecords.isSuccess,
			currentDateLabel,
			isLoadingOnTimeCompletion,
			onTimeCompletionChart,
			percent,
		},
		commands: {
			changeDate,
			onClickDateLabel,
		},
	};
}
