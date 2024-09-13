import React, { useEffect, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useMutation, useQuery } from 'react-query';
import { Item } from 'react-stately';
import {
	endOfMonth,
	endOfWeek,
	lastDayOfMonth,
	lastDayOfWeek,
	lastDayOfYear,
	startOfMonth,
	startOfWeek,
	startOfYear,
} from 'date-fns';
import { Section } from 'modules/dashboard/components/section/section';
import {
	differenceData,
	filterData,
	FilterDataDto,
} from 'modules/dashboard/helpers/filter-data';
import styled from 'styled-components';

import { DashboardApi } from 'app/api/dashboard-api/dashboard-api';

import { IApprovedListRequest, ITotalRequest } from 'shared/types/dashboard';

import { DASHBOARD_QUERY_KEYS } from 'shared/constants/query-keys';

import { useTranslation } from 'shared/hooks/use-translation';

import { Option, Select } from 'shared/components/select/select';
import { Text } from 'shared/components/text/text';

const Body = styled(Section.Body)`
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	justify-content: center;
	align-items: center;
	gap: 1.2rem;
`;

const Size = styled(Text)`
	font-size: 36px;
`;

const SubInformation = styled.div`
	display: flex;
	gap: 0.8rem;
	justify-content: center;
`;

const Percent = styled(Text)`
	color: ${({ theme, isPositive }) =>
		isPositive! >= 0 ? theme.colors.green.style_3 : theme.colors.red.style_1};
`;

const Time = styled(Text)``;

const HeaderRightWrap = styled.div`
	display: grid;
	grid-template-columns: 130px;
	grid-template-rows: 1fr;
	grid-gap: 12px;
	margin-left: auto;
`;

export const DiskSpaceSaved: React.FC = () => {
	const { t, currentLang } = useTranslation();

	const OPTIONS: Option[] = [
		{
			key: 1,
			value: 'week',
			label: t('dashboard.rda_dashboard.disk_saved.data.week'),
		},
		{
			key: 2,
			value: 'month',
			label: t('dashboard.rda_dashboard.disk_saved.data.month'),
		},
		{
			key: 3,
			value: 'year',
			label: t('dashboard.rda_dashboard.disk_saved.data.year'),
		},
	];

	const [actualData, setActualData] = useState<Option | null>(OPTIONS[0]);

	const requestData: { actual: ITotalRequest; last: ITotalRequest } =
		useMemo(() => {
			if (actualData?.key === 1) {
				const data = new Date();
				const last = new Date();
				let lastData = last.getDate() - 7;
				lastData = last.setDate(lastData);

				return {
					actual: {
						name: 'Saved Diskspace',
						start: startOfWeek(data),
						end: lastDayOfWeek(data),
					},
					last: {
						name: 'Saved Diskspace',
						start: startOfWeek(lastData),
						end: lastDayOfWeek(lastData),
					},
				};
			}
			if (actualData?.key === 2) {
				const data = new Date();
				const last = new Date();
				let lastData = last.getMonth() - 1;
				lastData = last.setMonth(lastData);

				return {
					actual: {
						name: 'Saved Diskspace',
						start: startOfMonth(data),
						end: lastDayOfMonth(data),
					},
					last: {
						name: 'Saved Diskspace',
						start: startOfMonth(lastData),
						end: lastDayOfMonth(lastData),
					},
				};
			}
			if (actualData?.key === 3) {
				const data = new Date();
				const last = new Date();
				let lastData = last.getFullYear() - 1;
				lastData = last.setFullYear(lastData);

				return {
					actual: {
						name: 'Saved Diskspace',
						start: startOfYear(data),
						end: lastDayOfYear(data),
					},
					last: {
						name: 'Saved Diskspace',
						start: startOfYear(lastData),
						end: lastDayOfYear(lastData),
					},
				};
			}
			const data = new Date();
			const last = new Date();
			let lastData = last.getFullYear() - 1;
			lastData = last.setFullYear(lastData);

			return {
				actual: {
					name: 'Saved Diskspace',
					start: startOfYear(data),
					end: lastDayOfYear(data),
				},
				last: {
					name: 'Saved Diskspace',
					start: startOfYear(lastData),
					end: lastDayOfYear(lastData),
				},
			};
		}, [actualData]);

	useEffect(() => {
		diskSpaceMutation.mutate();
		diskSpaceLastMutation.mutate();
	}, [requestData]);

	// const { data: spaceSavedsData, isFetched } = useQuery({
	// 	queryKey: DASHBOARD_QUERY_KEYS.space_saved,
	// 	queryFn: () => DashboardApi.diskSpaceSaved(requestData),
	// });

	const diskSpaceMutation = useMutation({
		mutationFn: () => DashboardApi.diskSpaceSaved(requestData.actual),
	});
	const diskSpaceLastMutation = useMutation({
		mutationFn: () => DashboardApi.diskSpaceSaved(requestData.last),
	});

	const diskSpace: FilterDataDto = useMemo(() => {
		const { total, totalBytes, sizeName } = filterData(diskSpaceMutation.data);

		return {
			total,
			totalBytes,
			sizeName,
		};
	}, [diskSpaceMutation.data, actualData, currentLang]);

	const diskSpaceDifference: number = useMemo(() => {
		const difference = differenceData(
			diskSpaceMutation.data,
			diskSpaceLastMutation.data,
		);

		return difference;
	}, [diskSpaceMutation.data, actualData, currentLang]);

	const actualDate = useMemo((): string | undefined => {
		return `${t(
			'dashboard.rda_dashboard.disk_saved.sub_title',
		)} ${actualData?.label.toString().toLowerCase()}`;
	}, [currentLang, actualData]);

	return (
		<Section.Wrapper>
			{!diskSpaceMutation.isLoading ? (
				<>
					<Section.Header title={t('dashboard.rda_dashboard.disk_saved.title')}>
						<HeaderRightWrap>
							<Select<Option>
								aria-label={'disabled'}
								selectedKey={actualData?.value}
								options={OPTIONS}
								onChange={(data) => {
									setActualData(data);
								}}
							>
								{(option) => (
									<Item key={option.value} textValue={option.label as string}>
										{option.label}
									</Item>
								)}
							</Select>
						</HeaderRightWrap>
					</Section.Header>
					<Body>
						<Size variant="body_1_primary_semibold">
							{diskSpace.total} {diskSpace.sizeName}
						</Size>
						<SubInformation>
							<Percent
								isPositive={diskSpaceDifference}
								variant="body_3_primary"
							>
								{diskSpaceDifference}%
							</Percent>
							<Time variant="body_4_secondary_semibold">{actualDate}</Time>
						</SubInformation>
					</Body>
				</>
			) : (
				<>
					<Skeleton borderRadius="0.5rem" height={20} />
					<Skeleton borderRadius="0.5rem" height={137} />
				</>
			)}
		</Section.Wrapper>
	);
};
