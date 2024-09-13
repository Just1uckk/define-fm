import React from 'react';
import { useAbilityContext } from 'casl';
import { RouteGuardActions, RouteGuardEntities } from 'casl/ability';

import { DASHBOARD_ROUTES } from 'shared/constants/routes';

import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';

import { Breadcrumb } from 'shared/components/breadcrumbs/breadcrumb';
import { BreadcrumbPortal } from 'shared/components/breadcrumbs/breadcrumb-portal';
import { BREADCRUMB_CONTAINER } from 'shared/components/breadcrumbs/breadcrumbs';

import { PersonalDashboardPage } from './personal-dashboard/personal-dashboard';
import { RdaDashboardPage } from './rda-dashboard/rda-dashboard';

const DashboardPage: React.FC = () => {
	const { t } = useTranslation();
	useTitle(t('dashboard.title'));
	const ability = useAbilityContext();

	return (
		<>
			<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
				<Breadcrumb
					breadcrumb={t('breadcrumbs.dashboard')}
					path={DASHBOARD_ROUTES.MAIN.path}
					isLast
				/>
			</BreadcrumbPortal>
			{ability.can(RouteGuardActions.read, RouteGuardEntities.Dashboard) && (
				<RdaDashboardPage />
			)}
			{ability.can(
				RouteGuardActions.read,
				RouteGuardEntities.PersonalDashboard,
			) && <PersonalDashboardPage />}
		</>
	);
};

export default DashboardPage;
