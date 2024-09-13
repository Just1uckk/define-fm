import React, { useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Chart, ChartRefType } from 'components/chart/chart';
import { EChartsOption } from 'echarts';
import { Section } from 'modules/dashboard/components/section/section';
import styled from 'styled-components';

import { useTranslation } from 'shared/hooks/use-translation';

import { Text } from 'shared/components/text/text';

const StyledBody = styled(Section.Body)`
	display: grid;
	grid-template-columns: 40% auto;
	grid-template-rows: 1fr;
`;

const Percent = styled(Text)`
	display: flex;
	align-items: center;
	font-size: 36px;
	margin-bottom: 26px;
`;

const ChartWrapper = styled.div`
	max-height: 125px;
	overflow: hidden;
`;

const StyledChart = styled(Chart)`
	margin-top: -10px;
`;

interface OnTimeCompletion {
	isLoading: boolean;
	chartOption: EChartsOption;
	percent: number;
}

export const OnTimeCompletion: React.FC<OnTimeCompletion> = ({
	chartOption,
	isLoading,
	percent,
}) => {
	const { t } = useTranslation();
	const chartRef = useRef<ChartRefType>(null);

	return (
		<Section.Wrapper>
			{isLoading ? (
				<>
					<Section.Header
						title={t('dashboard.personal_dashboard.on_time_completion.title')}
					/>
					<StyledBody>
						<Percent variant="body_1_primary_semibold">
							{Math.round(percent)} %
						</Percent>
						<ChartWrapper>
							<StyledChart
								ref={chartRef}
								option={chartOption}
								opts={{ renderer: 'svg' }}
								style={{ height: '160px', width: '160' }}
							/>
						</ChartWrapper>
					</StyledBody>
				</>
			) : (
				<>
					<Skeleton borderRadius="0.5rem" height={20} />
					<Skeleton borderRadius="0.5rem" height={110} />
				</>
			)}
		</Section.Wrapper>
	);
};
