import React, {
	forwardRef,
	useImperativeHandle,
	useMemo,
	useState,
} from 'react';
import { FormState, useForm, UseFormGetValues } from 'react-hook-form';
import { Item } from 'react-stately';
import { yupResolver } from '@hookform/resolvers/yup';
import { t } from 'i18next';
import * as yup from 'yup';

import { DefaultSettingsDto } from 'app/api/user-api/user-api-default';

import { ICoreLang } from 'shared/types/core-config';
import { IUser } from 'shared/types/users';

import { APP_ROLES, THEME_TYPES } from 'shared/constants/constans';

import { useManageSiteLanguage } from 'shared/hooks/use-manage-site-language';
import { useTranslation } from 'shared/hooks/use-translation';

import { ModalFooter } from 'shared/components/modal/modal-footer';
import { FormField } from 'shared/components/modal-form/form-field';
import { FormGroup } from 'shared/components/modal-form/form-group';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageForm } from 'shared/components/modal-form/page-form';
import { Option, Select } from 'shared/components/select/select';

export enum DEFAULT_SETTINGS_LIST {
	THEME = 'rda.preference.theme',
	ITEMS_PER_PAGE = 'rda.preference.itemsperpage',
	HOME_PAGE = 'rda.preference.homepage',
	DEFAULT_TAB = 'rda.preference.wsdefaulttab',
	PREFERRED_VIEW = 'rda.preference.preferredview',
}

const TABLE_LENGTH_OPTIONS: Option[] = [
	{ key: '25', label: '25', value: '25' },
	{ key: '50', label: '50', value: '50' },
	{ key: '100', label: '100', value: '100' },
	{ key: '250', label: '250', value: '250' },
];

const TABLE_NO_PENDING_OPTIONS: Option[] = [
	{ key: '1', label: 'Pending Tab', value: 'pending' },
	{ key: '2', label: 'Approved Tab', value: 'approved' },
	{ key: '3', label: 'Rejected Tab', value: 'rejected' },
];

export const TABLE_PREFERRED_VIEW: Option[] = [
	{ key: '1', label: 'Table View', value: 'row' },
	{ key: '2', label: 'Card View', value: 'card' },
];

export const TABLE_THEME: Option[] = [
	{
		key: '1',
		label: t(`app_theme.${THEME_TYPES.DARK}`),
		value: THEME_TYPES.DARK,
	},
	{
		key: '2',
		label: t(`app_theme.${THEME_TYPES.SYSTEM}`),
		value: THEME_TYPES.SYSTEM,
	},
	{
		key: '3',
		label: t(`app_theme.${THEME_TYPES.LIGHT}`),
		value: THEME_TYPES.LIGHT,
	},
];

export const findDefaultOption = (
	settings: DefaultSettingsDto[],
	defaultOption: string,
) => {
	const option = settings.find((element) => element.property === defaultOption);
	return option;
};

const schema = yup
	.object({
		langCode: yup.string().required('validation_errors.field_is_required'),
		itemsPerPage: yup.number(),
		homePage: yup.string(),
		noPendingTab: yup.string(),
		preferredView: yup.string(),
		theme: yup.string(),
	})
	.defined();

export type ProfileDefaultSettingsFormData = yup.InferType<typeof schema>;
const resolver = yupResolver(schema);

export interface EditDefaultSettingsRef {
	formState: FormState<ProfileDefaultSettingsFormData>;
	getValues: UseFormGetValues<ProfileDefaultSettingsFormData>;
}

interface EditDefaultSettingsProps {
	userData: IUser;
	onSubmit: (data: ProfileDefaultSettingsFormData) => void;
	children: React.ReactNode;
	defaultSettings: DefaultSettingsDto[];
	manageAppTheme: any;
}

const EditDefaultSettingsComponent: React.ForwardRefRenderFunction<
	EditDefaultSettingsRef,
	EditDefaultSettingsProps
