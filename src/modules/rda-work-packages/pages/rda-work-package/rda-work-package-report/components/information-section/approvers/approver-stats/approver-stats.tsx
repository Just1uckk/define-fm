import React from 'react';
import { RdaWorkPackageFilesCount } from 'modules/rda-work-packages/components/rda-work-package-files-count';
import { ApproverProgress } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/information-section/approvers/approver-stats/approver-progress';
import styled from 'styled-components';

import { IWorkPackage } from 'shared/types/dispositions';

const Wrapper = styled.div``;

export interface ApproverStatsProps {
	workflowStatus: IWorkPackage['workflowStatus'];
	approvedCount: number;
	pendingCount: number;
	rejectedCount: number;
}

export const ApproverStats: React.FC<ApproverStatsProps> = ({
	workflowStatus,
	approvedCount,
	rejectedCount,
	pendingCount,
}) => {
	return (
		<Wrapper>
			<RdaWorkPackageFilesCount
				workflowStatus={workflowStatus}
				includedItemsCount={0}
				pendingItemsCount={pendingCount}
				approvedItemsCount={approvedCount}
				rejectedItemsCount={rejectedCount}
			/>
			<ApproverProgress
				approvedCount={approvedCount}
				pendingCount={pendingCount}
				rejectedCount={rejectedCount}
			/>
		</Wrapper>
	);
};
