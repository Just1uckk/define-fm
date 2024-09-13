import React from 'react';
import styled from 'styled-components';

import { IApprovalHistory } from 'shared/types/dispositions';

import { FeedbackCard } from './feedback-card';

const Container = styled.div``;
const FeedbackList = styled.ul`
	margin: 0;
	padding: 0;
	list-style: none;
`;
const FeedbackItem = styled.li``;

interface FeedbackFromUsersTabProps {
	historyList: IApprovalHistory[];
}

export const FeedbackFromUsersTab: React.FC<FeedbackFromUsersTabProps> = ({
	historyList,
}) => {
	return (
		<Container>
			<FeedbackList>
				{historyList.map((history) => (
					<FeedbackItem key={history.id}>
						<FeedbackCard
							id={history.id}
							fromUserId={history.approverId}
							fromUserName={history.userDisplay}
							fromUserImage={Number(history.userProfileImage)}
							state={history.state}
							comment={history.itemComment || ''}
							reason={history.reason || ''}
						/>
					</FeedbackItem>
				))}
			</FeedbackList>
		</Container>
	);
};
