import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { DispositionInfoModal } from 'modules/rda-work-packages/modals/disposition-info-modal';
import { useStateModalManager } from 'shared/context/modal-manager';

import { DispositionsApi } from 'app/api/dispositions-api/dispositions-api';

import { RDA_WORK_PACKAGE_MODAL_NAMES } from 'shared/constants/constans';
import { DISPOSITIONS_QUERY_KEYS } from 'shared/constants/query-keys';

import { Modal } from 'shared/components/modal';
import { Spinner } from 'shared/components/spinner/spinner';

export function WorkPackageInfoModal() {
	const [rdaId, setRdaId] = useState<number | null>(null);

	const modalState = useStateModalManager(
		RDA_WORK_PACKAGE_MODAL_NAMES.DISPOSITION_INFO,
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

	const isLoading = isDispositionLoading;
	const hasData = disposition;

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
					<DispositionInfoModal disposition={disposition} />
				)}
			</Modal.Page>
		</Modal.Root>
	);
}
