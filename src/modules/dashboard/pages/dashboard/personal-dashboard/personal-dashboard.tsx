import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { endOfQuarter, startOfQuarter } from 'date-fns';
import { Section } from 'modules/dashboard/components/section/section';
import { UserList } from 'modules/dashboard/components/user-list/user-list';
import styled from 'styled-components';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import { Title } from 'shared/components/title/title';

import { NumberRecordsReviewed } from './components/number-records-reviewed';
import { OnTimeCompletion } from './components/on-time-completion';
import { usePersonalDashboard } from './use-personal-dashboard';

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

const ContentRowWithRecordsReviewedChart = styled(ContentRow)`
	display: grid;
	grid-template-columns: 22.5% 24% auto;
	grid-template-rows: 1fr;
	grid-gap: 12px;
`;

const SecondRow = styled(ContentRow)`
	display: grid;
	grid-template-columns: 22.5%;
	grid-template-rows: 1fr;
	grid-gap: 12px;
`;

export const PersonalDashboardPage: React.FC = () => {
	const dateHelper = useDate();
	const { t } = useTranslation();

	const { models, commands } = usePersonalDashboard();

	return (
		<Page>
			<PageHeader>
				<Title subHeader={dateHelper.formats.pageHead()}>
					{t('dashboard.title')}
				</Title>
			</PageHeader>
			<PageContent>
				<ContentRowWithRecordsReviewedChart>
					<Section.Wrapper>
						{models.isLoadingTopApprovers ? (
							<>
								<Section.Header
									title={t(
										'dashboard.personal_dashboard.top_approvers_by_total_files.title',
									)}
								/>
								<Section.Body>
									<UserList
										currentUser={models.currentUser}
										userList={models.topApprovers}
									/>
								</Section.Body>
							</>
						) : (
							<>
								<Skeleton borderRadius="0.5rem" height={20} />
								<Skeleton borderRadius="0.5rem" height={200} />
							</>
						)}
					</Section.Wrapper>

					<Section.Wrapper>
						{models.isLoadingTopApprovers ? (
							<>
								<Section.Header
									title={t(
										'dashboard.personal_dashboard.top_approvers_by_review_time.title',
									)}
								/>
								<Section.Body>
									<UserList
										avgTime
										currentUser={models.currentUser}
										userList={models.topApprovers}
									/>
								</Section.Body>
							</>
						) : (
							<>
								<Skeleton borderRadius="0.5rem" height={20} />
								<Skeleton borderRadius="0.5rem" height={170} />
							</>
						)}
					</Section.Wrapper>

					<NumberRecordsReviewed
						isLoading={models.isLoadingNumberOfRecordsReviewed}
						defaultRangeValue={{
							start: startOfQuarter(new Date()),
							end: endOfQuarter(new Date()),
						}}
						dateLabel={models.currentDateLabel}
						onClickDateLabel={commands.onClickDateLabel}
						changeDate={commands.changeDate}
						chartOption={models.numberOfRecordsReviewed}
					/>
				</ContentRowWithRecordsReviewedChart>

				<SecondRow>
					<OnTimeCompletion
						isLoading={models.isLoadingOnTimeCompletion}
						chartOption={models.onTimeCompletionChart}
						percent={models.percent}
					/>
				</SecondRow>
			</PageContent>
		</Page>
	);
};