> = (
	{ userData, onSubmit, children, defaultSettings, manageAppTheme },
	ref,
) => {
	const { t } = useTranslation();
	const { languages, changLanguage } = useManageSiteLanguage();

	const {
		handleSubmit,
		watch,
		setValue,
		formState,
		getValues,
		formState: { errors, dirtyFields },
	} = useForm<ProfileDefaultSettingsFormData>({
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		resolver: resolver,
		defaultValues: {
			langCode: userData.langCode,
		},
	});
	const selectedLang = watch('langCode');

	useImperativeHandle(
		ref,
		() => {
			return {
				formState,
				getValues,
			};
		},
		[formState.isDirty],
	);

	const TABLE_HOME_PAGE_OPTIONS: Option[] = useMemo(() => {
		const homePageList = [
			{ key: '1', label: 'Personal Dashboard', value: 'PersonalDashboard' },
			{ key: '5', label: 'My RDA Assignments', value: 'RDA' },
		];
		if (
			userData &&
			userData.roles &&
			userData.roles &&
			userData.roles.includes(APP_ROLES.GLOBAL_ADMIN)
		) {
			homePageList.push(
				{ key: '2', label: 'RDA Dashboard', value: 'Dashboard' },
				{ key: '3', label: 'RDA Admin Workspace', value: 'WorkPackage' },
				{
					key: '4',
					label: 'RDA Disposition Searches',
					value: 'DispositionSearches',
				},
			);
		}
		return homePageList;
	}, [userData]);

	const onSelectLang = (option: ICoreLang | null) => {
		if (!option) return;

		setValue('langCode', option.code, {
			shouldValidate: true,
			shouldDirty: true,
		});

		changLanguage(option.code, true);
	};

	const onSelectNumber = (payload) => {
		if (!payload) return;

		setValue('itemsPerPage', payload.value, {
			shouldValidate: true,
			shouldDirty: true,
		});

		setSelectedNumberOption(payload);
	};

	const onSelectHomePage = (payload) => {
		if (!payload) return;

		setValue('homePage', payload.value, {
			shouldValidate: true,
			shouldDirty: true,
		});

		setSelectedHomePageOption(payload);
	};

	const onSelectPendingOption = (payload) => {
		if (!payload) return;

		setValue('noPendingTab', payload.value, {
			shouldValidate: true,
			shouldDirty: true,
		});

		setSelectedNoPendingOption(payload);
	};

	const onSelectPreferredView = (payload) => {
		if (!payload) return;

		setValue('preferredView', payload.value, {
			shouldValidate: true,
			shouldDirty: true,
		});

		setSelectedPreferredViewState(payload);
	};

	const onSelectTheme = (payload) => {
		if (!payload) return;

		setValue('theme', payload.value, {
			shouldValidate: true,
			shouldDirty: true,
		});

		setSelectedThemeState(payload);
	};

	const selectedLangOption = languages.find(
		(langOption) => langOption.code === selectedLang,
	);

	const [selectedNumberOption, setSelectedNumberOption] = useState<
		Option | undefined
	>(
		TABLE_LENGTH_OPTIONS.find(
			(numberOption) =>
				numberOption.value ===
				findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.ITEMS_PER_PAGE)
					?.value,
		),
	);

	const [selectedHomePageOption, setSelectedHomePageOption] = useState<
		Option | undefined
	>(
		TABLE_HOME_PAGE_OPTIONS.find(
			(homePageOption) =>
				homePageOption.value ===
				findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.HOME_PAGE)
					?.value,
		),
	);

	const [selectedNoPendingOption, setSelectedNoPendingOption] = useState<
		Option | undefined
	>(
		TABLE_NO_PENDING_OPTIONS.find(
			(noPendingOption) =>
				noPendingOption.value ===
				findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.DEFAULT_TAB)
					?.value,
		),
	);

	const [selectedPreferredViewState, setSelectedPreferredViewState] = useState<
		Option | undefined
	>(
		TABLE_PREFERRED_VIEW.find(
			(preferredView) =>
				preferredView.value ===
				findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.PREFERRED_VIEW)
					?.value,
		),
	);

	const [selectedThemeState, setSelectedThemeState] = useState<
		Option | undefined
	>(
		TABLE_THEME.find(
			(theme) =>
				theme.value ===
				findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.THEME)?.value,
		),
	);

	const onSubmitForm = (data: ProfileDefaultSettingsFormData) => {
		const parsedData = {} as ProfileDefaultSettingsFormData;

		for (const fieldName in dirtyFields) {
			parsedData[fieldName] = data[fieldName];
		}

		parsedData['from'] = 'default';

		onSubmit(parsedData);
	};

	return (
		<PageForm onSubmit={handleSubmit(onSubmitForm)}>
			<PageBody>
				<FormGroup>
					<FormField>
						<Select<ICoreLang>
							label={t('profile_settings_form.default_lang')}
							options={languages}
							selectedKey={selectedLangOption?.code}
							onChange={onSelectLang}
							error={
								errors?.langCode?.message
									? t(errors.langCode.message)
									: errors?.langCode?.message
							}
						>
							{(option) => (
								<Item key={option.code} textValue={option.name}>
									{option.name}
								</Item>
							)}
						</Select>
					</FormField>
					<FormField>
						<Select<Option>
							label={t('profile_settings_form.default_number_items_per_page')}
							options={TABLE_LENGTH_OPTIONS}
							selectedKey={selectedNumberOption?.key}
							onChange={onSelectNumber}
						>
							{(option) => (
								<Item key={option.value} textValue={option.label.toString()}>
									{option.label}
								</Item>
							)}
						</Select>
					</FormField>
					<FormField>
						<Select<Option>
							label={t('profile_settings_form.default_homepage')}
							options={TABLE_HOME_PAGE_OPTIONS}
							selectedKey={selectedHomePageOption?.value}
							onChange={onSelectHomePage}
						>
							{(option) => (
								<Item key={option.value} textValue={option.label.toString()}>
									{option.label}
								</Item>
							)}
						</Select>
					</FormField>
					<FormField>
						<Select<Option>
							label={t('profile_settings_form.default_tab_no_pending_items')}
							options={TABLE_NO_PENDING_OPTIONS}
							selectedKey={selectedNoPendingOption?.value}
							onChange={onSelectPendingOption}
						>
							{(option) => (
								<Item key={option.value} textValue={option.label.toString()}>
									{option.label}
								</Item>
							)}
						</Select>
					</FormField>
					<FormField>
						<Select<Option>
							label={t('profile_settings_form.preferred_view')}
							options={TABLE_PREFERRED_VIEW}
							selectedKey={selectedPreferredViewState?.value}
							onChange={onSelectPreferredView}
						>
							{(option) => (
								<Item key={option.value} textValue={option.label.toString()}>
									{option.label}
								</Item>
							)}
						</Select>
					</FormField>
					<FormField>
						<Select<Option>
							label={t('profile_settings_form.theme')}
							options={TABLE_THEME}
							selectedKey={selectedThemeState?.value}
							onChange={onSelectTheme}
						>
							{(option) => (
								<Item key={option.value} textValue={option.label.toString()}>
									{option.label}
								</Item>
							)}
						</Select>
					</FormField>
				</FormGroup>
			</PageBody>
			<ModalFooter justifyContent="space-between">{children}</ModalFooter>
		</PageForm>
	);
};

export const EditDefaultSettings = forwardRef(EditDefaultSettingsComponent);
