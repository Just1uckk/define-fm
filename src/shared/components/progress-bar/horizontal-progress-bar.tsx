import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

const HorizontalProgressBarRoot = styled.div`
	position: relative;
	height: 0.25rem;
	background-color: ${({ theme }) => theme.progressBar.bg};
	border-radius: ${({ theme }) => theme.borderRadius.base};
	overflow: hidden;
`;

const HorizontalProgressBarProgress = styled.div<
	Pick<HorizontalProgressBarProps, 'percentage'>
>`
	position: absolute;
	top: 0;
	right: 0;
	height: 100%;
	width: ${({ percentage }) => `${percentage}%`};
	border-radius: ${({ theme }) => theme.borderRadius.base};
	background-color: ${({ theme }) => theme.progressBar.progress};
	transition: width 0.5s;

	${({ percentage }) =>
		percentage <= 0 &&
		css`
			width: 100%;
			background-color: ${({ theme }) => theme.progressBar.progressOutstanding};
		`}
`;

interface HorizontalProgressBarProps {
	className?: string;
	percentage: number;
}

export const HorizontalProgressBar: React.FC<HorizontalProgressBarProps> = ({
	className,
	percentage,
}) => {
	const [progress, setProgress] = useState(0);
	useEffect(() => {
		setProgress(percentage);
	}, [percentage]);

	return (
		<HorizontalProgressBarRoot className={className}>
			<HorizontalProgressBarProgress
				className="horizontal-progressbar__progress"
				percentage={progress}
			/>
		</HorizontalProgressBarRoot>
	);
};
