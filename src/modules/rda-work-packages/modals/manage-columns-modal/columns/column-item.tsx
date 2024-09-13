import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import clsx from 'clsx';
import { ColumnOrder } from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { Toggle } from 'shared/components/toggle/toggle';

const ItemLeft = styled.div<ThemeProps>`
	display: flex;
	align-items: center;
	flex-shrink: 0;
	margin-right: 0.5rem;
`;

const ItemCenter = styled.div`
	flex-grow: 1;
`;

const ItemRight = styled.div`
	margin-left: 1rem;
`;

const Item = styled.li<ThemeProps>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.7rem 1rem;
	margin-top: 0.5rem;
	border: ${({ theme }) => theme.border.base};
	border-radius: ${({ theme }) => theme.borderRadius.base};
	background-color: ${({ theme }) => theme.colors.background.secondary};
	transition: box-shadow 0.3s ease;

	&:first-child {
		margin-top: 0;
	}

	&.is-dragging {
		box-shadow: 0 12px 32px rgba(0, 0, 0, var(--box-shadow-opacity, 0.15));
	}

	&.is-disabled {
		& ${ItemLeft}, ${ItemCenter}, ${ItemRight} {
			opacity: 0.5;
		}
	}
`;

const DragButton = styled(IconButton)`
	&:not(:disabled) {
		cursor: grab;
	}
`;

interface ColumnItemProps {
	index: number;
	id: string;
	name: React.ReactNode;
	enabled: boolean;
	required: ColumnOrder['required'];
	toggleColumn: (index: number) => void;
}

export const ColumnItem: React.FC<ColumnItemProps> = ({
	index,
	id,
	name,
	enabled,
	required,
	toggleColumn,
}) => {
	return (
		<Draggable key={id} index={index} draggableId={id} shouldRespectForcePress>
			{(provided, snapshot) => (
				<Item
					ref={provided.innerRef}
					className={clsx({
						'is-dragging': snapshot.isDragging,
						'is-disabled': !enabled,
					})}
					{...provided.dragHandleProps}
					{...provided.draggableProps}
				>
					<ItemLeft>
						<DragButton
							icon={ICON_COLLECTION.order_dots_vertical}
							tabIndex={-1}
						/>
					</ItemLeft>

					<ItemCenter>{name}</ItemCenter>

					<ItemRight>
						<Toggle
							checked={enabled}
							disabled={required}
							onChange={() => toggleColumn(index)}
						/>
					</ItemRight>
				</Item>
			)}
		</Draggable>
	);
};
