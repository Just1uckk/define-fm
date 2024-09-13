import React from 'react';
import styled from 'styled-components';

import { IWorkPackage } from 'shared/types/dispositions';

import { DISPOSITION_WORKFLOW_STATES } from 'shared/constants/constans';

import { Badge } from 'shared/components/badge/badge';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';

const List = styled.div`
	display: flex;
`;

interface IDispositionStatusProps {
	isTimeExpired: boolean;
	workflowStatus: DISPOSITION_WORKFLOW_STATES;
	sourceName?: IWorkPackage['sourceName'];
}

export const DispositionStatus: React.FC<IDispositionStatusProps> = ({
	workflowStatus,
	isTimeExpired,
	sourceName,
}) => {
	return (
		<List>
			{workflowStatus === DISPOSITION_WORKFLOW_STATES.BUILDING_NEW && (
				<Badge variant="red">
					<LocalTranslation tk="disposition.statuses.building" />
				</Badge>
			)}
			{workflowStatus === DISPOSITION_WORKFLOW_STATES.DISPOSITIONING && (
				<Badge variant="green">
					<LocalTranslation tk="disposition.statuses.processing" />
				</Badge>
			)}
			{workflowStatus === DISPOSITION_WORKFLOW_STATES.READY_TO_COMPLETE && (
				<Badge variant="green">
					<LocalTranslation tk="disposition.statuses.ready_to_complete" />
				</Badge>
			)}
			{!isTimeExpired &&
				workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED && (
					<Badge>
						<LocalTranslation tk="disposition.statuses.on_time" />
					</Badge>
				)}
			{isTimeExpired &&
				workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED && (
					<Badge variant="red">
						<LocalTranslation tk="disposition.statuses.late" />
					</Badge>
				)}
			{sourceName && <Badge variant="grey_white">{sourceName}</Badge>}
		</List>
	);
};
