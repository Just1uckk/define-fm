import React, { useMemo } from 'react';
import clsx from 'clsx';
import { eachMonthOfInterval, getMonth, getYear, setMonth } from 'date-fns';
import { capitalizeFirstLetter } from 'shared/utils/utils';
import styled from 'styled-components';

import { DateElement } from 'shared/components/calendar/date-element';

const Wrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin: 0 -0.125rem;
`;

const Month = styled(DateElement)`
	width: calc(33.333% - 0.25rem);
	height: 1.5rem;
	padding: 0;
	margin: 0.75rem 0.125rem 0;
`;

interface SelectMonthProps {
	locale: Locale;
	selectedDate: Date;
	selectDateTo: Date;
	selectDateFrom: Date;
	onChangedDate: (date: Date) => void;
}

interface IMonth {
	month: string;
	isThisMonth: boolean;
	isDisabled: boolean;
}

export const SelectMonth: React.FC<SelectMonthProps> = ({
	locale,
	selectedDate,
	selectDateTo,
	selectDateFrom,
	onChangedDate,
}) => {
	const monthNames: string[] = useMemo(() => {
		return [...Array(12)].map((_, index) =>
			capitalizeFirstLetter(locale.localize?.month(index, { width: 'long' })),
		);
	}, [locale]);

	const genMonths: IMonth[] = useMemo(() => {
		const selectedYear = selectedDate.getFullYear();
		const yearFrom = selectDateFrom.getFullYear();
		const yearTo = selectDateTo.getFullYear();

		const startDate =
			selectedYear !== yearFrom ? new Date(selectedYear, 0) : selectDateFrom;

		const endDate =
			selectedYear !== yearTo ? new Date(selectedYear, 11) : selectDateTo;

		const permittedMonths = eachMonthOfInterval({
			start: startDate,
			end: endDate,
		}).map((month) => month.getMonth());

		return monthNames.map((month, index) => ({
			month: month,
			isDisabled: !permittedMonths.includes(index),
			isThisMonth:
				getMonth(new Date()) === index && getYear(new Date()) === selectedYear,
		}));
	}, [selectDateFrom, selectDateTo, monthNames]);

	const handleMonthChanged = (month: number) => () =>
		onChangedDate(setMonth(selectedDate, month));

	const selectedMonth = selectedDate.getMonth();

	return (
		<Wrapper>
			{genMonths.map(({ month, isThisMonth, isDisabled }, index) => (
				<Month
					key={index}
					className={clsx({
						'is-today': isThisMonth,
						'is-current': selectedMonth === index,
					})}
					disabled={isDisabled}
					onClick={handleMonthChanged(index)}
				>
					{month}
				</Month>
			))}
		</Wrapper>
	);
};
