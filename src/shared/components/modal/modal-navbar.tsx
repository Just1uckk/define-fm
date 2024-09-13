import React, { ButtonHTMLAttributes } from 'react';
import styled from 'styled-components';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { ModalCloseButton } from 'shared/components/modal/modal-close-button';
import { Text } from 'shared/components/text/text';

const Container = styled.div`
	position: relative;
	display: flex;
	min-height: 1.5rem;
	margin-bottom: 0.75rem;
`;

const BackButton = styled(Button)`
	position: absolute;
	top: 0.2rem;
	height: auto;
	padding: 0;
	font-weight: 400;

	svg {
		width: 0.9rem;
		height: 0.6rem;
	}
`;

const StyledModalCloseButton = styled(ModalCloseButton)`
	margin-left: auto;
`;

interface ModalNavbarProps {
	onClose?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
	onBack?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
	hasBack?: boolean;
	hasClose?: boolean;
}

export const ModalNavbar: React.FC<ModalNavbarProps> = ({
	hasBack = false,
	hasClose = true,
	onBack,
	onClose,
}) => {
	return (
		<Container>
			{hasBack && (
				<BackButton
					variant="primary_ghost"
					icon={ICON_COLLECTION.chevron_left}
					label={
						<Text variant="body_3_primary">
							<LocalTranslation tk="components.modal.actions.back" />
						</Text>
					}
					onClick={onBack}
				/>
			)}
			{hasClose && <StyledModalCloseButton onClose={onClose} />}
		</Container>
	);
};
