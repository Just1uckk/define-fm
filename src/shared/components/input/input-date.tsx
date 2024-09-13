import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { format } from 'date-fns';
import styled from 'styled-components';

import { useEffectAfterMount } from 'shared/hooks/use-effect-after-mount';
import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';

import { Calendar, CalendarProps } from 'shared/components/calendar/calendar';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import {
	Input,
	InputIconButton,
	InputProps,
} from 'shared/components/input/input';

const StyledInput = styled(Input)`
	input {
		padding-right: 2.5rem;
		cursor: pointer;
	}
`;

export interface IDate {
	date: Date;
	dateString: string;
}

export interface IDateRange {
	start: Date;
	end: Date;
}

interface InputDateProps
	extends Omit<InputProps, 'onChange' | 'type' | 'value' | 'onChangeRange'> {
	date?: Date;
	defaultRangeValue?: IDateRange;
	showIcon?: boolean;
	selectDateFrom?: CalendarProps['selectDateFrom'];
	selectDateTo?: CalendarProps['selectDateTo'];
	formatString?: string;
	type?: string;
	onChange?: (value: IDate) => void;
	onChangeRange?: (value: IDateRange) => void;
	onClickDateLabel?: (label: string) => void;
}

export const InputDate: React.FC<InputDateProps> = ({
	date,
	defaultRangeValue,
	selectDateFrom,
	selectDateTo,
	showIcon = true,
	type = 'default',
	formatString = 'dd/MM/yyyy',
	onChange,
	onChangeRange,
	onClickDateLabel,
	...props
}) => {
	const [inputValue, setInputValue] = useState<string>('');
	const [selectedDate, setSelectedDate] =
		useState<InputDateProps['date']>(date);
	const [selectedDateSecond, setSelectedDateSecond] =
		useState<InputDateProps['date']>();

	const managePopperState = useManagePopperState({
		placement: 'bottom-start',
	});

	useEffectAfterMount(() => {
		if (type !== 'range') {
			setSelectedDate(date);
		}
	}, [date]);

	useEffect(() => {
		if (!selectedDate) {
			if (defaultRangeValue) {
				if (type === 'range') {
					const stringDate =
						format(defaultRangeValue.start, 'LLL') +
						' - ' +
						format(defaultRangeValue.end, 'LLL') +
						' ' +
						defaultRangeValue.end.getFullYear();
					setInputValue(stringDate);
				}
				return;
			}
			setInputValue('');
			return;
		}
		const dateString = format(selectedDate, formatString);
		if (onChange) onChange({ date: selectedDate, dateString });
		if (onChangeRange)
			onChangeRange({
				start: selectedDate,
				end: selectedDateSecond ? selectedDateSecond : selectedDate,
			});

		if (type === 'range') {
			const stringDate =
				format(selectedDate, 'LLL') +
				' - ' +
				format(selectedDateSecond!, 'LLL') +
				' ' +
				selectedDateSecond!.getFullYear();
			setInputValue(stringDate);
		} else {
			setInputValue(dateString);
		}
	}, [selectedDate, selectedDateSecond]);

	const onCloseCalendar = () => managePopperState.toggleMenu(false);

	const onClickInput = () => {
		managePopperState.toggleMenu();
	};

	return (
		<>
			<StyledInput
				ref={managePopperState.setReferenceElement}
				{...props}
				type="text"
				value={inputValue}
				readonly
				icon={
					showIcon ? (
						<InputIconButton
							tag="div"
							rel="presentation"
							icon={ICON_COLLECTION.calendar}
							onPress={onClickInput}
						/>
					) : null
				}
				onClick={onClickInput}
			/>
			{managePopperState.isOpen &&
				ReactDOM.createPortal(
					<Calendar
						type={type}
						ref={(ref) => managePopperState.setPopperElement(ref)}
						date={selectedDate}
						setDate={setSelectedDate}
						setDateSecond={setSelectedDateSecond}
						selectDateFrom={selectDateFrom}
						selectDateTo={selectDateTo}
						style={managePopperState.styles.popper}
						onClose={onCloseCalendar}
						onClickDateLabel={(data) => {
							if (onClickDateLabel) {
								onClickDateLabel(data);
							}
						}}
						{...managePopperState.attributes.popper}
					/>,
					document.body,
				)}
		</>
	);
};
