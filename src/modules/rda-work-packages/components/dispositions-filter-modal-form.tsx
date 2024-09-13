import React, { useMemo, useState } from 'react';
import update from 'immutability-helper';
import {
	DispositionTableFilterType,
	TableStateReducerStateType,
} from 'modules/rda-work-packages/pages/rda-work-packages-overview/table-state-reducer';
import { isDate } from 'shared/utils/utils';
import styled from 'styled-components';

import {
	FindEntityResponseFilterGroup,
	FindEntityResponseFilterGroupField,
} from 'app/api/types';

import { IUser, LanguageTypes } from 'shared/types/users';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { IDate, InputDate } from 'shared/components/input/input-date';
import { NumberField } from 'shared/components/input/number-field';
import { UserSearchInput } from 'shared/components/input/user-search-input';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { FilterOption } from 'shared/components/table-controls/filter-panel/filter-option';
import { Text } from 'shared/components/text/text';
import { UserLine } from 'shared/components/user-line/user-line';
import { UserLineList } from 'shared/components/user-line/user-line-list';

const Form = styled.form`
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	margin-top: -1.5rem;
`;

const Row = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin: 0 -2rem;
`;

const Column = styled.div`
	width: calc(50% - 4rem);
	flex-grow: 1;
	margin: 0 2rem;
	margin-top: 1.5rem;
`;

const ColumnTitle = styled(Text)`
	margin-bottom: 1rem;
`;

const ColumnFilters = styled.div`
	padding-left: 1.5rem;
	margin-top: 1rem;
`;

const Section = styled.div`
	margin-top: 1.5rem;
