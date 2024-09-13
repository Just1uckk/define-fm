import React, { useMemo } from 'react';
import clsx from 'clsx';
import {
	addDays,
	addMonths,
	eachDayOfInterval,
	endOfMonth,
	getDate,
	getDay,
	isSameDay,
	isToday,
	lastDayOfMonth,
	Locale,
	set,
	startOfMonth,
	subDays,
	subMonths,
} from 'date-fns';
import { setMonth } from 'date-fns/esm';
import { capitalizeFirstLetter } from 'shared/utils/utils';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { DateElement } from 'shared/components/calendar/date-element';

const Wrapper = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
`;

const WeekdayName = styled.span<ThemeProps>`
	display: flex;
	justify-content: center;
	user-select: none;
	height: 1.5rem;
	width: 2rem;
	font-size: 0.75rem;
	line-height: 0.75rem;
	color: ${({ theme }) => theme.datePicker.dataElement.daysOfWeekColor};
`;

const Day = styled(DateElement)`
	height: 1.5rem;
	width: 2rem;
`;

type MonthAndDay = {
	date: Date;
	day: number;
};

type MonthDays = {
	daysInPrevMonth: MonthAndDay[];
	daysInCurrentMonth: MonthAndDay[];
	daysInNextMonth: MonthAndDay[];
	pastDays: MonthAndDay[];
	futureDays: MonthAndDay[];
	futureDaysInCurrentMonth: MonthAndDay[];
	pastDaysInCurrentMonth: MonthAndDay[];
	allowedFutureDays: MonthAndDay[];
	allowedFutureDaysInCurrentMonth: MonthAndDay[];
};

export interface DaysContainerProps {
	locale: Locale;
	selectedDate: Date;
	selectedDateSecond: Date | null;
	selectedMonth: Date;
	selectDateTo?: Date;
	selectDateFrom?: Date;
	onChangedDate: (date: Date) => void;
}

export const DaysContainer: React.FC<DaysContainerProps> = ({
	locale,
	selectedDate,
	selectedDateSecond,
	selectedMonth,
	selectDateTo,
	selectDateFrom,
	onChangedDate,
}) => {
	const getPrevMonthDays = (daysMissing: number, date: Date): MonthAndDay[] => {
		const lastMonth = subMonths(date, 1);
		const end = lastDayOfMonth(lastMonth);
		const start = subDays(end, daysMissing);
		const interval = eachDayOfInterval({ start, end });

		return interval.map((date) => ({
			date,
			day: getDate(date),
		}));
	};

	const getNextMonthDays = (daysMissing: number, date: Date): MonthAndDay[] => {
		const nextMonth = addMonths(date, 1);
		const start = startOfMonth(nextMonth);
		const end = addDays(start, daysMissing);
		const interval = eachDayOfInterval({ start, end });

		return interval.map((date) => ({
			date,
			day: getDate(date),
		}));
	};

	const weekdayNames = useMemo(() => {
		return [...Array(7)].map((_, i) =>
			capitalizeFirstLetter(locale.localize?.day(i, { width: 'short' })),
		);
	}, [locale]);

	const monthStart = useMemo(() => {
		const start = startOfMonth(selectedMonth);
		const day = getDay(start);

		return {
			date: start,
			weekday: day === 0 ? 7 : day,
		};
	}, [selectedMonth]);

	const monthEnd = useMemo(() => {
		const end = endOfMonth(selectedMonth);
		const day = getDay(end);

		return {
			date: end,
			weekday: day === 0 ? 7 : day,
		};
	}, [selectedMonth]);

	const monthDays: MonthDays = useMemo(() => {
		let daysInPrevMonth: MonthAndDay[] = [];
		let daysInNextMonth: MonthAndDay[] = [];
		const currentDate = selectDateFrom
			? set(selectDateFrom, { hours: 0 })
			: set(new Date(), { hours: 0 });
		const currentDateTime = currentDate.getTime();

		if (monthStart.weekday > 1) {
			daysInPrevMonth = getPrevMonthDays(monthStart.weekday - 2, selectedMonth);
		}

		if (monthEnd.weekday < 7) {
			daysInNextMonth = getNextMonthDays(6 - monthEnd.weekday, selectedMonth);
		}

		const daysInMonth = eachDayOfInterval({
			start: monthStart.date,
			end: monthEnd.date,
		});

		const daysInCurrentMonth = daysInMonth.map((day) => ({
			date: day,
			day: getDate(day),
		}));

		let futureDays,
			futureDaysInCurrentMonth,
			allowedFutureDays,
			allowedFutureDaysInCurrentMonth;

		if (selectDateTo) {
			const selectDateToTime = selectDateTo.getTime();

			allowedFutureDays = daysInCurrentMonth.filter(
				({ date }) =>
					date.getTime() >= currentDateTime &&
					date.getTime() <= selectDateToTime,
			);

			allowedFutureDaysInCurrentMonth = allowedFutureDays.filter((date) => ({
				...date,
				day: getDate(date.date),
			}));

			futureDays = daysInCurrentMonth.filter(
				({ date }) => date.getTime() > selectDateToTime,
			);

			futureDaysInCurrentMonth = futureDays.map((date) => ({
				...date,
				day: getDate(date.date),
			}));
		} else {
			futureDays = daysInCurrentMonth.filter(
				({ date }) => date.getTime() >= currentDateTime,
			);

			futureDaysInCurrentMonth = futureDays.map((date) => ({
				...date,
				day: getDate(date.date),
			}));
		}

		const pastDays = daysInCurrentMonth.filter(
			({ date }) => date.getTime() < currentDateTime,
		);

		const pastDaysInCurrentMonth = pastDays.map((date) => ({
			...date,
			day: getDate(date.date),
		}));

		return {
			daysInPrevMonth,
			daysInCurrentMonth,
			daysInNextMonth,
			futureDays,
			futureDaysInCurrentMonth,
			pastDays,
			pastDaysInCurrentMonth,
			allowedFutureDays,
			allowedFutureDaysInCurrentMonth,
		};
	}, [monthStart, monthEnd, selectDateTo, selectedMonth, selectDateFrom]);

	const handleDayChanged = (day: number) => {
		let updatedDate = set(selectedDate, {
			date: day,
			month: selectedMonth.getMonth(),
			year: selectedMonth.getFullYear(),
		});
		updatedDate = setMonth(updatedDate, selectedMonth.getMonth());
		onChangedDate(updatedDate);
	};

	return (
		<Wrapper>
			{weekdayNames.map((dayName, index) => (
				<WeekdayName key={index}>{dayName}</WeekdayName>
			))}
			{monthDays.daysInPrevMonth.map((date, index) => (
				<Day key={`${date.day}-${index}`} disabled={true}>
					{date.day}
				</Day>
			))}
			{monthDays.pastDaysInCurrentMonth.map((date, index) => (
				<Day key={`${date.day}-${index}`} disabled={true}>
					{date.day}
				</Day>
			))}
			{monthDays.allowedFutureDaysInCurrentMonth.map((date, index) => (
				<Day
					key={`${date.day}-${index}`}
					className={clsx({
						'is-today': isToday(date.date),
						'is-current-second': isSameDay(selectedDateSecond!, date.date),
						'is-current': isSameDay(selectedDate, date.date),
						range: date.date >= selectedDate && date.date < selectedDateSecond!,
					})}
					onClick={() => handleDayChanged(date.day)}
				>
					{date.day}
				</Day>
			))}
			{monthDays.futureDaysInCurrentMonth.map((date, index) => (
				<Day
					key={`${date.day}-${index}`}
					className={clsx({
						'is-today': isToday(date.date),
						'is-current': isSameDay(selectedDate, date.date),
					})}
					disabled={true}
				>
					{date.day}
				</Day>
			))}
			{monthDays.daysInNextMonth.map((date, index) => (
				<Day key={`${date.day}-${index}`} disabled={true}>
					{date.day}
				</Day>
			))}
		</Wrapper>
	);
};
