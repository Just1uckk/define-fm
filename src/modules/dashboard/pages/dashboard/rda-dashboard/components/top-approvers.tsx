import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Section } from 'modules/dashboard/components/section/section';
import { UserList } from 'modules/dashboard/components/user-list/user-list';

import { UserParamsInterface } from 'shared/types/dashboard';

import { useTranslation } from 'shared/hooks/use-translation';

interface TopApproversInterface {
	isLoading: boolean;
	usersList: UserParamsInterface[];
}

export const TopApprovers: React.FC<TopApproversInterface> = ({
	isLoading,
	usersList,
}) => {
	const { t } = useTranslation();

	return (
		<Section.Wrapper>
			{isLoading ? (
				<>
					<Section.Header
						title={t('dashboard.rda_dashboard.top_approvers.title')}
					/>
					<Section.Body>
						<UserList userList={usersList} />
					</Section.Body>
				</>
			) : (
				<>
					<Skeleton borderRadius="0.5rem" height={20} />
					<Skeleton borderRadius="0.5rem" height={137} />
				</>
			)}
		</Section.Wrapper>
	);
};
