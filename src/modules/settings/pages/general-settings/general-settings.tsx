import React, { useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
	SearchSettingsBar,
	SearchSettingsOption,
} from 'modules/settings/components/search-settings';
import { BaseHttpServices } from 'shared/services/base-http-services';
import styled from 'styled-components';

import { AuthProviderApi } from 'app/api/auth-provider-api/auth-provider-api';
import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import { ResponseError } from 'app/api/error-entity';

import { ICoreConfig } from 'shared/types/core-config';

import {
	AUTH_PROVIDES_QUERY_KEYS,
	CORE_CONFIG_LIST_QUERY_KEYS,
} from 'shared/constants/query-keys';
import { SETTINGS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useStickyElement } from 'shared/hooks/use-sticky-element';
import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';

import { Breadcrumb } from 'shared/components/breadcrumbs/breadcrumb';
import { BreadcrumbPortal } from 'shared/components/breadcrumbs/breadcrumb-portal';
import { BREADCRUMB_CONTAINER } from 'shared/components/breadcrumbs/breadcrumbs';
import { Spinner } from 'shared/components/spinner/spinner';
import { Title } from 'shared/components/title/title';

import { SettingNavLink, SettingsMenu } from '../../components/settings-menu';

const Page = styled.div``;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const PageTitle = styled(Title)`
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
`;

const PageContent = styled.div`
	display: flex;
	margin-top: 1.5rem;
`;

const PageContentLeft = styled.div`
	width: 18.4%;
	flex-shrink: 0;
`;

const PageContentRight = styled.div`
	margin-left: 1.5rem;
	flex-grow: 1;
`;

const PAGE_NAME = 'core';

