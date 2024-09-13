import React, { forwardRef, useEffect, useState } from 'react';
import {
	endOfMonth,
	endOfQuarter,
	endOfYear,
	Locale,
	setYear,
	startOfMonth,
	startOfQuarter,
	startOfYear,
	subMonths,
	subQuarters,
} from 'date-fns';
import { enUS, frCA } from 'date-fns/locale';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { LanguageTypes } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { RangeOptions, SelectDay } from 'shared/components/calendar/select-day';
import { SelectMonth } from 'shared/components/calendar/select-month';
import { SelectYear } from 'shared/components/calendar/select-year';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';

const WrapCalendar = styled.div<ThemeProps>`
	display: flex;
	flex-direction: column;
	width: 16.9375rem;
	padding: 1.5rem 1rem 0.75rem;
	border-radius: 0.5rem;
	background: ${({ theme }) => theme.datePicker.background};
	border: 1px solid ${({ theme }) => theme.datePicker.borderColor};
	box-shadow: 0px 12px 32px ${({ theme }) => theme.datePicker.boxShadowColor};
	overflow: hidden;
	z-index: 11;
`;

const Header = styled.div`
	margin-bottom: 0.75rem;
`;

const Body = styled.div``;

const Footer = styled(ButtonList)`
	display: flex;
	justify-content: center;
	margin-top: 1.5rem;
`;

const BackButton = styled(Button)`
	height: auto;
	padding: 0;
	border-radius: 0.25rem;
	font-size: 0.875rem;
	line-height: 1.0625rem;
	font-weight: 400;

	&:focus-visible {
		outline: rgb(16, 16, 16) auto 1px;
		outline: -webkit-focus-ring-color auto 1px;
		outline-offset: 0.3rem;
	}

	&.icon-left .button__content-label {
		margin-left: 1.0625rem;
	}
	.button__content-icon {
		width: 0.34375rem;
		height: auto;
	}
`;

const ControlButton = styled(Button)`
	height: auto;
	padding: 0.5rem 1rem;
	border-radius: 0.25rem;
`;

const LANGS: Record<LanguageTypes, Locale> = {
	en: enUS,
	fr_CA: frCA,
};

export type FormatTypes = 'day' | 'month' | 'year';

export interface CalendarProps {
	date?: Date;
	selectDateFrom?: Date;
	selectDateTo?: Date;
	style?: React.CSSProperties;
	type: string;
	setDate: (date: Date) => void;
	setDateSecond: (date: Date) => void;
	onClose?: () => void;
	onClickDateLabel: (label: string) => void;
}

const CalendarComponent: React.ForwardRefRenderFunction<
	HTMLDivElement,
	CalendarProps
> = (
	{
		date = new Date(),
		selectDateFrom = setYear(new Date().getUTCDate(), date.getFullYear() - 10),
		selectDateTo = setYear(date, date.getFullYear() + 10),
		style,
		type,
		onClose,
		setDate,
		setDateSecond,
		onClickDateLabel,
		...rest
	},
	ref,
) => {
	const [currentFormat, setCurrentFormat] = useState<FormatTypes>('day');
	const [selectedDate, setSelectedDate] = useState<Date>(date);
	const [selectedDateSecond, setSelectedDateSecond] = useState<Date>();
	const [firstClick, setFirstClick] = useState<boolean>(true);

	const changeSelectedData = (date) => {
		if (type === 'range') {
			if (firstClick) {
				setFirstClick(false);
				setSelectedDateSecond(date);
				if (date < selectedDate) setSelectedDateSecond(selectedDate);
			} else {
				setFirstClick(true);
				setSelectedDate(date);
				if (selectedDateSecond && date > selectedDateSecond)
					setSelectedDateSecond(date);
			}
		} else {
			setSelectedDate(date);
		}
	};

	const rangeSelectDate = (data) => {
		const currentData = new Date();
		if (data === RangeOptions[0].value) {
			setSelectedDate(startOfMonth(currentData));
			setSelectedDateSecond(endOfMonth(currentData));
		}
		if (data === RangeOptions[1].value) {
			const firstDayOfLastMonth = startOfMonth(subMonths(currentData, 1));
			setSelectedDate(firstDayOfLastMonth);
			setSelectedDateSecond(endOfMonth(firstDayOfLastMonth));
		}
		if (data === RangeOptions[2].value) {
			const firstDayOfLastQuartal = startOfQuarter(subQuarters(currentData, 1));
			setSelectedDate(firstDayOfLastQuartal);
			setSelectedDateSecond(endOfQuarter(firstDayOfLastQuartal));
		}
		if (data === RangeOptions[3].value) {
			setSelectedDate(startOfYear(currentData));
			setSelectedDateSecond(endOfYear(currentData));
		}
	};

	const { currentLang } = useTranslation();

	useEffect(() => {
		if (selectedDate > selectDateTo) setSelectedDate(selectDateTo);
		if (selectedDate < selectDateFrom) setSelectedDate(selectDateFrom);
	}, [selectedDate]);

	const onBack = () => setCurrentFormat('day');
	const onSaveDate = () => {
		if (currentFormat === 'day') {
			setDate(selectedDate);
			if (type === 'range')
				setDateSecond(selectedDateSecond ? selectedDateSecond : selectedDate);
			if (onClose) onClose();
		} else setCurrentFormat('day');
	};

	const handleSelectedFormat = (format: FormatTypes) => () => {
		if (format !== currentFormat) setCurrentFormat(format);
	};

	return (
		<WrapCalendar ref={ref} style={style} {...rest}>
			{currentFormat !== 'day' && (
				<Header>
					<BackButton
						label={<LocalTranslation tk="components.calendar.back" />}
						variant="primary_ghost"
						icon={ICON_COLLECTION.chevron_left}
						onClick={onBack}
					/>
				</Header>
			)}
			<Body>
				{currentFormat === 'day' && (
					<SelectDay
						type={type}
						selectedDate={selectedDate}
						selectedDateSecond={selectedDateSecond ? selectedDateSecond : null}
						selectDateTo={selectDateTo}
						selectDateFrom={selectDateFrom}
						locale={LANGS[currentLang]}
						onChangedDate={changeSelectedData}
						onSelectedFormat={handleSelectedFormat}
						onClickDate={(data) => rangeSelectDate(data)}
						onClickDateLabel={onClickDateLabel}
					/>
				)}
				{currentFormat === 'month' && (
					<SelectMonth
						selectedDate={selectedDate}
						selectDateTo={selectDateTo}
						locale={LANGS[currentLang]}
						selectDateFrom={selectDateFrom}
						onChangedDate={changeSelectedData}
					/>
				)}
				{currentFormat === 'year' && (
					<SelectYear
						selectedDate={selectedDate}
						selectDateTo={selectDateTo}
						selectDateFrom={selectDateFrom}
						onChangedDate={changeSelectedData}
					/>
				)}
			</Body>
			<Footer>
				<ControlButton
					variant="primary"
					label={<LocalTranslation tk="components.calendar.done" />}
					onClick={onSaveDate}
				/>
				<ControlButton
					variant="primary_ghost"
					label={<LocalTranslation tk="components.calendar.close" />}
					onClick={onClose}
				/>
			</Footer>
		</WrapCalendar>
	);
};

export const Calendar = forwardRef(CalendarComponent);
