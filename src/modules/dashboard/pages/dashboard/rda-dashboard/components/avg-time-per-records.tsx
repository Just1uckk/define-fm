import React, { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { getDaysInMonth, subMonths } from 'date-fns';
import { Section } from 'modules/dashboard/components/section/section';
import styled from 'styled-components';

import { UserParamsInterface } from 'shared/types/dashboard';

import { useTranslation } from 'shared/hooks/use-translation';

import { Text } from 'shared/components/text/text';

const Body = styled(Section.Body)`
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	justify-content: center;
	align-items: center;
	gap: 1.2rem;
`;

const Days = styled(Text)`
	font-size: 36px;
`;

const SubInformation = styled.div`
	display: flex;
	gap: 0.8rem;
	justify-content: center;
`;

const Percent = styled(Text)<{ percent: number }>`
	color: ${({ theme, percent }) =>
		percent < 0 ? theme.colors.red.style_1 : theme.colors.green.style_3};
`;

const Time = styled(Text)``;

interface AvgTimePerRecordsInterface {
	isLoading: boolean;
	usersList: UserParamsInterface[];
	usersListLastMonth: UserParamsInterface[];
}

export const AvgTimePerRecords: React.FC<AvgTimePerRecordsInterface> = ({
	isLoading,
	usersList,
	usersListLastMonth,
}) => {
	const { t } = useTranslation();

	const calculate = (daysInMonth: number, usersList) => {
		const allAvg: number[] = [];
		usersList.forEach((user: UserParamsInterface) => {
			const fixed = (daysInMonth / user.count).toFixed(1);
			const intFixed: number = +fixed;
			allAvg.push(intFixed);
		});
		const totalAvg = allAvg.reduce((a, b) => a + b, 0) / allAvg.length;
		return totalAvg;
	};

	const calculatedAvg = useMemo(() => {
		if (usersList.length) {
			const daysInThisMonth = getDaysInMonth(new Date());
			return calculate(daysInThisMonth, usersList);
		}
		return 0;
	}, [usersList]);

	const percentsAvg = useMemo(() => {
		if (calculatedAvg !== 0 && usersListLastMonth.length) {
			const currentDate = new Date();
			const previousMonth = subMonths(currentDate, 1);
			const daysInPreviousMonth = getDaysInMonth(previousMonth);
			const avgPreviousMonth = calculate(
				daysInPreviousMonth,
				usersListLastMonth,
			);
			const difference = avgPreviousMonth - calculatedAvg;
			const percent = (difference / calculatedAvg) * 100;
			return Math.round(percent);
		}
		return 0;
	}, [calculatedAvg, usersListLastMonth]);

	return (
		<Section.Wrapper>
			{isLoading ? (
				<>
					<Section.Header
						title={t('dashboard.rda_dashboard.avg_time_records.title')}
					/>
					<Body>
						<Days variant="body_1_primary_semibold">
							{calculatedAvg.toFixed(2)} days
						</Days>
						<SubInformation>
							<Percent percent={percentsAvg} variant="body_3_primary">
								{percentsAvg}%
							</Percent>
							<Time variant="body_4_secondary_semibold">Since last month</Time>
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
