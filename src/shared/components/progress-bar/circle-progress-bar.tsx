import React, { useEffect, useState } from 'react';
import { isNil } from 'lodash';
import styled from 'styled-components';

const ProgressText = styled.text`
	font-size: 0.75rem;
	font-weight: 600;
	fill: ${({ theme }) => theme.progressBar.color};
`;

const CircleProgress = styled.circle`
	stroke: ${({ theme }) => theme.colors.accent};

	transition: all 0.3s;
`;

const CircleBg = styled.circle`
	stroke: ${({ theme }) => theme.progressBar.bg};
`;

interface CircleProgressBarProps {
	className?: string;
	size?: number;
	text: number | string;
	strokeWidth?: number;
	percentage: number;
}

export const CircleProgressBar: React.FC<CircleProgressBarProps> = ({
	className,
	size = 40,
	text,
	strokeWidth = 4,
	percentage,
}) => {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		setProgress(Math.ceil(percentage));
	}, [percentage]);

	const viewBox = `0 0 ${size} ${size}`;
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * Math.PI * 2;
	const dash = (progress * circumference) / 100;

	return (
		<svg width={size} height={size} viewBox={viewBox} className={className}>
			<CircleBg
				className="circle-progress__bg"
				fill="none"
				cx="50%"
				cy="50%"
				r={radius}
				strokeWidth={`${strokeWidth}px`}
			/>
			<CircleProgress
				className="circle-progress__progress"
				fill="none"
				cx="50%"
				cy="50%"
				r={radius}
				strokeWidth={`${strokeWidth}px`}
				transform={`rotate(${270 - (360 * progress) / 100} ${size / 2} ${
					size / 2
				})`}
				strokeDasharray={`${dash},${circumference - dash}`}
				strokeLinecap="round"
			/>
			<ProgressText
				fill="black"
				x="50%"
				y="50%"
				dy="0.25rem"
				textAnchor="middle"
			>
				{`${!isNil(text) ? text : progress}`}
			</ProgressText>
		</svg>
	);
};
