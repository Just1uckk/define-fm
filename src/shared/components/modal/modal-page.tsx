import React from 'react';

import { ModalBody } from 'shared/components/modal/modal-body';
import { ModalHeader } from 'shared/components/modal/modal-header';
import { Text } from 'shared/components/text/text';

export interface ModalPageProps {
	className?: string;
	header?: React.ReactNode;
	subHeader?: React.ReactNode;
	subSubHeader?: React.ReactNode;
}

export const ModalPage: React.FC<React.PropsWithChildren<ModalPageProps>> = ({
	header,
	subHeader,
	subSubHeader,
	children,
}) => {
	return (
		<>
			{header && (
				<ModalHeader
					variant="h2_primary_semibold"
					subHeader={<Text variant="body_3_secondary">{subHeader}</Text>}
					subSubHeader={<Text variant="body_3_secondary">{subSubHeader}</Text>}
					className="modal__header"
				>
					{header}
				</ModalHeader>
			)}
			<ModalBody>{children}</ModalBody>
		</>
	);
};
