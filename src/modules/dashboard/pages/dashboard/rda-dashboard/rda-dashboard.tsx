import React, { useState } from 'react';
import { endOfYear, startOfYear } from 'date-fns';
import { TopApprovers } from 'modules/dashboard/pages/dashboard/rda-dashboard/components/top-approvers';
import styled from 'styled-components';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import { Title } from 'shared/components/title/title';

import { AvgTimePerRecords } from './components/avg-time-per-records';
import { DiscSpaceSavedBySourceSystem } from './components/disc-space-saved-by-source-system';
import { DiskSpaceSaved } from './components/disk-space-saved';
import { NumberRecordsFinalState } from './components/number-records-final-state';
import { RejectionsTotalRecordsSentForReview } from './components/rejections-total-records-sent-for-review';
import { StatusStats } from './components/status-stats';
import { TotalRecordsCurrentState } from './components/total-records-current-state';
import { useRdaDashboard } from './use-rda-dashboard';

const Page = styled.div``;

const PageHeader = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const PageContent = styled.div`
	display: flex;
	flex-direction: column;
	gap: 12px;
	margin-top: 1.7rem;
`;

const ContentRow = styled.div`
	display: flex;
	gap: 12px;
`;

const ContentTopRow = styled(ContentRow)`
	display: grid;
	grid-template-columns: 24.3% 24.3% 24.3% auto;
	grid-template-rows: 1fr;
	grid-gap: 12px;
`;

const ContentRowTwo = styled(ContentRow)`
	display: grid;
	grid-template-columns: 49.5% 49.5%;
	grid-template-rows: 1fr;
	grid-gap: 12px;
`;

const ContentRowThree = styled(ContentRow)`
	display: grid;
	grid-template-columns: 49.5% 49.5%;
	grid-template-rows: 1fr;
	grid-gap: 12px;
`;

export const RdaDashboardPage: React.FC = () => {
	const dateHelper = useDate();
	const { t } = useTranslation();

	const { models, commands } = useRdaDashboard();

	return (
		<Page>
			<PageHeader>
				<Title subHeader={dateHelper.formats.pageHead()}>
					{t('dashboard.title')}
				</Title>
			</PageHeader>
			<PageContent>
				<ContentTopRow>
					<StatusStats />

					<DiskSpaceSaved />
					<AvgTimePerRecords
						isLoading={models.isLoadingTopApprovers}
						usersList={models.topApprovers || []}
						usersListLastMonth={models.topApproversLastMonth || []}
					/>

					<TopApprovers
						isLoading={models.isLoadingTopApprovers}
						usersList={models.topApprovers || []}
					/>
				</ContentTopRow>

				<ContentRowTwo>
					<RejectionsTotalRecordsSentForReview
						isLoading={models.isLoadingRejectionsTotalRecords}
						chartOptions={models.rejectionsTotalRecordsSentForReview}
					/>

					<TotalRecordsCurrentState
						isLoading={models.isLoadingTotalRecordsCurrentState}
						chartOptions={models.totalRecordsCurrentState}
					/>
				</ContentRowTwo>

				<ContentRowThree>
					<DiscSpaceSavedBySourceSystem
						chartOptions={models.diskSpaceSavedSource}
						diskSpaceSavedSystemList={models.diskSpaceSavedSystemList}
						defaultRangeValue={{
							start: startOfYear(new Date()),
							end: endOfYear(new Date()),
						}}
						changeCurrentState={commands.changeCurrentStateDSS}
						changeCurrentDate={commands.changeCurrentDateDSS}
						currentState={models.currentStateDSS}
					/>
					<NumberRecordsFinalState
						isLoading={models.isLoadingNumberOfRecords}
						defaultRangeValue={{
							start: startOfYear(new Date()),
							end: endOfYear(new Date()),
						}}
						chartOptions={models.numberRecordsFinalState}
						numberOfRecordsStateList={models.numberOfRecordsStateList}
						changeCurrentState={commands.changeCurrentState}
						changeCurrentDate={commands.changeCurrentDate}
						currentState={models.currentState}
					/>
				</ContentRowThree>
			</PageContent>
		</Page>
	);
};
