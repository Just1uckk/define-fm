import React, { useMemo, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useQuery } from 'react-query';
import { Chart, ChartRefType } from 'components/chart/chart';
import { EChartsOption } from 'echarts';
import { PieDataItemOption } from 'echarts/types/src/chart/pie/PieSeries';
import { Section } from 'modules/dashboard/components/section/section';
import styled from 'styled-components';

import { DashboardApi } from 'app/api/dashboard-api/dashboard-api';

import { THEME_COLORS } from 'app/settings/theme/theme';

import { DASHBOARD_QUERY_KEYS } from 'shared/constants/query-keys';

import { useTranslation } from 'shared/hooks/use-translation';

import { Text } from 'shared/components/text/text';

const StyledBody = styled(Section.Body)`
	display: grid;
	grid-template-columns: 40% auto;
	grid-template-rows: 1fr;
`;

const Legenda = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
	padding-left: 1.2rem;
`;

const LegendaItem = styled.div`
	display: flex;
	gap: 10px;
`;

const LegendaText = styled.div``;

const LegendaName = styled(Text)``;

const LegendaValue = styled(Text)``;

const LegendaIcon = styled.div<{ color?: string }>`
	width: 8px;
	height: 8px;
	margin-top: 4px;
	border-radius: 50%;
	background-color: ${({ color }) => color};
`;

const StyledChart = styled(Chart)`
	margin-top: -38px;
`;

export const StatusStats: React.FC = () => {
	const { t, currentLang } = useTranslation();
	const chartRef = useRef<ChartRefType>(null);

	const { data: statusStatsData, isFetched } = useQuery({
		queryKey: DASHBOARD_QUERY_KEYS.status_stats,
		queryFn: () => DashboardApi.statusStats(),
	});

	const statusData: PieDataItemOption[] = useMemo(() => {
		return [
			{
				value: statusStatsData ? statusStatsData.onTime : 0,
				name: t('dashboard.rda_dashboard.status.legenda.on_time'),

				itemStyle: {
					color: '#31D5A7',
				},
				emphasis: {
					itemStyle: {
						shadowColor: 'rgb(49,213,167, 0.5)',
					},
				},
			},
			{
				value: statusStatsData ? statusStatsData.late : 0,
				name: t('dashboard.rda_dashboard.status.legenda.late'),
				itemStyle: {
					color: '#DA5F5B',
				},
				emphasis: {
					itemStyle: {
						shadowColor: 'rgb(218,95,91, 0.5)',
					},
				},
			},
			{
				value: statusStatsData ? statusStatsData.completed : 0,
				name: t('dashboard.rda_dashboard.status.legenda.completed'),
				itemStyle: {
					color: '#4574F6',
				},
				emphasis: {
					itemStyle: {
						shadowColor: 'rgba(69,116,246, 0.5)',
					},
				},
			},
		];
	}, [currentLang, statusStatsData]);

	const numberRecordsReviewedChartOptions: EChartsOption = useMemo(() => {
		return {
			tooltip: {
				trigger: 'item',
			},
			title: {
				text: t('dashboard.rda_dashboard.status.legenda.total'),
				subtext: statusStatsData
					? `${
							statusStatsData.late +
							statusStatsData.onTime +
							statusStatsData.completed
					  }`
					: '',
				left: 'center',
				top: '39%',

				textStyle: {
					color: THEME_COLORS.secondary,
					fontSize: 12,
				},
				subtextStyle: {
					color: 'var(--palette-primary)',
					fontSize: 16,
				},
			},
			series: [
				{
					type: 'pie',
					radius: ['50%', '67%'],
					avoidLabelOverlap: false,
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							borderRadius: 10,
						},
					},

					label: {
						show: false,
						position: 'center',
					},
					labelLine: {
						show: false,
					},
					data: statusData,
				},
			],
		};
	}, [currentLang, statusData]);

	const handleLegendaMouseEnter = (item: PieDataItemOption, idx) => {
		const chart = chartRef.current?.getEchartsInstance();

		if (!chart) return;

		chart.dispatchAction({
			type: 'highlight',
			seriesIndex: 0,
			dataIndex: idx,
		});
		chart.dispatchAction({
			type: 'showTip',
			seriesIndex: 0,
			dataIndex: idx,
		});
	};

	const handleLegendaMouseLeave = (item: PieDataItemOption, idx) => {
		const chart = chartRef.current?.getEchartsInstance();

		if (!chart) return;
		chart.dispatchAction({
			type: 'downplay',
			seriesIndex: 0,
			dataIndex: idx,
		});

		chart.dispatchAction({
			type: 'hideTip',
			seriesIndex: 0,
			dataIndex: idx,
		});
	};

	return (
		<Section.Wrapper>
			<Section.Header title={t('dashboard.rda_dashboard.status.title')} />
			{isFetched ? (
				<StyledBody>
					<Legenda>
						{statusData.map((item, idx) => (
							<LegendaItem
								key={idx}
								onMouseEnter={() => handleLegendaMouseEnter(item, idx)}
								onMouseLeave={() => handleLegendaMouseLeave(item, idx)}
							>
								<LegendaIcon color={item.itemStyle?.color as string} />
								<LegendaText>
									<LegendaName variant="body_3_secondary_semibold">
										{item.name}
									</LegendaName>
									<LegendaValue variant="body_3_primary_semibold">
										{item.value}
									</LegendaValue>
								</LegendaText>
							</LegendaItem>
						))}
					</Legenda>
					<StyledChart
						ref={chartRef}
						option={numberRecordsReviewedChartOptions}
						opts={{ renderer: 'svg' }}
						style={{ height: '180px', width: '110%' }}
					/>
				</StyledBody>
			) : (
				<>
					<Skeleton borderRadius="0.5rem" height={20} />
					<Skeleton borderRadius="0.5rem" height={137} />
				</>
			)}
		</Section.Wrapper>
	);
};
