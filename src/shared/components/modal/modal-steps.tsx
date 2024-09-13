import React from 'react';
import clsx from 'clsx';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Text } from 'shared/components/text/text';

const Container = styled.div<any>`
	display: flex;
	justify-content: ${(props) => (props.fullWidth ? 'end' : 'unset')};
	margin-top: ${(props) => (props.fullWidth ? '1rem' : 'unset')};
`;

const StepCounter = styled.span`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 1rem;
	min-width: 1rem;
	border-radius: 50%;
	background-color: ${({ theme }) => theme.colors.borderColorPrimary};
`;

const StepSeparator = styled.div<ThemeProps>`
	width: 2.875rem;
	height: 1px;
	margin: 0 0.5rem;
	background-color: ${({ theme }) => theme.colors.borderColorPrimary};
`;

const Step = styled(Text)`
	display: flex;
	align-items: center;

	&.active {
		color: ${({ theme }) => theme.colors.accent};

		& ${StepCounter}, ${StepSeparator} {
			color: ${({ theme }) => theme.colors.white};
			background-color: ${({ theme }) => theme.colors.accent};
		}
	}
`;

interface ModalStepsProps {
	totalSteps: number;
	step: number;
	fullWidth?: boolean;
}

export const ModalSteps: React.FC<ModalStepsProps> = ({
	step,
	totalSteps,
	fullWidth,
}) => {
	const steps = new Array(totalSteps).fill(1);

	return (
		<Container fullWidth={fullWidth}>
			{steps.map((_, idx) => (
				<Step
					key={idx}
					variant="body_4_secondary"
					className={clsx({ active: step >= idx + 1 })}
				>
					{idx + 1 !== 1 && <StepSeparator />}
					<StepCounter>{idx + 1}</StepCounter>
				</Step>
			))}
		</Container>
	);
};
