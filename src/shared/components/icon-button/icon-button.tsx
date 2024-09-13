import React, {
	ButtonHTMLAttributes,
	ElementType,
	forwardRef,
	MouseEventHandler,
	useCallback,
	useRef,
} from 'react';
import { AriaButtonProps, useButton } from 'react-aria';
import mergeRefs from 'shared/utils/merge-refs';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { Icon, IconProps } from 'shared/components/icon/icon';

const Button = styled.button<ThemeProps>`
	--active-bg-color: ${({ theme }) => theme.colors.background.primary};

	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	width: 2rem;
	height: 2rem;
	padding: 0;
	color: ${({ theme }) => theme.colors.primary};
	background-color: transparent;
	border: none;
	border-radius: 50%;
	transition: background-color 0.3s, color 0.3s ease;

	&:hover {
		color: ${({ theme }) => theme.colors.accent};
		background-color: var(--active-bg-color);
	}

	&:disabled {
		opacity: 0.5;
	}
`;

const StyledIcon = styled(Icon)`
	color: currentColor;
`;

export function usePropagatableClickHandler<T>(
	onClick: MouseEventHandler<T> | undefined,
) {
	const isEventRealRef = useRef(true);

	const handleClick: MouseEventHandler<T> = useCallback(
		(event) => {
			const { target, nativeEvent } = event;
			event.preventDefault();
			event.stopPropagation();

			const clonedNativeEvent = new MouseEvent('click', nativeEvent);

			if (!isEventRealRef.current) {
				isEventRealRef.current = true;
				return;
			}

			onClick?.(event);

			if (event.isPropagationStopped()) {
				isEventRealRef.current = false;
				target.dispatchEvent(clonedNativeEvent);
			}
		},
		[onClick],
	);

	return handleClick;
}

export interface IconButtonProps extends AriaButtonProps<ElementType<any>> {
	className?: string;
	tag?: AriaButtonProps<ElementType<any>>['elementType'];
	icon: IconProps['icon'];
	tabIndex?: ButtonHTMLAttributes<HTMLButtonElement>['tabIndex'];
	preventFocusOnPress?: boolean;
}

const IconButtonComponent: React.ForwardRefRenderFunction<
	HTMLButtonElement,
	IconButtonProps
> = ({ className, tag = 'button', icon, ...props }, ref) => {
	const localRef = useRef<HTMLButtonElement>(null);
	const { buttonProps } = useButton(
		{
			...props,
			elementType: tag,
		},
		localRef,
	);
	const onClick = usePropagatableClickHandler(buttonProps.onClick);

	return (
		<Button
			as={tag}
			ref={mergeRefs(ref, localRef)}
			className={className}
			{...buttonProps}
			onClick={onClick}
		>
			<StyledIcon icon={icon} />
		</Button>
	);
};

export const IconButton = forwardRef(IconButtonComponent);
