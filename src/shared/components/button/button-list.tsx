import styled from 'styled-components';
import { compose, justifyContent, JustifyContentProps } from 'styled-system';

export const ButtonList = styled.div<JustifyContentProps>`
	display: flex;
	flex-grow: 1;
	gap: 0.85rem;

	${compose(justifyContent)}
`;
