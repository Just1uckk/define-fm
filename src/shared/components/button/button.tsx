import React, {
	ButtonHTMLAttributes,
	ComponentType,
	forwardRef,
	useRef,
} from 'react';
import { useButton } from 'react-aria';
import { FocusableProps, PressEvents } from '@react-types/shared';
import clsx from 'clsx';
import { getVariantCSS } from 'shared/utils/utils';
import styled, { css } from 'styled-components';
import { compose, space, SpaceProps } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

import { buttonVariants } from 'shared/components/button/button-variants';
import { Icon, IconProps } from 'shared/components/icon/icon';
import { Spinner } from 'shared/components/spinner/spinner';

const ButtonContent = styled.div<Pick<ButtonProps, 'alignContent'>>`
	display: flex;
	align-items: center;
	transition: opacity 0.3s ease;

	${({ alignContent }) =>
		alignContent &&
		css`
			margin: 0 auto;
		`}
`;

const ButtonLabel = styled.span``;

const StyledIcon = styled(Icon)`
	color: currentColor;

	svg {
		width: 16px;
		height: 14px;
	}
`;

const StyledButton = styled.button<
	ThemeProps & { variant: ButtonVariants; fulfilled?: boolean } & SpaceProps
>`
	position: relative;
	display: inline-flex;
	align-items: center;
	padding: 0.7rem 0.9rem;
	font-size: 1rem;
	line-height: 1.1875rem;
	font-weight: 700;
	border-radius: 0.5rem;
	background: transparent;
	letter-spacing: 0.3px;
	cursor: pointer;
	border: 1px solid transparent;
	text-decoration: none;
	transition: background-color 0.3s ease;
	color: var(--color);

	${({ fulfilled }) =>
		fulfilled &&
		css`
			flex-grow: 1;
		`};

	&.icon-left {
		${ButtonContent} {
			flex-direction: row-reverse;
		}

		${ButtonLabel} {
			margin-left: 0.8rem;
		}
	}

	&.icon-right {
		${ButtonLabel} {
			margin-right: 0.8rem;
		}
	}

	&.loading ${ButtonContent} {
		opacity: 0;
	}

	&.is-active .button__content-icon {
		transform: rotate(180deg);
	}

	${getVariantCSS(buttonVariants, 'variant')};

	&:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	&:visited {
		color: var(--color);
	}

	&& {
		${compose(space)}
	}
`;

const StyledSpinner = styled(Spinner)`
	position: absolute;
	top: 50%;
	left: 50%;
	color: currentColor;
	transform: translate(-50%, -50%);
`;

type ButtonVariants =
	| 'primary'
	| 'primary_outlined'
	| 'white'
	| 'primary_ghost'
	| 'success_outlined';

export interface ButtonProps extends SpaceProps, PressEvents, FocusableProps {
	tag?: string | ComponentType<any>;
	value?: string;
	className?: string;
	variant?: ButtonVariants;
	type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
	disabled?: ButtonHTMLAttributes<HTMLButtonElement>['disabled'];
	label?: React.ReactNode;
	icon?: IconProps['icon'];
	iconPlace?: 'left' | 'right';
	loading?: boolean;
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	alignContent?: boolean;
	fulfilled?: boolean;
	to?: string;
}

export const _Button: React.ForwardRefRenderFunction<
	HTMLButtonElement,
	ButtonProps
> = (
	{
		value,
		type = 'submit',
		tag = 'button',
		to,
		className,
		variant = 'primary',
		label,
		disabled,
		icon,
		iconPlace = 'left',
		loading,
		onClick,
		alignContent,
		fulfilled,
		...props
	},
	ref,
) => {
	const localRef = useRef<HTMLButtonElement>(null);
	const { buttonProps } = useButton(
		{
			...props,
			type: type,
			onPress: loading || disabled ? undefined : props.onPress,
			isDisabled: disabled,
		},
		localRef,
	);

	return (
		<StyledButton
			value={value}
			ref={ref}
			as={tag}
			to={to}
			variant={variant}
			className={clsx(
				className,
				'button',
				{ loading: loading },
				{ 'icon-left': iconPlace === 'left' && !!icon },
				{ 'icon-right': iconPlace === 'right' && !!icon },
			)}
			fulfilled={fulfilled}
			{...buttonProps}
			onClick={loading || disabled ? undefined : onClick}
		>
			<ButtonContent alignContent={alignContent} className="button__content">
				{label && (
					<ButtonLabel className="button__content-label">{label}</ButtonLabel>
				)}
				{icon && <StyledIcon className="button__content-icon" icon={icon} />}
			</ButtonContent>
			{loading && <StyledSpinner className="button__spinner" />}
		</StyledButton>
	);
};

export const Button = forwardRef(_Button);
