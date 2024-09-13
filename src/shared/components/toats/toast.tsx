import React from 'react';
import styled, { css } from 'styled-components';
import { variant } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, ICON_COLLECTION, IconProps } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';
import { toastStyleVariation } from 'shared/components/toats/toast-variants';

interface ToastWrapperProps extends Pick<ToastProps, 'variant'>, ThemeProps {
	withoutTitle: boolean;
}

const ToastInformIcon = styled.div`
	position: absolute;
	top: 23px;
	left: 24px;
`;

const CloseButton = styled(IconButton)`
	position: absolute;
	top: 6px;
	right: 14px;

	color: currentColor;

	&:hover {
		color: currentColor;
		background-color: transparent;
	}
`;

const ToastWrapper = styled.div<ToastWrapperProps>`
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
	padding: 0.8rem 3.7rem 0.8rem 4.475rem;
	border: 1px solid;
	border-radius: ${(props) => props.theme.borderRadius.base};

	${({ withoutTitle }) =>
		withoutTitle &&
		css`
			& ${ToastInformIcon} {
				top: 9px;
			}
		`}

	${(props) => variant({ variants: toastStyleVariation(props.theme) })}
`;

const StyledIcon = styled(Icon)`
	width: 1.5rem;
	height: 1.5rem;
	color: currentColor;

	svg {
		width: 100%;
		height: auto;
	}
`;

const ToastTitle = styled(Title)`
	color: currentColor;
`;

const ToastText = styled(Text)`
	color: currentColor;
`;

export enum TOAST_VARIANTS {
	SUCCESS = 'success',
	WARNING = 'warning',
	ERROR = 'error',
	INFO = 'info',
}

function getIconName(type: TOAST_VARIANTS): IconProps['icon'] {
	switch (type) {
		case TOAST_VARIANTS.INFO:
			return ICON_COLLECTION.info;
		case TOAST_VARIANTS.WARNING:
			return ICON_COLLECTION.warning;
		case TOAST_VARIANTS.ERROR:
			return ICON_COLLECTION.x_octagon;
		case TOAST_VARIANTS.SUCCESS:
			return ICON_COLLECTION.check_circle;
	}
}

export interface ToastProps {
	variant?: TOAST_VARIANTS;
	title?: string;
	text: string;
	isClosable?: boolean;
	onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
	variant = TOAST_VARIANTS.INFO,
	title,
	text,
	isClosable = true,
	onClose,
}) => {
	return (
		<ToastWrapper withoutTitle={!title} variant={variant}>
			<ToastInformIcon>
				<StyledIcon icon={getIconName(variant)} />
			</ToastInformIcon>
			{title && <ToastTitle variant="h4_primary_bold">{title}</ToastTitle>}
			<ToastText variant="body_3_primary">{text}</ToastText>
			{isClosable && (
				<CloseButton icon={ICON_COLLECTION.cross} onPress={onClose} />
			)}
		</ToastWrapper>
	);
};
