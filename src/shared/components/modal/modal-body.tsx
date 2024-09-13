import React from 'react';
import styled from 'styled-components';

export const ModalBodyWrap = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	overflow: hidden;
`;

const ModalBodyContent = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	flex-grow: 1;
	padding: 2rem;
	overflow-y: auto;
	overflow-wrap: break-word;
`;

interface ModalBodyProps {
	className?: string;
}

export const ModalBody: React.FC<React.PropsWithChildren<ModalBodyProps>> = ({
	className,
	children,
}) => {
	return (
		<ModalBodyWrap className={className}>
			<ModalBodyContent className="modal__body-content">
				{children}
			</ModalBodyContent>
		</ModalBodyWrap>
	);
};
