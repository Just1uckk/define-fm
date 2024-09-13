import styled from 'styled-components';
import {
	background,
	BackgroundProps,
	compose,
	space,
	SpaceProps,
} from 'styled-system';

export type IndicatorProps = BackgroundProps & SpaceProps;

export const Indicator = styled.span<IndicatorProps>`
	display: inline-block;
	width: 4px;
	height: 4px;
	border-radius: 50%;

	${compose(background, space)}
`;
