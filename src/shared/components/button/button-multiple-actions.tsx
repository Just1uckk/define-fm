import React from 'react';
import clsx from 'clsx';
import { getVariantCSS } from 'shared/utils/utils';
import styled, { css } from 'styled-components';
import { compose, space, SpaceProps } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

import { buttonVariants } from 'shared/components/button/button-variants';
import {
	MoreButton,
	MoreButtonProps,
} from 'shared/components/button/more-button';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { Spinner } from 'shared/components/spinner/spinner';

const Wrapper = styled.div<
	ThemeProps & { variant: ButtonVariants; fulfilled?: boolean }
>`
	display: flex;

	${({ fulfilled }) =>
		fulfilled &&
		css`
			flex-grow: 1;
		`}
`;

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
	background: transparent;
	letter-spacing: 0.3px;
	cursor: pointer;
	border: 1px solid;
	border-radius: 0.5rem;
	text-decoration: none;
	transition: background-color 0.3s ease;
	color: var(--color);

	&.has-actions {
		border-radius: 0;
		border-top-left-radius: 0.5rem;
		border-bottom-left-radius: 0.5rem;
	}

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

	${getVariantCSS(buttonVariants, 'variant')};

	&:disabled {
		opacity: 0.3;
		cursor: not-allowed;
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

const ToggleMenu = styled(MoreButton)<
	ThemeProps & { variant: ButtonVariants; fulfilled?: boolean } & SpaceProps
>`
	height: 100%;
	padding-left: 1.25rem;
	padding-right: 1.25rem;
	border-left: 1px solid;
	border-radius: initial;
	border-top-right-radius: 0.5rem;
	border-bottom-right-radius: 0.5rem;
	color: var(--color);

	${getVariantCSS(buttonVariants, 'variant')};

	border-color: currentColor;
`;

type ButtonVariants =
	| 'primary'
	| 'primary_outlined'
	| 'primary_ghost'
	| 'success_outlined';

export interface ButtonProps extends SpaceProps {
	className?: string;
	variant?: ButtonVariants;
	label?: React.ReactNode;
	iconPlace?: 'left' | 'right';
	alignContent?: boolean;
	fulfilled?: boolean;
	options: MoreButtonProps['options'];
}

export const ButtonMultipleActions: React.FC<ButtonProps> = ({
	className,
	variant = 'primary',
	iconPlace = 'left',
	alignContent,
	fulfilled,
	options,
	...props
}) => {
	if (!options.length) return null;

	const [mainAction, ...restActions] = options;

	if (!mainAction) return null;

	return (
		<Wrapper
			variant={variant}
			className={clsx('button', className, variant)}
			{...props}
		>
			<StyledButton
				variant={variant}
				as={mainAction.tag}
				to={mainAction.to}
				type={mainAction.type}
				className={clsx(
					{ loading: mainAction.loading },
					{ 'has-actions': !!restActions.length },
					{ 'icon-left': iconPlace === 'left' && !!mainAction.icon },
					{ 'icon-right': iconPlace === 'right' && !!mainAction.icon },
				)}
				fulfilled={fulfilled}
				disabled={mainAction.disabled}
				onClick={
					mainAction.loading || mainAction.disabled
						? undefined
						: mainAction.onSelect
				}
			>
				<ButtonContent alignContent={alignContent} className="button__content">
					{mainAction.label && (
						<ButtonLabel className="button__content-label">
							{mainAction.label}
						</ButtonLabel>
					)}
					{mainAction.icon && (
						<StyledIcon
							className="button__content-icon"
							icon={mainAction.icon}
						/>
					)}
				</ButtonContent>
				{mainAction.loading && <StyledSpinner />}
			</StyledButton>

			{!!restActions.length && (
				<ToggleMenu
					variant={variant}
					icon={ICON_COLLECTION.chevron_down}
					options={restActions}
					placement="bottom end"
					disabled={mainAction.loading}
				/>
			)}
		</Wrapper>
	);
};
