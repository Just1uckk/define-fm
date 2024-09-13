import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { CountBadge } from 'shared/components/count-badge/count-badge';
import { Tab, TabProps } from 'shared/components/tabs/tab';

const TabCounter = styled(CountBadge)<ThemeProps>`
	padding: 0.155rem 0.473rem;
	margin-left: 0.4rem;
	font-size: 0.6875rem;
	line-height: 1rem;
	font-weight: 600;
	border-radius: ${({ theme }) => theme.borderRadius.base};
	color: ${({ theme }) => theme.tabs.tabCounter.color};
	background-color: ${({ theme }) => theme.tabs.tabCounter.backgroundColor};
`;

const StyledTab = styled(Tab)`
	display: flex;
	align-items: flex-start;

	&.is-active {
		${TabCounter} {
			color: ${({ theme }) => theme.tabs.tabCounterActive.color};
			background-color: ${({ theme }) =>
				theme.tabs.tabCounterActive.backgroundColor};
		}
	}
`;

interface TabWithLabelProps extends TabProps {
	label: React.ReactNode;
}

export const TabWithLabel: React.FC<
	React.PropsWithChildren<TabWithLabelProps>
> = ({ label, children, ...props }) => {
	return (
		<StyledTab {...props}>
			{children} <TabCounter>{label}</TabCounter>
		</StyledTab>
	);
};
