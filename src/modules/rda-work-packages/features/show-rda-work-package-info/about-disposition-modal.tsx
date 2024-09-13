import React, { useCallback, useState } from 'react';
import { useQuery } from 'react-query';
import { AboutDispositionSection } from 'modules/rda-work-packages/components/about-disposition-section/about-disposition-section';
import { sortApprovers } from 'modules/rda-work-packages/helpers/sort-approvers';
import { useStateModalManager } from 'shared/context/modal-manager';

import { ApproverApi } from 'app/api/approver-api/approver-api';
import { DispositionsApi } from 'app/api/dispositions-api/dispositions-api';

import { selectUserData } from 'app/store/user/user-selectors';

import { IUser } from 'shared/types/users';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { Modal } from 'shared/components/modal';
import { Spinner } from 'shared/components/spinner/spinner';

export function AboutRdaWorkPackageModal() {
	const { t } = useTranslation();

	const currentUser = selectUserData() as IUser;
	const [rdaId, setRdaId] = useState<number | null>(null);

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.USE_ABOUT_DISPOSITION,
		{
			onBeforeOpen: (id: number) => {
				setRdaId(id);
			},
		},
	);

	const { data: disposition, isLoading: isDispositionLoading } = useQuery(
		DISPOSITIONS_QUERY_KEYS.disposition(rdaId!),
		() => DispositionsApi.getDisposition({ id: Number(rdaId) }),
		{
			enabled: rdaId !== null,
		},
	);
	const { data: approvers, isLoading: isApproversLoading } = useQuery(
		DISPOSITIONS_QUERY_KEYS.approvers(rdaId!),
		() => ApproverApi.getRdaApproversById({ id: Number(rdaId) }),
		{
			enabled: rdaId !== null,
			select: useCallback((approvers) => sortApprovers(approvers), []),
		},
	);

	const isLoading = isDispositionLoading || isApproversLoading;
	const hasData = disposition && approvers && currentUser;

	return (
		<Modal.Root
			fulfilled
			hasClose={false}
			open={modalState.open}
			onClose={modalState.close}
		>
			<Modal.Page>
				{isLoading && <Spinner />}
				{!isLoading && hasData && (
					<AboutDispositionSection
						creatorId={disposition?.createBy}
						creatorName={disposition?.createdByDisplay}
						creatorProfileImage={disposition?.createdByProfileImage}
						disposition={disposition}
						approvers={approvers}
						currentUser={currentUser}
					>
						<Button
							label={t('components.modal.actions.close')}
							onClick={modalState.close}
						/>
					</AboutDispositionSection>
				)}
			</Modal.Page>
		</Modal.Root>
	);
}
