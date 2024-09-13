import * as React from 'react';
import { useContext } from 'react';
import EasyCropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';
import { CroppedImage, getCroppedImg } from 'shared/utils/crop-image';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { PageBody } from 'shared/components/modal-form/page-body';
import { Slider } from 'shared/components/slider/slider';

const CropperWrapper = styled.div`
	position: relative;
	height: 250px;
	max-width: 460px;
	width: 100%;
`;

const StyledModalFooter = styled(ModalFooter)`
	padding: 0 1.5rem;
`;

const SliderWrapper = styled.div`
	position: relative;
	margin: 0.75rem 0;
`;

const StyledSlider = styled(Slider)<ThemeProps>`
	&.slider.horizontal {
		margin-left: 1.9rem;
		width: calc(100% - 4.8rem);
	}
`;

const ResetButton = styled.div`
	position: absolute;
	right: 6px;
	top: 50%;
	transform: translateY(-50%);
`;

export enum CROP_IMAGE_MODAL_CROP_SHAPE {
	ROUND = 'round',
}

export interface CropImageModalProps {
	imageUrl?: string;
	fileName?: string;
	cropShape?: CROP_IMAGE_MODAL_CROP_SHAPE;
	error?: string;
	isLoading?: boolean;
	aspect?: number;
	onAccept: (croppedImg: CroppedImage) => void;
}

export const Cropper: React.FC<CropImageModalProps> = ({
	imageUrl = '',
	fileName = '',
	cropShape = CROP_IMAGE_MODAL_CROP_SHAPE.ROUND,
	aspect = 1 / 1,
	onAccept,
	isLoading,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);
	const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
	const [zoom, setZoom] = React.useState<number>(1);
	const [rotation] = React.useState(0);
	const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area>();

	const onFinishCropping = async () => {
		try {
			const croppedImage = await getCroppedImg(
				imageUrl,
				fileName,
				croppedAreaPixels,
				rotation,
			);

			onAccept(croppedImage);
		} catch (error: unknown) {
			console.error(error);
		}
	};

	const onReset = React.useCallback(() => {
		setCrop({
			x: 0,
			y: 0,
		});
		setZoom(1);
	}, []);

	const onCropComplete = React.useCallback(
		async (_: Area, croppedAreaPixels: Area) => {
			setCroppedAreaPixels(croppedAreaPixels);
		},
		[],
	);

	return (
		<>
			<PageBody>
				<CropperWrapper>
					<EasyCropper
						image={imageUrl}
						rotation={0}
						cropShape={cropShape}
						crop={crop}
						zoom={zoom}
						aspect={aspect}
						onCropChange={setCrop}
						onCropComplete={onCropComplete}
						onZoomChange={setZoom}
					/>
				</CropperWrapper>
				<SliderWrapper>
					<StyledSlider
						value={zoom}
						minValue={1}
						maxValue={3}
						step={0.05}
						aria-labelledby="Zoom"
						onChange={(zoom) => setZoom(zoom as number)}
					/>

					<ResetButton>
						<IconButton
							icon={ICON_COLLECTION.arrow_round_left}
							onPress={onReset}
						/>
					</ResetButton>
				</SliderWrapper>
			</PageBody>
			<StyledModalFooter>
				<ButtonList>
					<Button
						label="Accept"
						loading={isLoading}
						onClick={onFinishCropping}
					/>
					<Button
						variant="primary_outlined"
						label="Cancel"
						disabled={isLoading}
						onClick={modalContext.onClose}
					/>
				</ButtonList>
			</StyledModalFooter>
		</>
	);
};
