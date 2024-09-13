import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { ColumnItem } from 'modules/rda-work-packages/modals/manage-columns-modal/columns/column-item';
import { ColumnOrder } from 'modules/rda-work-packages/modals/manage-columns-modal/manage-table-columns-modal';
import styled from 'styled-components';

const List = styled.ul`
	padding: 0;
	margin: 0;
`;

interface ColumnListProps {
	columns: ColumnOrder[];
	toggleColumn: (index: number) => void;
}

export const ColumnList: React.FC<ColumnListProps> = ({
	columns,
	toggleColumn,
}) => {
	return (
		<Droppable droppableId="droppable">
			{(provided) => (
				<List ref={provided.innerRef} {...provided.droppableProps}>
					{columns.map((column, index) => (
						<ColumnItem
							index={index}
							key={column.id}
							id={column.id}
							name={column.name}
							enabled={column.visible ?? true}
							required={column.required}
							toggleColumn={toggleColumn}
						/>
					))}
					{provided.placeholder}
				</List>
			)}
		</Droppable>
	);
};
