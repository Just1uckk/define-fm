import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Chart } from 'components/chart/chart';
import { EChartsOption } from 'echarts';
import { Section } from 'modules/dashboard/components/section/section';
import styled from 'styled-components';

import { useTranslation } from 'shared/hooks/use-translation';

import { IDateRange, InputDate } from 'shared/components/input/input-date';

const HeaderRightWrap = styled.div`
	display: grid;
	grid-template-rows: 1fr;
	grid-gap: 12px;
	margin-left: auto;
`;

interface NumberRecordsReviewedInterface {
	isLoading: boolean;
	chartOption: EChartsOption;
	dateLabel: string;
	defaultRangeValue: IDateRange;
	changeDate: (date: IDateRange) => void;
	onClickDateLabel: (label: string) => void;
}

export const NumberRecordsReviewed: React.FC<
	NumberRecordsReviewedInterface
> = ({
	isLoading,
	dateLabel,
	chartOption,
	defaultRangeValue,
	changeDate,
	onClickDateLabel,
}) => {
	const { t } = useTranslation();

	return (
		<Section.Wrapper>
			{isLoading ? (
				<>
					<Section.Header
						title={
							t(
								'dashboard.personal_dashboard.number_records_reviewed_per_quarter.title',
							) + `${dateLabel}`
						}
					>
						<HeaderRightWrap>
							<InputDate
								label="Date"
								showIcon={false}
								type="range"
								defaultRangeValue={defaultRangeValue}
								onClickDateLabel={onClickDateLabel}
								onChangeRange={changeDate}
							/>
						</HeaderRightWrap>
					</Section.Header>
					<Section.Body>
						<Chart
							option={chartOption}
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
