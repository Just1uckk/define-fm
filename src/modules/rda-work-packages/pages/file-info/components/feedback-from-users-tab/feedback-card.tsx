import React from 'react';
import { getUserAvatarUrl } from 'shared/utils/get-user-avatar-url';
import styled from 'styled-components';

import { IApprovalHistory } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Text } from 'shared/components/text/text';
import { UserAvatarWithLabel } from 'shared/components/user-avatar/user-avatar-with-label';

const Feedback = styled.div`
	display: flex;
	padding: 1rem;
	padding-top: 0.6rem;
	margin-top: 0.75rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: 0.625rem;
`;

const FeedbackLeft = styled.div`
	margin-right: 1.1rem;
	padding-top: 1rem;
`;

const FeedbackRight = styled.div`
	padding-top: 0.1rem;
`;

const Users = styled.div`
	display: flex;
	margin-bottom: 0.6rem;
`;

const UsersSeparator = styled(Icon)`
	margin: 0 1.25rem;
`;

const Row = styled.div`
	display: flex;
`;

const RowText = styled.div`
	display: flex;
	margin-right: 1.5rem;
`;

const RowTextLabel = styled(Text)`
	margin-right: 0.8rem;
`;

const Recommendation = styled.div`
	margin-top: 0.4rem;
`;

const RecommendationText = styled(Text)`
	margin-top: 0.3rem;
	line-height: 1.0625rem;
`;

interface FeedbackCardProps {
	id: number;
	fromUserId: IUser['id'];
	fromUserName: IUser['display'];
	fromUserImage: IUser['profileImage'];
	state: IApprovalHistory['state'];
	reason?: string;
	comment?: string;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
	id,
	fromUserId,
	fromUserName,
	fromUserImage,
	state,
	reason,
	comment,
}) => {
	const { t } = useTranslation();

	return (
		<Feedback>
			<FeedbackLeft>
				<Text variant="body_4_secondary">#{id}</Text>
			</FeedbackLeft>
			<FeedbackRight>
				<Users>
					<UserAvatarWithLabel
						label={fromUserName}
						name={fromUserName}
						url={getUserAvatarUrl(fromUserId, fromUserImage)}
					/>
					<UsersSeparator icon={ICON_COLLECTION.chevron_right} />
					<UserAvatarWithLabel label="Paula Mora" />
				</Users>

				<Row>
					<RowText>
						<RowTextLabel variant="body_4_secondary">
							{t('disposition.file_info_modal.feedbacks.fields.recommendation')}
						</RowTextLabel>
						<Text variant="body_4_primary">
							{t('rda_approval.status', { returnObjects: true })[state] ||
								state}
						</Text>
					</RowText>
					<RowText>
						<RowTextLabel variant="body_4_secondary">
							{t('disposition.file_info_modal.feedbacks.fields.reason')}
						</RowTextLabel>
						<Text variant="body_4_primary">{reason}</Text>
					</RowText>
				</Row>

				<Recommendation>
					<Text variant="body_4_secondary">
						{t('disposition.file_info_modal.feedbacks.fields.comment')}
					</Text>
					<RecommendationText variant="body_4_primary">
						{comment}
					</RecommendationText>
				</Recommendation>
			</FeedbackRight>
		</Feedback>
	);
};
