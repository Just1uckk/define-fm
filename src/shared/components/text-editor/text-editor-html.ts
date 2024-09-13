import styled from 'styled-components';

import { Text } from 'shared/components/text/text';
import { textVariants } from 'shared/components/text/text-variants';
import { titleVariants } from 'shared/components/title/title-variants';

export const TextEditorHtml = styled(Text)`
	& *::marker {
		color: ${({ theme }) => theme.colors.primary};
	}

	&:focus-visible {
		outline: none;
	}

	& *:first-child {
		margin-top: 0;
	}

	& > * {
		margin: 0.75rem 0 0;
		${({ theme }) => textVariants(theme).body_2_primary}
	}

	.ql-align-right {
		text-align: right;
	}

	.ql-align-center {
		text-align: center;
	}

	.ql-align-justify {
		text-align: justify;
	}

	ul,
	ol {
		margin: 1.2rem 0;
		padding-left: 1.875rem;
	}

	li {
		margin: 0;
	}

	h1 {
		margin-top: 2rem;
		${({ theme }) => titleVariants(theme).h1_primary_bold}
	}

	h2 {
		margin-top: 2rem;
		${({ theme }) => titleVariants(theme).h2_primary}
	}

	h3 {
		margin-top: 1.5rem;
		${({ theme }) => titleVariants(theme).h3_primary}
	}

	a {
		color: ${({ theme }) => theme.textEditor.editor.linkColor};
		text-decoration: underline;
	}
`;
