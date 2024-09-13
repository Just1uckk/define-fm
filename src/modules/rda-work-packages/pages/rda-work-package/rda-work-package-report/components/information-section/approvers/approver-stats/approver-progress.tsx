import React from 'react';
import styled from 'styled-components';

const ProgressBarRoot = styled.div`
	position: relative;
	display: flex;
	height: 0.375rem;
	margin-top: 0.5rem;
	background-color: ${({ theme }) => theme.progressBar.bg};
	border-radius: ${({ theme }) => theme.borderRadius.base};
	overflow: hidden;
`;

const ProgressLine = styled.div<{ percentage: number }>`
	width: ${({ percentage }) => `${percentage}%`};
	background-color: ${({ theme }) => theme.progressBar.progress};
	transition: width 0.5s;
`;

const PendingProgress = styled(ProgressLine)`
	background-color: ${({ theme }) => theme.colors.secondary};
`;

const ApprovedProgress = styled(ProgressLine)`
	background-color: ${({ theme }) => theme.colors.accent};
`;

const RejectedProgress = styled(ProgressLine)`
	background-color: ${({ theme }) => theme.colors.red.style_1};
`;

interface HorizontalProgressBarProps {
	pendingCount: number;
	approvedCount: number;
	rejectedCount: number;
}

export const ApproverProgress: React.FC<HorizontalProgressBarProps> = ({
	pendingCount,
	approvedCount,
	rejectedCount,
}) => {
	const summ = pendingCount + approvedCount + rejectedCount;
	const pendingPercent = (pendingCount / summ) * 100;
	const approvedPercent = (approvedCount / summ) * 100;
	const rejectedPercent = (rejectedCount / summ) * 100;

	return (
		<ProgressBarRoot>
			<PendingProgress percentage={pendingPercent} />
			<ApprovedProgress percentage={approvedPercent} />
			<RejectedProgress percentage={rejectedPercent} />
		</ProgressBarRoot>
	);
};
