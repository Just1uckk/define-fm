import React, { useMemo } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { AddApprover } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/information-section/approvers/add-approver';
import { ApproverList } from 'modules/rda-work-packages/pages/rda-work-package/rda-work-package-report/components/information-section/approvers/approver-list';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IApprover, IWorkPackage } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { DISPOSITION_WORKFLOW_STATES_COMPLETED } from 'shared/constants/constans';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const Section = styled.section<ThemeProps>`
	width: 100%;
	padding: 1.5rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: ${({ theme }) => theme.border.base};
	border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const SectionHeader = styled.header`
	display: flex;
	justify-content: space-between;
`;

const SectionHeaderLeft = styled.div``;

const SectionHeaderRight = styled.div`
	display: flex;
`;

const SectionBody = styled.body`
	margin-top: 1.5rem;
`;

const SectionFooter = styled.footer`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 1rem;
	padding-left: 1.5rem;
`;

interface StatusSectionProps {
	isAddingApprover: boolean;
	isAllowReassign: boolean;
	disposition: IWorkPackage;
	approvers: IApprover[];
	additionalApprovers: IApprover[];
	onAddApprover: (
		user: IUser,
		conditionalApprover: IApprover['conditionalApprover'],
	) => void;
	onChangeApproverOrder: (result: DropResult) => void;
	onReassign: (userId: number) => void;
	onDeleteApprover: (approverId: IApprover['approverId']) => void;
}

export const StatusSection: React.FC<StatusSectionProps> = ({
	isAddingApprover,
	isAllowReassign,
	disposition,
	approvers,
	additionalApprovers,
	onAddApprover,
	onChangeApproverOrder,
	onReassign,
	onDeleteApprover,
}) => {
	const { t } = useTranslation();

	const selectedApproverIds = useMemo(() => {
		const approverIds = approvers.map((approver) => approver.userId);
		const additionalApproverIds = additionalApprovers.map(
			(approver) => approver.userId,
		);

		return approverIds.concat(additionalApproverIds);
	}, [approvers, additionalApprovers]);

	return (
		<Section>
			<SectionHeader>
				<SectionHeaderLeft>
					<Title variant="h3_primary_semibold">
						{t('rda_report.approvers_section.title')}
					</Title>
				</SectionHeaderLeft>
				<SectionHeaderRight>
					<Text variant="body_3_secondary_semibold" mr="0.5rem">
						{t('rda_report.approvers_section.days_left')}
					</Text>
					<Text variant="body_3_primary">
						{disposition.daysLeft}/{disposition.daysTotal}
					</Text>
				</SectionHeaderRight>
			</SectionHeader>
			<SectionBody>
				<ApproverList
					isAllowReassign={isAllowReassign}
					workflowStatus={disposition.workflowStatus}
					approvers={approvers}
					additionalApprovers={additionalApprovers}
					onChangeApproverOrder={onChangeApproverOrder}
					onReassign={onReassign}
					onDelete={onDeleteApprover}
				/>
			</SectionBody>
			<SectionFooter>
				{!DISPOSITION_WORKFLOW_STATES_COMPLETED.includes(
					disposition.workflowStatus,
				) && (
					<>
						<AddApprover
							order={approvers.length + additionalApprovers.length + 1}
							isAddingApprover={isAddingApprover}
							selectedApproverIds={selectedApproverIds}
							onAddApprover={onAddApprover}
						/>

						<Button
							tag={Link}
							to={DISPOSITIONS_ROUTES.DISPOSITION_VERIFY_APPROVER_RIGHTS.generate(
								disposition.id,
							)}
							variant="primary_outlined"
							label="Verify Approver Rights"
							icon={ICON_COLLECTION.chevron_right}
						/>
					</>
				)}
			</SectionFooter>
		</Section>
	);
};
