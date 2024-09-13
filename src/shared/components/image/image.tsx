import React from 'react';
import styled from 'styled-components';

const StyledImage = styled.img`
	filter: brightness(${({ theme }) => theme.image_brightness});
`;

interface ImageProps {
	className?: string;
	src: HTMLImageElement['src'];
	alt?: HTMLImageElement['alt'];
	loading?: HTMLImageElement['loading'];
	title?: HTMLImageElement['title'];
}

const ImageComponent: React.FC<ImageProps> = ({
	className,
	src,
	title,
	loading = 'lazy',
	alt,
}) => {
	return (
		<StyledImage
			className={className}
			src={src}
			alt={alt}
			loading={loading}
			title={title}
		/>
	);
};

ImageComponent.displayName = 'Image';

export const Image = React.memo<ImageProps>(ImageComponent);
