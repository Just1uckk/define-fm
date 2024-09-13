import React from 'react';
import { DispositionStatus } from 'modules/rda-work-packages/pages/rda-work-packages-overview/components/disposition-card/disposition-status';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IDispositionSearch } from 'shared/types/disposition-search';
import {
	IDispositionTypeSnapshot,
	IWorkPackage,
} from 'shared/types/dispositions';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const Section = styled.section<ThemeProps>`
	flex-grow: 1;
	padding: 1.5rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: ${({ theme }) => theme.border.base};
	border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const SectionHeader = styled.header``;

const SectionBody = styled.body`
	margin-top: 0.5rem;
`;

const SectionFooter = styled.footer`
	display: flex;
	margin-top: 2rem;
`;

const InformationTable = styled.div``;

const InformationRow = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 1rem 0;
	padding-bottom: 1.1rem;
	border-top: ${({ theme }) => theme.border.base};
`;
const InformationRowLeft = styled.div``;

const InformationRowRight = styled.div`
	opacity: 0.67;
`;

interface InformationSectionProps {
	disposition: IWorkPackage;
	dispositionSearchName?: IDispositionSearch['name'];
	dispositionSnapshotName?: IDispositionTypeSnapshot['name'];
	isLoadingGenerateAuditReport: boolean;
	onGenerateAuditReport: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const InformationSection: React.FC<InformationSectionProps> = ({
	disposition,
	dispositionSearchName,
	dispositionSnapshotName,
	isLoadingGenerateAuditReport,
	onGenerateAuditReport,
}) => {
	const { t } = useTranslation();
	const date = useDate();

	const completedDate = disposition.completedDate
		? date.formats.base(disposition.completedDate)
		: null;

	return (
		<Section>
			<SectionHeader>
				<Title variant="h3_primary_semibold">
					{t('rda_report.work_package_information.title')}
				</Title>
			</SectionHeader>
			<SectionBody>
				<InformationTable>
					<InformationRow>
						<InformationRowLeft>
							<Text variant="body_3_primary">
								{t('rda_report.work_package_information.fields.source')}
							</Text>
						</InformationRowLeft>
						<InformationRowRight>
							<Text variant="body_3_primary">{disposition.sourceName}</Text>
						</InformationRowRight>
					</InformationRow>
					<InformationRow>
						<InformationRowLeft>
							<Text variant="body_3_primary">
								{t('rda_report.work_package_information.fields.disposition')}
							</Text>
						</InformationRowLeft>
						<InformationRowRight>
							<Text variant="body_3_primary">{dispositionSearchName}</Text>
						</InformationRowRight>
					</InformationRow>
					<InformationRow>
						<InformationRowLeft>
							<Text variant="body_3_primary">
								{t(
									'rda_report.work_package_information.fields.disposition_snapshot',
								)}
							</Text>
						</InformationRowLeft>
						<InformationRowRight>
							<Text variant="body_3_primary">{dispositionSnapshotName}</Text>
						</InformationRowRight>
					</InformationRow>
					<InformationRow>
						<InformationRowLeft>
							<Text variant="body_3_primary">
								{t('rda_report.work_package_information.fields.status')}
							</Text>
						</InformationRowLeft>
						<InformationRowRight>
							<Text variant="body_3_primary">
								<DispositionStatus
									isTimeExpired={disposition.daysLeft <= 0}
									workflowStatus={disposition.workflowStatus}
								/>
							</Text>
						</InformationRowRight>
					</InformationRow>
					<InformationRow>
						<InformationRowLeft>
							<Text variant="body_3_primary">
								{t('rda_report.work_package_information.fields.included_items')}
							</Text>
						</InformationRowLeft>
						<InformationRowRight>
							<Text variant="body_3_primary">{disposition.includedCount}</Text>
						</InformationRowRight>
					</InformationRow>
					<InformationRow>
						<InformationRowLeft>
							<Text variant="body_3_primary">
								{t('rda_report.work_package_information.fields.excluded_items')}
							</Text>
						</InformationRowLeft>
						<InformationRowRight>
							<Text variant="body_3_primary">{disposition.excludedCount}</Text>
						</InformationRowRight>
					</InformationRow>
					<InformationRow>
						<InformationRowLeft>
							<Text variant="body_3_primary">
								<Text variant="body_3_primary">
									{t(
										'rda_report.work_package_information.fields.initiated_date',
									)}
								</Text>
							</Text>
						</InformationRowLeft>
						<InformationRowRight>
							<Text variant="body_3_primary">
								{date.formats.base(disposition.initiateDate)}
							</Text>
						</InformationRowRight>
					</InformationRow>
					<InformationRow>
						<InformationRowLeft>
							<Text variant="body_3_primary">
								{t('rda_report.work_package_information.fields.completed_date')}
							</Text>
						</InformationRowLeft>
						<InformationRowRight>
							<Text variant="body_3_primary">
								{completedDate ? date.formats.base(completedDate) : '—'}
							</Text>
						</InformationRowRight>
					</InformationRow>
				</InformationTable>
			</SectionBody>
			<SectionFooter>
				<Button
					variant="primary_outlined"
					label={t('rda_report.actions.generate_audit_report')}
					alignContent
					fulfilled
					loading={isLoadingGenerateAuditReport}
					onClick={onGenerateAuditReport}
				/>
			</SectionFooter>
		</Section>
	);
};
