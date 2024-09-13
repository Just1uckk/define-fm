import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Chart } from 'components/chart/chart';
import { EChartsCoreOption } from 'echarts';
import { Section } from 'modules/dashboard/components/section/section';

import { useTranslation } from 'shared/hooks/use-translation';

interface TotalRecordsCurrentStateInterface {
	isLoading: boolean;
	chartOptions: EChartsCoreOption;
}

export const TotalRecordsCurrentState: React.FC<
	TotalRecordsCurrentStateInterface
> = ({ isLoading, chartOptions }) => {
	const { t, currentLang } = useTranslation();

	return (
		<Section.Wrapper>
			{!isLoading ? (
				<>
					<Section.Header
						title={t(
							'dashboard.rda_dashboard.total_number_records_current_state.title',
						)}
					/>
					<Section.Body>
						<Chart
							option={chartOptions}
							opts={{ renderer: 'svg' }}
							style={{ height: '180px', width: '100%' }}
						/>
					</Section.Body>
				</>
			) : (
				<>
					<Skeleton borderRadius="0.5rem" height={20} />
					<Skeleton borderRadius="0.5rem" height={170} />
				</>
			)}
		</Section.Wrapper>
	);
};
