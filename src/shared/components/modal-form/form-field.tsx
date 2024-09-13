import styled, { css } from 'styled-components';
import {
	alignItems,
	AlignItemsProps,
	compose,
	space,
	SpaceProps,
} from 'styled-system';

export const FormField = styled.div<
	{ grid?: boolean; fieldsCount?: number } & SpaceProps & AlignItemsProps
>`
	margin-top: 0.75rem;
	gap: 0.75rem;

	${({ grid = true }) =>
		grid &&
		css`
			display: grid;
			grid-auto-columns: minmax(0, 1fr);
			grid-auto-flow: column;
		`}

	${({ fieldsCount }) =>
		fieldsCount &&
		css`
			& > * {
				flex: 1 1 calc(100% / ${fieldsCount} - ${fieldsCount - 1} * 0.75rem);
			}
		`}
	${compose(space, alignItems)}
`;
