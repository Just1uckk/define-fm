import styled from 'styled-components';

export const ModalOverlay = styled.div`
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, var(--box-shadow-opacity, 0.15));
	opacity: 0;
	transition: opacity 0.2s ease;
`;

export const ModalWrapper = styled.div`
	position: fixed;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow-y: auto;
	z-index: 11;

	&.enter-active {
		.modal_overlay {
			opacity: 1;
		}
	}
	&.enter-done {
		.modal_overlay {
			opacity: 1;
		}
	}
	&.exit-active {
		.modal_overlay {
			opacity: 0;
		}
	}

	&[data-placement='right'] {
		&.enter-active {
			.modal_content_wrapper {
				transform: translate3d(0, 0, 0);
			}
		}

		&.enter-done {
			.modal_content_wrapper {
				transform: translate3d(0, 0, 0);
			}
		}

		&.exit-active {
			.modal_content_wrapper {
				transform: translate3d(100%, 0, 0);
			}
		}
	}

	&[data-placement='left'] {
		&.enter-active {
			.modal_content_wrapper {
				transform: translate3d(0, 0, 0);
			}
		}
		&.enter-done {
			.modal_content_wrapper {
				transform: translate3d(0, 0, 0);
			}
		}
		&.exit-active {
			.modal_content_wrapper {
				transform: translate3d(-100%, 0, 0);
			}
		}
	}

	&[data-placement='center'] {
		&.enter-active {
			.modal_content_wrapper {
				opacity: 1;
			}
		}
		&.enter-done {
			.modal_content_wrapper {
				opacity: 1;
			}
		}
		&.exit-active {
			.modal_content_wrapper {
				opacity: 0;
			}
		}
	}
`;
