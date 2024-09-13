import React, { useEffect, useState } from 'react';
import { Locale, startOfMonth } from 'date-fns';
import styled from 'styled-components';

import { FormatTypes } from 'shared/components/calendar/calendar';
import { DaysContainer } from 'shared/components/calendar/days-container';
import { MonthSelector } from 'shared/components/calendar/month-selector';

const Wrapper = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	box-sizing: border-box;
`;

const Selector = styled(MonthSelector)`
	margin-bottom: 1.25rem;
`;

const DateRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	width: 82%;
	align-self: center;
	margin-top: 1.5rem;
`;

const DateColumn = styled.div`
	width: 45%;
	padding: 4px 8px;
	margin: 4px;
	font-size: 12px;
	font-weight: 600;
	text-align: center;
	border: 1.5px solid ${({ theme }) => theme.datePicker.borderColor};
	border-radius: 2px;
	color: ${({ theme }) => theme.colors.secondary};
	background-color: transparent;

	&:hover {
		cursor: pointer;
	}
`;

interface SelectDayProps {
	type?: string;
	locale: Locale;
	selectedDate: Date;
	selectedDateSecond: Date | null;
	selectDateTo: Date;
	selectDateFrom: Date;
	onChangedDate: (date: Date) => void;
	onSelectedFormat: (format: FormatTypes) => () => void;
	onClickDate: (option: string) => void;
	onClickDateLabel: (label: string) => void;
}

interface RangeProps {
	id: number;
	value: string;
	label: string;
}

export const RangeOptions: RangeProps[] = [
	{ id: 1, value: 'month', label: 'This Month' },
	{ id: 2, value: 'lastMonth', label: 'Last Month' },
	{ id: 3, value: 'lastQuarter', label: 'Last Quarter' },
	{ id: 4, value: 'year', label: 'This Year' },
];

export const SelectDay: React.FC<SelectDayProps> = ({
	type,
	locale,
	selectedDate,
	selectedDateSecond,
	selectDateTo,
	selectDateFrom,
	onChangedDate,
	onSelectedFormat,
	onClickDate,
	onClickDateLabel,
}) => {
	const [selectedMonth, setSelectedMonth] = useState<Date>(() => {
		return startOfMonth(selectedDate);
	});

	useEffect(() => {
		setSelectedMonth(startOfMonth(selectedDate));
	}, [selectedDate]);

	return (
		<Wrapper>
			<Selector
				date={selectedMonth}
				locale={locale}
				onChangedDate={(date) => setSelectedMonth(date)}
				onSelectedFormat={onSelectedFormat}
			/>
			<DaysContainer
				locale={locale}
				selectedDate={selectedDate}
				selectedDateSecond={selectedDateSecond}
				selectDateTo={selectDateTo}
				selectDateFrom={selectDateFrom}
				selectedMonth={selectedMonth}
				onChangedDate={(date) => {
					onClickDateLabel('');
					onChangedDate(date);
				}}
			/>
			{type === 'range' && (
				<DateRow>
					{RangeOptions.map((option) => (
						<DateColumn
							onClick={() => {
								onClickDate(option.value);
								onClickDateLabel(option.label);
							}}
							key={option.id}
						>
							{option.label}
						</DateColumn>
					))}
				</DateRow>
			)}
		</Wrapper>
	);
};
