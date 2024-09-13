import React, { ComponentType, ReactNode } from 'react';
import styled from 'styled-components';
import { compose, space, SpaceProps, variant } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

import { titleVariants } from 'shared/components/title/title-variants';

const StyledTitle = styled.p<
	ThemeProps & { variant: TitleVariants } & SpaceProps
>`
	margin: 0;
	font-weight: 600;
	${({ theme }) => variant({ variants: titleVariants(theme) })};

	${compose(space)}
`;

const TitleTop = styled.div`
	text-overflow: inherit;
	overflow: inherit;
`;

type TitleVariants =
	| 'h1_primary'
	| 'h1_primary_bold'
	| 'h2_primary'
	| 'h2_primary_bold'
	| 'h2_primary_semibold'
	| 'h3_primary'
	| 'h3_primary_semibold'
	| 'h4_primary'
	| 'h4_primary_bold';

const TitleBottom = styled.div<ThemeProps>`
	margin-top: 0.4rem;
	font-size: 0.75rem;
	line-height: 0.875rem;
	color: ${({ theme }) => theme.colors.secondary};
	font-weight: 400;
`;

export interface TitleProps extends SpaceProps {
	className?: string;
	variant?: TitleVariants;
	tag?: string | ComponentType<any>;
	subHeader?: React.ReactNode;
	subSubHeader?: React.ReactNode;
	children?: ReactNode;
}

const tags = {
	h1_primary: 'h1',
	h1_primary_bold: 'h1',
	h2_primary: 'h2',
	h2_primary_bold: 'h2',
	h2_primary_semibold: 'h2',
	h3_primary: 'h3',
	h3_primary_semibold: 'h3',
	h4_primary: 'h4',
	h4_primary_bold: 'h4',
};

const TitleComponent: React.FC<TitleProps> = ({
	variant = 'h1_primary',
	className,
	tag,
	children,
	subHeader,
	subSubHeader,
	...props
}) => {
	return (
		<StyledTitle
			as={tag ? tag : tags[variant]}
			className={className}
			variant={variant}
			{...props}
		>
			<TitleTop>{children}</TitleTop>
			{subHeader && <TitleBottom>{subHeader}</TitleBottom>}
			{subSubHeader && <TitleBottom>{subSubHeader}</TitleBottom>}
		</StyledTitle>
	);
};

export const Title = React.memo(TitleComponent);
