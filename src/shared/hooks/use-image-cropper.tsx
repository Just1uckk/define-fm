import React, { useState } from 'react';
import { useStateModalManager } from 'shared/context/modal-manager';

import { IMAGE_CROPPER } from 'shared/constants/modal-names';

import { Cropper } from 'shared/components/cropper/cropper';
import { Modal } from 'shared/components/modal';

interface UseImageCropperParams {
	onChange: (file: File) => void;
}

export function useImageCropper({ onChange }: UseImageCropperParams) {
	const [image, setImage] = useState<string>();
	const modalState = useStateModalManager(IMAGE_CROPPER);

	const handleAfterCloseModal = () => {
		setImage(undefined);
	};

	const handleAccept = ({ file }) => {
		onChange(file);
		modalState.close();
	};

	const onOpen = (image) => {
		setImage(image);
		modalState.openModal();
	};

	const modal = (
		<Modal.Root
			placement="center"
			fulfilled
			open={modalState.open}
			hasClose={false}
			onAfterClose={handleAfterCloseModal}
			onClose={modalState.close}
		>
			<Cropper imageUrl={image} onAccept={handleAccept} />
		</Modal.Root>
	);

	return {
		modal,
		onOpen,
	};
}
