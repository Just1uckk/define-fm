import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Item } from 'react-stately';
import { Chart } from 'components/chart/chart';
import { EChartsCoreOption } from 'echarts';
import { Section } from 'modules/dashboard/components/section/section';
import styled from 'styled-components';

import { useTranslation } from 'shared/hooks/use-translation';

import { IDateRange, InputDate } from 'shared/components/input/input-date';
import { Select } from 'shared/components/select/select';

const HeaderRightWrap = styled.div`
	display: grid;
	grid-template-columns: 175px 250px;
	grid-template-rows: 1fr;
	grid-gap: 12px;
	margin-left: auto;
`;

export interface SelectInterface {
	id: number;
	name: string;
}

interface NumberRecordsFinalStateInterface {
	isLoading: boolean;
	chartOptions: EChartsCoreOption;
	numberOfRecordsStateList: SelectInterface[];
	currentState: SelectInterface | null;
	defaultRangeValue: IDateRange;
	changeCurrentState: (data: SelectInterface | null) => void;
	changeCurrentDate: (data: IDateRange) => void;
}

export const NumberRecordsFinalState: React.FC<
	NumberRecordsFinalStateInterface
> = ({
	isLoading,
	chartOptions,
	numberOfRecordsStateList,
	currentState,
	defaultRangeValue,
	changeCurrentState,
	changeCurrentDate,
}) => {
	const { t } = useTranslation();

	return (
		<Section.Wrapper>
			{!isLoading ? (
				<>
					<Section.Header
						title={t(
							'dashboard.rda_dashboard.number_records_final_state_over_time.title',
						)}
					>
						<HeaderRightWrap>
							<InputDate
								label="Date"
								showIcon={false}
								type="range"
								defaultRangeValue={defaultRangeValue}
								onChangeRange={changeCurrentDate}
							/>
							<Select
								label={t(
									'dashboard.rda_dashboard.number_records_final_state_over_time.selects.state.label',
								)}
								selectedKey={currentState?.id.toString()}
								options={numberOfRecordsStateList}
								onChange={changeCurrentState}
							>
								{(option) => (
									<Item key={option.id} textValue={option.name}>
										{option.name}
									</Item>
								)}
							</Select>
						</HeaderRightWrap>
					</Section.Header>
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
