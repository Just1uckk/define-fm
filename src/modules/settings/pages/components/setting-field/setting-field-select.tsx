import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useFilter } from 'react-aria';
import { Item } from 'react-stately';
import { debounce } from 'lodash';
import { ApproversSection } from 'modules/rda-work-packages/components/select-approvers-form/approvers-section';
import { IApproverShort } from 'modules/rda-work-packages/components/select-approvers-form/select-approvers';
import { SettingFieldRef } from 'modules/settings/pages/components/setting-field/setting-field';
import {
	validateField as validationFieldHelper,
	validationStrategies,
} from 'modules/settings/pages/components/setting-field/validation-strategy';
import { uuid } from 'shared/utils/uuid';

import { ICoreConfig } from 'shared/types/core-config';

import { APPROVER_STATES } from 'shared/constants/constans';

import { useTranslation } from 'shared/hooks/use-translation';

import { GroupBadge } from 'shared/components/group-badge/group-badge';
import { GroupBadgeList } from 'shared/components/group-badge/group-badge-list';
import { Option } from 'shared/components/select/select';
import { SelectComboBox } from 'shared/components/select-combobox/select-combobox';

interface SettingFieldSelectProps {
	label: string;
	field: ICoreConfig;
}

const SettingFieldSelectComponent: React.ForwardRefRenderFunction<
	SettingFieldRef,
	SettingFieldSelectProps