`;

const FROM_DATE_START_POINT = new Date('1990.01.01');

export type RdaWorkPackageFilterFormFilterList = Omit<
	TableStateReducerStateType['filters'],
	'filters'
> & {
	filters: DispositionTableFilterType;
};

export interface DispositionsFilterModalFormProps {
	externalFilters?: FindEntityResponseFilterGroup[];
	initialActiveFilters: RdaWorkPackageFilterFormFilterList;
	onSave: (filters: RdaWorkPackageFilterFormFilterList) => void;
	onClose: () => void;
}

export const DispositionsFilterModalForm: React.FC<
	DispositionsFilterModalFormProps
> = ({ externalFilters = [], initialActiveFilters, onSave, onClose }) => {
	const { t, currentLang } = useTranslation();
	const { formats } = useDate();

	const [activeFilter, setActiveFilters] = useState<DispositionTableFilterType>(
		initialActiveFilters.filters,
	);
	const [createdByList, setCreatedByList] = useState<IUser[]>(
		initialActiveFilters.createdBy,
	);
	const [approverList, setApproverList] = useState<IUser[]>(
		initialActiveFilters.approvers,
	);
	const [createdAt, setCreatedAt] = useState<[IDate, IDate] | [null, null]>(
		initialActiveFilters.createdAt,
	);
	const [daysLeft, setDaysLeft] = useState<
		[number, number] | [undefined, undefined]
	>(initialActiveFilters.daysLeft);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		onSave({
			filters: activeFilter,
			createdBy: createdByList,
			approvers: approverList,
			createdAt,
			daysLeft,
		});
	};

	const handleResetForm = () => {
		setActiveFilters({});
		setCreatedByList([]);
		setApproverList([]);
		setCreatedAt([null, null]);
		setDaysLeft([undefined, undefined]);
	};

	const handleAddCreatedBy = (user: IUser) => {
		setCreatedByList((prevState) => update(prevState, { $push: [user] }));
	};

	const handleDeleteCreatedBy = (deletedUser: IUser) => {
		setCreatedByList((prevState) => {
			const idx = prevState.findIndex((user) => user.id === deletedUser.id);

			return update(prevState, { $splice: [[idx, 1]] });
		});
	};

	const handleAddApprover = (user: IUser) => {
		setApproverList((prevState) => update(prevState, { $push: [user] }));
	};

	const handleDeleteApprover = (deletedUser: IUser) => {
		setApproverList((prevState) => {
			const idx = prevState.findIndex((user) => user.id === deletedUser.id);

			return update(prevState, { $splice: [[idx, 1]] });
		});
	};

	const handleChangeDaysLeft = (type: 0 | 1) => (value: number) => {
		console.log(value);
		setDaysLeft((prevValue) => update(prevValue, { [type]: { $set: value } }));
	};

	const handleChangeCreatedAt = (type: 0 | 1) => (date: IDate) => {
		if (
			type === 0 &&
			createdAt[1] &&
			date.date.getTime() > createdAt[1].date.getTime()
		) {
			setCreatedAt((prevValue) => update(prevValue, { 1: { $set: null } }));
		}

		if (
			type === 1 &&
			createdAt[0] &&
			date.date.getTime() < createdAt[0].date.getTime()
		) {
			setCreatedAt((prevValue) => update(prevValue, { 0: { $set: null } }));
		}

		setCreatedAt((prevValue) => update(prevValue, { [type]: { $set: date } }));
	};

	const handleSelectFilter = (
		group: FindEntityResponseFilterGroup,
		field: FindEntityResponseFilterGroupField,
	) => {
		const fieldName = `${group.field}:${field.value}`;

		setActiveFilters((prevValue) => {
			const updatedList = { ...prevValue };

			if (updatedList[fieldName]) {
				delete updatedList[fieldName];
				return updatedList;
			}
			if (!updatedList[fieldName]) {
				updatedList[fieldName] = true;
				return updatedList;
			}

			return updatedList;
		});
	};

	const isActiveFilter = (
		group: FindEntityResponseFilterGroup,
		field: FindEntityResponseFilterGroupField,
	) => {
		const fieldName = `${group.field}:${field.value}`;

		return !!activeFilter[fieldName];
	};

	const getFilterFieldLabel = (
		field: FindEntityResponseFilterGroupField,
		lang: LanguageTypes,
	) => {
		const fieldName = field.multilingual[lang] || field.name;

		if (isDate(fieldName)) {
			const formattedDate = formats.baseWithTime(fieldName);

			return formattedDate;
		}

		return fieldName;
	};

	const selectedCreatedByIds = useMemo(
		() => createdByList.map(({ id }) => id),
		[createdByList],
	);
	const selectedApproverIds = useMemo(
		() => approverList.map(({ id }) => id),
		[approverList],
	);

	return (
		<Form onSubmit={handleSubmit}>
			<Row>
				{externalFilters?.map((group) => (
					<Column key={group.field}>
						<Text variant="body_1_primary_semibold">
							{group.multilingual[currentLang] || group.name}:
						</Text>
						<ColumnFilters>
							{group.values.map((field, idx) => (
								<FilterOption
									key={field.name + idx}
									label={getFilterFieldLabel(field, currentLang)}
									filterCount={field.count}
									checked={isActiveFilter(group, field)}
									onChange={() => handleSelectFilter(group, field)}
								/>
							))}
						</ColumnFilters>
					</Column>
				))}
			</Row>
			<Row>
				<Column>
					<ColumnTitle variant="body_1_primary_semibold">
						{t('disposition.filter_form.fields.created_by')}
					</ColumnTitle>
					<UserSearchInput
						selectedUsers={selectedCreatedByIds}
						onSelectUser={handleAddCreatedBy}
					/>
					<UserLineList>
						{createdByList.map((user) => (
							<UserLine
								key={user.id}
								userId={user.id}
								username={user.display}
								profileImage={user.profileImage}
								onClose={() => handleDeleteCreatedBy(user)}
							/>
						))}
					</UserLineList>
				</Column>
			</Row>
			<Row>
				<Column>
					<ColumnTitle variant="body_1_primary_semibold">
						{t('disposition.filter_form.fields.approvers')}
					</ColumnTitle>
					<UserSearchInput
						selectedUsers={selectedApproverIds}
						onSelectUser={handleAddApprover}
					/>
					<UserLineList>
						{approverList.map((user) => (
							<UserLine
								key={user.id}
								userId={user.id}
								username={user.display}
								profileImage={user.profileImage}
								onClose={() => handleDeleteApprover(user)}
							/>
						))}
					</UserLineList>
				</Column>
			</Row>

			<Section>
				<ColumnTitle variant="body_1_primary_semibold">
					{t('disposition.filter_form.fields.date_added')}
				</ColumnTitle>
				<FormGroup>
					<FormField>
						<InputDate
							label={t('disposition.filter_form.fields.from')}
							date={createdAt[0]?.date}
							selectDateFrom={FROM_DATE_START_POINT}
							selectDateTo={createdAt[1]?.date}
							onChange={handleChangeCreatedAt(0)}
						/>
						<InputDate
							label={t('disposition.filter_form.fields.to')}
							date={createdAt[1]?.date}
							selectDateFrom={createdAt[0]?.date}
							onChange={handleChangeCreatedAt(1)}
						/>
					</FormField>
				</FormGroup>
			</Section>

			<Section>
				<ColumnTitle variant="body_1_primary_semibold">
					{t('disposition.filter_form.fields.days_left')}
				</ColumnTitle>
				<FormGroup>
					<FormField>
						<NumberField
							label={t('disposition.filter_form.fields.from')}
							value={daysLeft[0]}
							onChange={handleChangeDaysLeft(0)}
							minValue={0}
							maxValue={daysLeft[1] || undefined}
						/>
						<NumberField
							label={t('disposition.filter_form.fields.to')}
							value={daysLeft[1]}
							onChange={handleChangeDaysLeft(1)}
							minValue={daysLeft[0] || 0}
						/>
					</FormField>
				</FormGroup>
			</Section>
			<ModalFooter>
				<ButtonList>
					<Button
						icon={ICON_COLLECTION.chevron_right}
						label={t('disposition.filter_form.actions.submit')}
					/>
					<Button
						type="button"
						variant="primary_outlined"
						label={t('disposition.filter_form.actions.cancel')}
						onClick={onClose}
					/>
				</ButtonList>
				<Button
					type="button"
					variant="primary_ghost"
					label={t('disposition.filter_form.actions.reset')}
					ml="auto"
					onClick={handleResetForm}
				/>
			</ModalFooter>
		</Form>
	);
};