const CoreSettingsPage: React.FC = () => {
	const navigate = useNavigate();
	const { group } = useParams();
	const location = useLocation();
	const { t, currentLang } = useTranslation();
	useTitle(t('general_settings.title'));
	const date = useDate();
	const stickyElement = useStickyElement();
	const caching: any[] = [];

	const {
		data: configList = [],
		isLoading: isConfigListLoading,
		isSuccess: isConfigListSuccess,
	} = useQuery({
		queryKey: CORE_CONFIG_LIST_QUERY_KEYS.config_list_settings_page,
		queryFn: async () => {
			let configs = await CoreConfigApi.getConfigList();
			const ApiService = new BaseHttpServices();
			configs = configs.filter(
				(element) => element.property.substring(0, 4) === 'core',
			);

			for (const field of configs) {
				if (!field.presentation.values?.api) continue;
				const findCach = caching.find(
					(element) => element.api === field.presentation.values.api,
				);
				if (findCach) {
					field.presentation.values.values = findCach.values;
				} else {
					const payload = await ApiService.get(field.presentation.values.api);
					if (!payload.data.ok) {
						throw new ResponseError(payload, payload.data.message);
						break;
					}
					caching.push({
						api: field.presentation.values.api,
						values: payload.data.data,
					});

					field.presentation.values.values = payload.data.data;
				}
			}

			return configs;
		},
	});

	const {
		data: providers = [],
		isLoading: isProvidersLoading,
		isSuccess: isProvidersSuccess,
	} = useQuery(
		AUTH_PROVIDES_QUERY_KEYS.auth_provider_list,
		AuthProviderApi.getProviderList,
	);

	const sortedFields = useMemo(() => {
		const fields: Record<string, Record<string, ICoreConfig[]>> = {};

		configList.forEach((config) => {
			const group = config.group;
			const [, section] = config.property.split('.');

			if (!(group in fields)) {
				fields[group] = {};
			}

			if (group === PAGE_NAME) {
				if (!('general' in fields[group])) {
					fields[group]['general'] = [];
				}

				if (section !== 'rda') {
					fields[group]['general'].push(config);
				} else {
					if (!('rda' in fields[group])) {
						fields[group]['rda'] = [];
					}
					fields[group]['rda'].push(config);
				}

				return;
			} else {
				if (!(section in fields[group])) {
					fields[group][section] = [];
				}
			}

			fields[group][section].push(config);
		});

		if (fields && fields.core && fields.core.general) {
			const maximum = fields.core.general.findIndex(
				(element: ICoreConfig) =>
					element.property === 'core.password.length.maximum',
			);
			const minimum = fields.core.general.findIndex(
				(element: ICoreConfig) =>
					element.property === 'core.password.length.minimum',
			);
			if (maximum && minimum) {
				fields.core.general[maximum].presentation.validation.range!.min =
					Number(fields.core.general[minimum].value);
				fields.core.general[minimum].presentation.validation.range!.max =
					Number(fields.core.general[maximum].value);
			}
		}

		return fields;
	}, [configList]);

	const SETTING_LINKS: SettingNavLink[] = useMemo(() => {
		if (!sortedFields[PAGE_NAME]) return [];

		const options: SettingNavLink[] = [
			{
				to: SETTINGS_ROUTES.CORE_AUTH_PROVIDER.path,
				key: 'provider',
				value: '',
				label: t('general_settings.auth_provider.title'),
			},
			{
				to: SETTINGS_ROUTES.CORE_DATA_SYNC_PROVIDERS.path,
				key: 'provider',
				value: '',
				label: <>{t('general_settings.data_sync_providers.title')}</>,
			},
		];

		for (const key in sortedFields[PAGE_NAME]) {
			options.push({
				to: SETTINGS_ROUTES.CORE_SETTING.generate(key),
				key: key,
				value: key,
				label:
					t(`setting_fields`, { returnObjects: true })[`${PAGE_NAME}.${key}`] ||
					`${PAGE_NAME}.${key}`,
			});
		}

		return options;
	}, [currentLang, sortedFields, providers]);

	useEffect(() => {
		if (
			group ||
			location.pathname === SETTINGS_ROUTES.CORE_AUTH_PROVIDER.path ||
			location.pathname === SETTINGS_ROUTES.CORE_DATA_SYNC_PROVIDERS.path ||
			!SETTING_LINKS[0]
		)
			return;

		navigate(SETTING_LINKS[0].to, { replace: true });
	}, [group, SETTING_LINKS, location.pathname]);

	const SETTING_OPTIONS: SearchSettingsOption[] = useMemo(() => {
		if (!sortedFields[PAGE_NAME]) return [];

		const options: SearchSettingsOption[] = [
			{
				key: SETTINGS_ROUTES.CORE_AUTH_PROVIDER.path,
				link: SETTINGS_ROUTES.CORE_AUTH_PROVIDER.path,
				anchor: 'auth-providers-table',
				fieldName: t('general_settings.auth_provider.title'),
				pageName: t('general_settings.auth_provider.title'),
			},
			{
				key: SETTINGS_ROUTES.CORE_DATA_SYNC_PROVIDERS.path,
				link: SETTINGS_ROUTES.CORE_DATA_SYNC_PROVIDERS.path,
				anchor: 'data-sync-providers-table',
				fieldName: t('general_settings.data_sync_providers.title'),
				pageName: t('general_settings.data_sync_providers.title'),
			},
		];

		for (const groupName in sortedFields[PAGE_NAME]) {
			const fields = sortedFields[PAGE_NAME][groupName];

			for (const field of fields) {
				options.push({
					key: field.property,
					link: SETTINGS_ROUTES.CORE_SETTING.generate(groupName),
					anchor: field.property,
					fieldName:
						t(`setting_fields`, { returnObjects: true })[field.property] ||
						field.property,
					pageName:
						t(`setting_fields`, { returnObjects: true })[
							`${PAGE_NAME}.${groupName}`
						] || `${PAGE_NAME}.${groupName}`,
				});
			}
		}

		return options;
	}, [currentLang, sortedFields]);

	const isPageLoading = isConfigListLoading || isProvidersLoading;
	const isPageSuccess = isConfigListSuccess && isProvidersSuccess;

	const isStaticPage =
		location.pathname === SETTINGS_ROUTES.CORE_AUTH_PROVIDER.path ||
		location.pathname === SETTINGS_ROUTES.CORE_DATA_SYNC_PROVIDERS.path;

	return (
		<Page>
			<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
				<Breadcrumb breadcrumb={t('breadcrumbs.core_settings')} isLast />
			</BreadcrumbPortal>

			<PageHeader>
				<PageTitle subHeader={date.formats.pageHead()}>
					{t('general_settings.title')}
				</PageTitle>
			</PageHeader>
			<PageContent>
				{isPageLoading && <Spinner />}

				{!isPageLoading && (
					<>
						<PageContentLeft
							ref={(ref) => stickyElement.setContainerElement(ref)}
						>
							<div ref={(ref) => stickyElement.setElement(ref)}>
								<SettingsMenu links={SETTING_LINKS}>
									<SearchSettingsBar options={SETTING_OPTIONS} />
								</SettingsMenu>
							</div>
						</PageContentLeft>
						<PageContentRight>
							{isPageSuccess && isStaticPage && <Outlet />}
							{isPageSuccess && group && !isStaticPage && (
								<Outlet
									context={{
										title: t(`setting_fields`, { returnObjects: true })[
											`${PAGE_NAME}.${group}`
										],
										fields: sortedFields[PAGE_NAME][group],
									}}
								/>
							)}
						</PageContentRight>
					</>
				)}
			</PageContent>
		</Page>
	);
};

export default CoreSettingsPage;