> = ({ field, label }, ref) => {
	const { t, multilingualT } = useTranslation();
	const { startsWith } = useFilter({ sensitivity: 'base', usage: 'search' });

	const [value, setValue] = useState<Option[]>(
		getInitialValue(field, getSelectOptions(field)),
	);
	const [filteredList, setFilteredList] = useState<Option[]>([]);
	const [usersList, setUsersList] = useState<IApproverShort[]>([]);
	const [error, setError] = useState('');
	const [search, setSearch] = useState(() => {
		if (field.presentation.multivalue) return '';

		return multilingualT({
			field: 'label',
			translations: value[0]?.multilingual,
			fallbackValue: value[0]?.label.toString() ?? '',
		}) as string;
	});
	const isDirty = useRef(false);

	useImperativeHandle(ref, () => {
		return {
			id: field.id,
			name: field.property,
			isDirty: isDirty.current,
			setIsDirty: (flag) => (isDirty.current = flag),
			validate: validateField,
			getValue: getValue,
			resetValue: resetValue,
		};
	});

	const options = useMemo(() => {
		return getSelectOptions(field, value);
	}, [field, value]);

	useEffect(() => {
		setFilteredList(options);
	}, [options]);

	useEffect(() => {
		if (field.property.includes('rda.email.users')) {
			const userArray = searchUsersById(field.value);
			setUsersList(userArray);
		}
	}, []);

	function getSelectOptions(field: ICoreConfig, value?: Option[]) {
		let options =
			field.presentation.values.values?.map((option, idx) => ({
				key: option?.[field.presentation.values.value] ?? idx,
				label: option?.[field.presentation.values.label],
				value: String(option?.[field.presentation.values.value]),
			})) ?? [];

		if (value?.length && field.presentation.multivalue) {
			options = options.filter((option) => {
				const selectedOption = value.find(
					(selectedOption) => selectedOption.value === option.value,
				);

				return !selectedOption;
			});
		}

		return options;
	}

	function getValue() {
		return value
			.map((option) => option?.value ?? '')
			.join(field.presentation.multivalue?.delimiter);
	}

	function resetValue() {
		error && setError('');
		const value = getInitialValue(field, options);

		setValue(value);
	}

	function validateField(options: Option[] = value) {
		error && setError('');
		const result = {
			isValid: true,
			error: '',
		};
		const validationResult = validationFieldHelper(options, {
			required: field.presentation.validation
				? field.presentation.validation.required
				: false,
		});
		if (!validationResult.isValid) {
			setError(validationResult.error);
			return validationResult;
		}
		if (
			field.presentation.multivalue &&
			'max' in field.presentation.multivalue
		) {
			result.isValid = validationStrategies.max_value.validate(
				options,
				field.presentation.multivalue.max,
			);
			result.error = result.isValid
				? ''
				: validationStrategies.max_value.error(
						field.presentation.multivalue.max,
				  );
			result.error && setError(result.error);
			if (!result.isValid) return result;
		}
		if (
			field.presentation.multivalue &&
			'min' in field.presentation.multivalue
		) {
			result.isValid = validationStrategies.min_value.validate(
				options,
				field.presentation.multivalue.min,
			);
			result.error = result.isValid
				? ''
				: validationStrategies.min_value.error(
						field.presentation.multivalue.min,
				  );
			result.error && setError(result.error);

			if (!result.isValid) return result;
		}

		return result;
	}

	function getInitialValue(field: ICoreConfig, options: Option[]) {
		if (!field.presentation.multivalue) {
			const value = options.find((option) => option.value === field.value);

			return value ? [value] : [];
		}

		const values: Option[] = [];
		const parsedValues = field.value.split(
			field.presentation.multivalue.delimiter,
		);

		parsedValues.forEach((value) => {
			const option = options.find((option) => option.value === value);

			if (option) {
				values.push(option);
			} else {
				values.push({
					key: uuid(),
					value: value,
					label: value,
				});
			}
		});

		return values;
	}

	const handleChangeValue = (option: Option | null) => {
		if (option && field.presentation.multivalue) {
			isDirty.current = true;

			setValue((prevValue) => {
				const value = [...prevValue, option];
				validateField(value);
				return value;
			});
		}

		if (!field.presentation.multivalue) {
			isDirty.current = true;
			const newValue = option ? [option] : [];
			setValue(newValue);
			validateField(newValue);
		}
		console.log('3');
		setFilteredList(options);

		!field.presentation.multivalue &&
			option &&
			setSearch(
				multilingualT({
					field: 'label',
					translations: option.multilingual,
					fallbackValue: option.label,
				}) as string,
			);
	};

	const onDeleteSelectedOption = (option: Option) => {
		isDirty.current = true;

		setValue((prevValue) => {
			const newValue = prevValue.filter(
				(oldOption) => oldOption.key !== option.key,
			);
			validateField(newValue);

			return newValue;
		});
	};

	const debouncedFiltering = useCallback(
		debounce((search) => {
			const filteredList = options.filter((option) => {
				return startsWith(option.label, search);
			});

			setFilteredList(filteredList);
		}, 300),
		[options],
	);

	const handleSearch = (value: string) => {
		setSearch(value);
		if (value.trim()) {
			debouncedFiltering(search);
		} else {
			setFilteredList(options);
		}
	};

	const handleClearValue = () => {
		handleChangeValue(null);
		setSearch('');
		setFilteredList(options);
	};

	const searchUsersById = (stringValue: string): IApproverShort[] => {
		if (stringValue && !stringValue.includes('@')) {
			const arrayWithId = stringValue.split(';').map(Number);
			if (arrayWithId.length && field.presentation.values.values?.length) {
				const filteredArray = field.presentation.values.values.filter(
					(item: any) => arrayWithId.includes(item.id),
				);
				if (filteredArray.length) {
					const rightArray: IApproverShort[] = filteredArray.map(
						(user: any, index) => ({
							userId: user.id,
							displayName: user.display,
							userProfileImage: user.profileImage,
							conditionalApprover: 0,
							state: APPROVER_STATES.WAITING,
							orderBy: index + 1,
						}),
					);
					return rightArray;
				}
				return [];
			}
			return [];
		} else if (stringValue && stringValue.includes('@')) {
			const arrayWithEmail = stringValue.split(';');
			if (arrayWithEmail.length && field.presentation.values.values?.length) {
				const filteredArray = field.presentation.values.values.filter(
					(item: any) => arrayWithEmail.includes(item.email),
				);
				if (filteredArray.length) {
					const rightArray: IApproverShort[] = filteredArray.map(
						(user: any, index) => ({
							userId: user.id,
							displayName: user.display,
							userProfileImage: user.profileImage,
							conditionalApprover: 0,
							state: APPROVER_STATES.WAITING,
							orderBy: index + 1,
						}),
					);
					return rightArray;
				}
				return [];
			}
			return [];
		}
		return [];
	};

	return (
		<>
			{!field.property.includes('rda.email.users') ? (
				<SelectComboBox<Option>
					items={filteredList}
					selectedKey={
						field.presentation.multivalue ? null : value[0]?.value ?? null
					}
					inputValue={search}
					label={label}
					errorMessage={error ? t(error) : error}
					clearable={
						!field.presentation.multivalue &&
						!field.presentation.validation?.required
					}
					fulfilled
					onInputChange={handleSearch}
					onSelectItem={handleChangeValue}
					onClearValue={handleClearValue}
				>
					{(option: Option) => {
						const label = multilingualT({
							field: 'label',
							translations: option.multilingual,
							fallbackValue: option.label,
						});

						return (
							<Item key={option.value} textValue={label as string}>
								{label}
							</Item>
						);
					}}
				</SelectComboBox>
			) : (
				<ApproversSection
					label={label}
					dragDisabled
					errorMessage={error ? t(error) : error}
					droppableId="approvers"
					reassign={false}
					selectedApproverIds={usersList.map((user) => user.userId)}
					selectedApprovers={usersList}
					onSelectApprover={(user) => {
						handleChangeValue({
							key: user[field.presentation.values.value],
							label: user.email,
							value: `${user[field.presentation.values.value]}`,
						});
						setUsersList([
							...usersList,
							{
								userId: user.id,
								displayName: user.display,
								userProfileImage: user.profileImage,
								conditionalApprover: 0,
								state: APPROVER_STATES.WAITING,
								orderBy: usersList.length + 1,
							},
						]);
					}}
					onDeleteApprover={(id: number) => {
						const user: any = field.presentation.values.values?.find(
							(user: any) => user.id === id,
						);
						if (user) {
							onDeleteSelectedOption({
								key: user[field.presentation.values.value],
								label: user.email,
								value: `${user[field.presentation.values.value]}`,
							});
							const newUserList = usersList.filter(
								(userList) => userList.userId !== user.id,
							);
							setUsersList(newUserList);
						}
					}}
					onDragEnd={(user) => {
						console.log(user);
					}}
				/>
			)}

			{field.presentation.multivalue &&
				!field.property.includes('rda.email.users') && (
					<GroupBadgeList>
						{value.map((option, index) => (
							<GroupBadge
								key={option.key + '-' + index}
								label={String(option.label)}
								onClose={() => onDeleteSelectedOption(option)}
							/>
						))}
					</GroupBadgeList>
				)}
		</>
	);
};

export const SettingFieldSelect = React.forwardRef(SettingFieldSelectComponent);
