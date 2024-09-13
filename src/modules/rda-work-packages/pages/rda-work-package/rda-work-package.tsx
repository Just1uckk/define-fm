import React from 'react';
import { useQuery } from 'react-query';
import { useLocation, useParams } from 'react-router-dom';
import { RdaWorkPackagePendingPage } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-pending/rda-work-package-pending';
import { RdaWorkPackageReportPage } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/rda-report';

import { DispositionsApi } from 'app/api/dispositions-api/dispositions-api';

import { DISPOSITION_WORKFLOW_STATES } from 'shared/constants/constans';
import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';

import { NotFoundPage } from 'shared/components/404/not-found-page';
import { Breadcrumb } from 'shared/components/breadcrumbs/breadcrumb';
import { BreadcrumbPortal } from 'shared/components/breadcrumbs/breadcrumb-portal';
import { BREADCRUMB_CONTAINER } from 'shared/components/breadcrumbs/breadcrumbs';
import { Spinner } from 'shared/components/spinner/spinner';

const RdaWorkPackagePage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const location = useLocation();
	const workPackageId = Number(id);
	const { t, currentLang } = useTranslation();

	const {
		data: workPackage,
		isLoading: isDispositionLoading,
		isError: isWorkPackageError,
	} = useQuery({
		queryKey: DISPOSITIONS_QUERY_KEYS.disposition(workPackageId),
		queryFn: () => DispositionsApi.getDisposition({ id: workPackageId }),
		enabled: !!workPackageId,
	});

	useTitle(workPackage?.multilingual?.name[currentLang] ?? workPackage?.name);

	const breadcrumbs = (
		<BreadcrumbPortal container={BREADCRUMB_CONTAINER}>
			<Breadcrumb
				breadcrumb={t('breadcrumbs.rda_work_packages')}
				path={
					location.state?.from ||
					DISPOSITIONS_ROUTES.RDA_WORK_PACKAGES_OVERVIEW.path
				}
				isLast
			/>
		</BreadcrumbPortal>
	);

	if (isWorkPackageError) {
		return <NotFoundPage />;
	}

	if (isDispositionLoading || !workPackage) {
		return (
			<>
				{breadcrumbs}
				<Spinner />
			</>
		);
	}

	if (workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.PENDING) {
		return (
			<>
				{breadcrumbs}
				<RdaWorkPackagePendingPage />
			</>
		);
	}

	if (
		[
			DISPOSITION_WORKFLOW_STATES.INITIATED,
			DISPOSITION_WORKFLOW_STATES.READY_TO_COMPLETE,
			DISPOSITION_WORKFLOW_STATES.ARCHIVE,
		].includes(workPackage.workflowStatus)
	) {
		return (
			<>
				{breadcrumbs}
				<RdaWorkPackageReportPage />
			</>
		);
	}

	return null;
};

export default RdaWorkPackagePage;
