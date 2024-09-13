import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

export const Table = styled.table<ThemeProps>`
	flex-grow: 1;
	font-size: 0.75rem;
	line-height: 0.875rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
`;

export const TableBody = styled.tbody`
	display: flex;
	flex-direction: column;
`;

export const TableRow = styled.tr`
	display: flex;
	text-align: left;

	&:not(:last-child) {
		border-bottom: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	}
`;

export const Cell = styled.td`
	display: inline-flex;
	&:not(:last-child) {
		border-right: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	}
`;

export const HeaderCell = styled(Cell)`
	width: 138px;
	flex-grow: 138;
	font-weight: 600;
`;

export const RowBodyCell = styled(Cell)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 110px;
	flex-grow: 110;
`;

export const CellContent = styled.div`
	display: flex;
	align-items: center;
	padding: 0.5rem 0.65rem;
	border-bottom: ${({ theme }) => theme.border.base};

	&:last-child {
		border: none;
	}
`;
