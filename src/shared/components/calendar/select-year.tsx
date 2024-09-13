import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import { getYear, setYear } from 'date-fns';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { DateElement } from 'shared/components/calendar/date-element';
import { NavButton } from 'shared/components/calendar/nav-button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';

const WrapYears = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin: 0 -0.125rem;
`;

const Navigation = styled.div`
	display: flex;
	margin: 0.75rem 0;
`;

const Year = styled(DateElement)`
	width: calc(33.333% - 0.25rem);
	height: 1.5rem;
	padding: 0;
	margin: 0.75rem 0.125rem 0;
`;

const PrevNextButton = styled(NavButton)<ThemeProps>`
	& + & {
		margin-left: 1rem;
	}
`;

const NUMBER_OF_YEARS_DISPLAYED = 12;

interface SelectYearProps {
	selectedDate: Date;
	selectDateTo: Date;
	selectDateFrom: Date;
	onChangedDate: (date: Date) => void;
}

interface IYears {
	year: number;
	isThisYear: boolean;
	isDisabled: boolean;
}

interface IGenPagesOnYears {
	pages: IYears[][];
	startPage: number;
	totalPages: number;
}

export const SelectYear: React.FC<SelectYearProps> = ({
	selectedDate,
	selectDateTo,
	selectDateFrom,
	onChangedDate,
}) => {
	const checkFromToForYear: (year: number) => boolean = (year) => {
		const isDateFromMore = year < selectDateFrom?.getFullYear();
		const isDateToLess = year > selectDateTo?.getFullYear();
		return isDateFromMore || isDateToLess;
	};

	const genPagesOnYears: IGenPagesOnYears = useMemo(() => {
		const dateTo = selectDateTo.getFullYear();
		const dateFrom = selectDateFrom.getFullYear();
		const date = selectedDate.getFullYear();

		const totalYears = dateTo - dateFrom + 1;
		const remainderYears = totalYears % NUMBER_OF_YEARS_DISPLAYED;
		const remainderVerified =
			remainderYears === 0 ? NUMBER_OF_YEARS_DISPLAYED : remainderYears;
		const numberOfYearsAdded = NUMBER_OF_YEARS_DISPLAYED - remainderVerified;
		const firstYears = dateFrom - numberOfYearsAdded;
		const totalPages =
			(totalYears + numberOfYearsAdded) / NUMBER_OF_YEARS_DISPLAYED;
		let startPage;

		const pages = [...Array(totalPages)].map((_, totalIndex) =>
			[...Array(NUMBER_OF_YEARS_DISPLAYED)].map((_, yearIndex) => {
				const year =
					firstYears + yearIndex + totalIndex * NUMBER_OF_YEARS_DISPLAYED;
				if (year === date) startPage = totalIndex;
				return {
					year: year,
					isThisYear: getYear(new Date()) === year,
					isDisabled: checkFromToForYear(year),
				};
			}),
		);

		return {
			pages,
			startPage: startPage ?? 0,
			totalPages: totalPages - 1,
		};
	}, [selectDateTo, selectDateFrom]);

	const [currentPage, setCurrentPage] = useState<number>(
		genPagesOnYears.startPage,
	);

	const selectedYear = (year: number) => selectedDate.getFullYear() === year;

	const handleYearChanged = (year: number) => () =>
		onChangedDate(setYear(selectedDate, year));

	const handlePrevPageYears = () =>
		currentPage > 0 ? setCurrentPage((page) => page - 1) : null;

	const handleNextPageYears = () =>
		currentPage < genPagesOnYears.totalPages
			? setCurrentPage((page) => page + 1)
			: null;

	return (
		<>
			<Navigation>
				<PrevNextButton
					icon={ICON_COLLECTION.icon_left}
					isDisabled={currentPage === 0}
					onPress={handlePrevPageYears}
				/>
				<PrevNextButton
					icon={ICON_COLLECTION.icon_right}
					isDisabled={currentPage === genPagesOnYears.totalPages}
					onPress={handleNextPageYears}
				/>
			</Navigation>
			<WrapYears>
				{genPagesOnYears.pages[currentPage].map(
					({ year, isThisYear, isDisabled }, index) => (
						<Year
							key={index}
							className={clsx({
								'is-today': isThisYear,
								'is-current': selectedYear(year),
							})}
							disabled={isDisabled}
							onClick={handleYearChanged(year)}
						>
							{year}
						</Year>
					),
				)}
			</WrapYears>
		</>
	);
};
