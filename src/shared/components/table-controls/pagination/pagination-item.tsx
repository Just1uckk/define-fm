import styled from 'styled-components';

export const PaginationItem = styled.li`
	display: flex;
	margin: 0 0.2rem;
	line-height: 12px;
	color: ${({ theme }) => theme.colors.primary};
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	box-sizing: border-box;
	border-radius: 4px;
	background-color: ${({ theme }) => theme.colors.backgroundSecondary};

	&.active {
		background: ${({ theme }) => theme.colors.accent};
		color: ${({ theme }) => theme.text.whiteText};
		text-shadow: 1px 0 0 currentColor;
	}

	&.disabled {
		border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
		opacity: 0.3;

		& * {
			cursor: not-allowed;
		}
	}
`;
