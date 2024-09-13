import React from 'react';
import { addMonths, format, Locale, startOfMonth, subMonths } from 'date-fns';
import { capitalizeFirstLetter } from 'shared/utils/utils';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { FormatTypes } from 'shared/components/calendar/calendar';
import { NavButton } from 'shared/components/calendar/nav-button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';

const Wrapper = styled.div`
	display: flex;
	align-items: center;
`;

const WrapButtons = styled(ButtonList)`
	display: flex;
	margin: 0 1rem;
`;

const StyledButton = styled(Button)<ThemeProps>`
	height: auto;
	width: auto;
	padding: 0;
	border-radius: 0.25rem;
	font-size: 0.875rem;
	line-height: 0.875rem;
	text-align: left;

	&:first-child {
		margin-left: 0;
	}

	&:focus-visible {
		outline: rgb(16, 16, 16) auto 1px;
		outline: -webkit-focus-ring-color auto 1px;
		outline-offset: 0.3rem;
	}

	&.icon-right .button__content-label {
		margin-right: 0.5625rem;
	}

	.button__content-label {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.button__content-icon {
		width: 0.34375rem;
		height: auto;
	}
`;

const MonthButton = styled(StyledButton)<ThemeProps>`
	.button__content-label {
		width: 4.5rem;
	}
`;

const YearButton = styled(StyledButton)<ThemeProps>``;

const PrevNextButton = styled(NavButton)`
	&:last-child {
		margin-left: auto;
	}
`;

export interface MonthSelectorProps {
	date: Date;
	locale: Locale;
	className?: string;
	onChangedDate: (date: Date) => void;
	onSelectedFormat: (format: FormatTypes) => () => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
	date,
	locale,
	className,
	onChangedDate,
	onSelectedFormat,
}) => {
	const currentMonth = capitalizeFirstLetter(
		format(date, 'MMMM', { locale: locale }),
	);
	const currentYear = format(date, 'yyyy');

	const handlePrevMonth = () => {
		const prevMonth = subMonths(date, 1);
		const startDate = startOfMonth(prevMonth);
		onChangedDate(startDate);
	};

	const handleNextMonth = () => {
		const nextMonth = addMonths(date, 1);
		const startDate = startOfMonth(nextMonth);
		onChangedDate(startDate);
	};

	return (
		<Wrapper className={className}>
			<PrevNextButton
				icon={ICON_COLLECTION.icon_left}
				onPress={handlePrevMonth}
			/>
			<WrapButtons>
				<MonthButton
					icon={ICON_COLLECTION.chevron_right}
					iconPlace="right"
					label={currentMonth}
					variant="primary_ghost"
					onClick={onSelectedFormat('month')}
				/>
				<YearButton
					icon={ICON_COLLECTION.chevron_right}
					iconPlace="right"
					label={currentYear}
					variant="primary_ghost"
					onClick={onSelectedFormat('year')}
				/>
			</WrapButtons>
			<PrevNextButton
				icon={ICON_COLLECTION.icon_right}
				onPress={handleNextMonth}
			/>
		</Wrapper>
	);
};
