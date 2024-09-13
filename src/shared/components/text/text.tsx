import React, { ComponentType } from 'react';
import styled from 'styled-components';
import { compose, space, SpaceProps, variant } from 'styled-system';

import { ThemeProps } from 'app/settings/theme/theme';

import { textVariants } from 'shared/components/text/text-variants';

const StyledText = styled.p<
	ThemeProps & { variant: TextVariants } & SpaceProps
>`
	margin: 0;
	word-break: break-word;
	${({ theme }) => variant({ variants: textVariants(theme) })}
	${compose(space)}
`;

type TextVariants =
	| 'body_1_primary'
	| 'body_1_primary_bold'
	| 'body_1_primary_semibold'
	| 'body_2_primary'
	| 'body_2_primary_bold'
	| 'body_2_primary_semibold'
	| 'body_3_primary'
	| 'body_3_primary_bold'
	| 'body_3_primary_semibold'
	| 'body_3_error'
	| 'body_4_primary'
	| 'body_4_primary_semibold'
	| 'body_5_primary'
	| 'body_1_secondary'
	| 'body_2_secondary'
	| 'body_3_secondary'
	| 'body_3_secondary_bold'
	| 'body_3_secondary_semibold'
	| 'body_4_secondary'
	| 'body_4_secondary_bold'
	| 'body_4_secondary_semibold'
	| 'body_5_secondary'
	| 'body_6_secondary'
	| 'body_6_error'
	| 'help_text';

export interface TextProps extends SpaceProps {
	className?: string;
	isPositive?: number;
	variant?: TextVariants;
	tag?: string | ComponentType<any>;
}

export const Text: React.FC<React.PropsWithChildren<TextProps>> = ({
	variant = 'body_1_primary',
	isPositive,
	className,
	tag,
	children,
	...props
}) => {
	return (
		<StyledText as={tag} className={className} variant={variant} {...props}>
			{children}
		</StyledText>
	);
};
