import React, { useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { sortBy } from 'lodash';
import {
	SearchSettingsBar,
	SearchSettingsOption,
} from 'modules/settings/components/search-settings';
import { BaseHttpServices } from 'shared/services/base-http-services';
import styled from 'styled-components';

import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import { ResponseError } from 'app/api/error-entity';

import { ICoreConfig } from 'shared/types/core-config';

import { CORE_CONFIG_LIST_QUERY_KEYS } from 'shared/constants/query-keys';
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

const PAGE_NAME = 'rda';

const RdaSettingsPage: React.FC = () => {
	const navigate = useNavigate();
	const { group } = useParams();
	const { t, currentLang } = useTranslation();
	useTitle(t('rda_settings.title'));
	const date = useDate();
	const stickyElement = useStickyElement();
	const caching: any[] = [];

	const {
		data: configList = [],
		isLoading: isConfigListLoading,
		isSuccess: isConfigListSuccess,
	} = useQuery(CORE_CONFIG_LIST_QUERY_KEYS.config_list_settings_page, {
		queryFn: async () => {
			let configs = await CoreConfigApi.getConfigList();
			const ApiService = new BaseHttpServices();
			configs = configs.filter(
				(element) => element.property.substring(0, 3) === 'rda',
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

	const sortedFields = useMemo(() => {
		const fields: Record<string, Record<string, ICoreConfig[]>> = {};

		configList.forEach((config) => {
			const group = config.group;
			const [, section] = config.property.split('.');

			if (!(group in fields)) {
				fields[group] = {};
			}
			if (!(section in fields[group])) {
				fields[group][section] = [];
			}

			fields[group][section].push(config);
		});

		return fields;
	}, [configList]);

	const SETTING_LINKS: SettingNavLink[] = useMemo(() => {
		if (!sortedFields[PAGE_NAME]) return [];

		const options: SettingNavLink[] = [];
		for (const key in sortedFields[PAGE_NAME]) {
			options.push({
				to: SETTINGS_ROUTES.RDA_SETTING.generate(key),
				key: key,
				value: key,
				label:
					t(`setting_fields`, { returnObjects: true })[`${PAGE_NAME}.${key}`] ||
					`${PAGE_NAME}.${key}`,
			});
		}
		const links: any[] = sortBy(options, ['label']);
		const index = links.findIndex((element) => element.key === 'preference');
		if (index && index !== -1) {
			links.splice(index, 1);
		}
		return links;
	}, [currentLang, sortedFields]);

	useEffect(() => {
		if (group || !SETTING_LINKS[0]) return;

		navigate(SETTING_LINKS[0].to, { replace: true });
	}, [group, SETTING_LINKS]);

	const SETTING_OPTIONS: SearchSettingsOption[] = useMemo(() => {
		if (!sortedFields[PAGE_NAME]) return [];

		const options: SearchSettingsOption[] = [];
		for (const groupName in sortedFields[PAGE_NAME]) {
			const fields = sortedFields[PAGE_NAME][groupName];

			for (const field of fields) {
				options.push({
					key: field.property,
					link: SETTINGS_ROUTES.RDA_SETTING.generate(groupName),
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

	const isPageLoading = isConfigListLoading;
	const isPageSuccess = isConfigListSuccess;

	return (
		<Page>
			<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
				<Breadcrumb breadcrumb={t('breadcrumbs.rda_settings')} isLast />
			</BreadcrumbPortal>

			<PageHeader>
				<PageTitle subHeader={date.formats.pageHead()}>
					{t('rda_settings.title')}
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
							{isPageSuccess && group && (
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

export default RdaSettingsPage;
