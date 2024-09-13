import React, { useEffect } from 'react';
import { Item } from 'react-stately';
import { Chart } from 'components/chart/chart';
import { EChartsCoreOption, EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { Section } from 'modules/dashboard/components/section/section';
import styled from 'styled-components';

import { useTranslation } from 'shared/hooks/use-translation';

import { IDateRange, InputDate } from 'shared/components/input/input-date';
import { Select } from 'shared/components/select/select';

import { SelectInterface } from './number-records-final-state';

const HeaderRightWrap = styled.div`
	display: grid;
	grid-template-columns: 175px 250px;
	grid-template-rows: 1fr;
	grid-gap: 12px;
	margin-left: auto;
`;

interface DiscSpaceSavedBySourceSystemInteface {
	diskSpaceSavedSystemList: SelectInterface[];
	chartOptions: EChartsCoreOption;
	defaultRangeValue: IDateRange;
	currentState: SelectInterface | null;
	changeCurrentState: (data: SelectInterface | null) => void;
	changeCurrentDate: (data: IDateRange) => void;
}

export const DiscSpaceSavedBySourceSystem: React.FC<
	DiscSpaceSavedBySourceSystemInteface
> = ({
	defaultRangeValue,
	changeCurrentDate,
	changeCurrentState,
	chartOptions,
	diskSpaceSavedSystemList,
	currentState,
}) => {
	const { t } = useTranslation();

	return (
		<Section.Wrapper>
			<Section.Header
				title={t(
					'dashboard.rda_dashboard.disc_space_saved_by_source_system.title',
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
							'dashboard.rda_dashboard.disc_space_saved_by_source_system.selects.source.label',
						)}
						options={diskSpaceSavedSystemList}
						onChange={changeCurrentState}
						selectedKey={currentState?.id.toString()}
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
					notMerge={true}
					option={chartOptions}
					opts={{ renderer: 'svg' }}
					style={{ height: '180px', width: '100%' }}
				/>
			</Section.Body>
		</Section.Wrapper>
	);
};
