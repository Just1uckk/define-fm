import React from 'react';
import { LinkProps } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Checkbox } from 'shared/components/checkbox/checkbox';
import { TableCol } from 'shared/components/table-elements/table-col';

const Entity = styled.div<
	ThemeProps &
		Pick<TableEntityProps, 'isSelected' | 'isSelectable' | 'isHighlighted'>
>`
	position: relative;
	display: flex;
	padding: 1rem;
	margin-top: 0.75rem;
	border: 1px solid ${({ theme }) => theme.dispositionCard.borderColor};
	background-color: ${({ theme }) => theme.dispositionCard.bg};
	border-radius: ${({ theme }) => theme.borderRadius.base};

	${({ isSelectable, isSelected }) =>
		isSelectable &&
		!isSelected &&
		css`
			box-shadow: 0px 6px 15px rgba(0, 0, 0, var(--box-shadow-opacity, 0.1));
		`}

	${({ theme, isHighlighted }) =>
		isHighlighted &&
		css`
			background-color: ${theme.colors.blue.secondary_inverted};
		`};
`;

const SelectRowCol = styled(TableCol)`
	margin-right: 1.5rem;

	&& {
		flex-grow: 0;
	}
`;

interface TableEntityProps {
	disable?: boolean;
	tag?: React.ElementType<any>;
	to?: LinkProps['to'];
	state?: LinkProps['state'];
	className?: string;
	isSelectable?: boolean;
	isSelected?: boolean;
	isHighlighted?: boolean;
	hasCheckbox?: boolean;
	onSelect?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onClick?: (e: React.MouseEvent) => void;
}

export const TableEntity: React.FC<
	React.PropsWithChildren<TableEntityProps>
> = ({
	tag = 'div',
	disable,
	to,
	state,
	className,
	hasCheckbox,
	isHighlighted,
	isSelectable,
	isSelected,
	children,
	onSelect,
	onClick,
}) => {
	const checkboxEnabled = hasCheckbox && isSelectable;

	const onClickRow = (e: React.MouseEvent) => {
		const target = e.target as HTMLElement;
		const checkboxTarget = target.closest('.row-checkbox');

		if (checkboxEnabled && checkboxTarget) {
			e.preventDefault();
			return;
		}

		onClick && onClick(e);
	};

	const onClickCheckbox = (e) => {
		e.stopPropagation();
	};

	return (
		<Entity
			as={tag}
			to={to}
			state={state}
			className={className}
			isSelectable={isSelectable}
			isSelected={isSelected}
			isHighlighted={isHighlighted}
			onClick={onClickRow}
		>
			{hasCheckbox && isSelectable && (
				<SelectRowCol>
					<Checkbox
						disabled={disable}
						className="row-checkbox"
						checked={isSelected}
						onChange={onSelect}
						onClick={onClickCheckbox}
					/>
				</SelectRowCol>
			)}
			{children}
		</Entity>
	);
};
