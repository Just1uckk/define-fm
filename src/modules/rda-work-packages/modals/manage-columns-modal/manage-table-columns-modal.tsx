import React, { useContext, useState } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import update from 'immutability-helper';
import { ColumnList } from 'modules/rda-work-packages/modals/manage-columns-modal/columns/column-list';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import {
	Modal,
	ModalContext,
	ModalContextProps,
} from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageForm } from 'shared/components/modal-form/page-form';

export type ColumnOrder = {
	id: string;
	name: string;
	visible?: boolean;
	required?: boolean;
};

interface ManageTableColumnsModalProps {
	columns: ColumnOrder[];
	isLoading?: boolean;
	onSubmit: (columns: ColumnOrder[]) => void;
}

export const ManageTableColumnsModal: React.FC<
	ManageTableColumnsModalProps
> = ({ columns: columnsProp, isLoading, onSubmit }) => {
	const { t } = useTranslation();
	const modalContext = useContext<ModalContextProps>(ModalContext);

	const [columns, setColumns] = useState<ColumnOrder[]>(columnsProp);

	const onDragEnd = (result) => {
		if (!result.destination) {
			return;
		}

		const card = columns[result.source.index];

		setColumns(
			update(columns, {
				$splice: [
					[result.source.index, 1],
					[result.destination.index, 0, card],
				],
			}),
		);
	};

	const toggleColumn = (index: number) => {
		setColumns(
			update(columns, {
				[index]: (column) =>
					update(column, { visible: { $set: !column.visible } }),
			}),
		);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		onSubmit(columns);
	};

	return (
		<Modal.Page
			header={t('components.manage_columns.modal.title')}
			subHeader={t('components.manage_columns.modal.sub_title')}
		>
			<PageForm onSubmit={handleSubmit}>
				<PageBody>
					<DragDropContext onDragEnd={onDragEnd}>
						<ColumnList columns={columns} toggleColumn={toggleColumn} />
					</DragDropContext>
				</PageBody>

				<ModalFooter>
					<ButtonList>
						<Button
							label={t('components.manage_columns.modal.actions.save')}
							loading={isLoading}
						/>
						<Button
							type="button"
							variant="primary_outlined"
							label={t('components.manage_columns.modal.actions.cancel')}
							disabled={isLoading}
							onClick={modalContext.onClose}
						/>
					</ButtonList>
				</ModalFooter>
			</PageForm>
		</Modal.Page>
	);
};
