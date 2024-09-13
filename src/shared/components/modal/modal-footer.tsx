import styled from 'styled-components';
import { compose, justifyContent, JustifyContentProps } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

export const ModalFooter = styled.div.attrs(() => ({
	className: 'page-footer',
}))<ThemeProps & JustifyContentProps & { fullWidth?: boolean }>`
	position: sticky;
	left: 0;
	bottom: 0;
	display: ${(props) => (props.fullWidth ? 'unset' : 'flex')};
	align-items: center;
	width: 100%;
	margin-top: auto;
	padding-top: 1rem;
	padding-bottom: 2.5rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	z-index: 1;

	${compose(justifyContent)}
`;
