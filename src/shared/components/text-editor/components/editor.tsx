import ReactQuill from 'react-quill';
import styled from 'styled-components';

import { THEME_COLORS, ThemeProps } from 'app/settings/theme/theme';

import { textVariants } from 'shared/components/text/text-variants';
import { titleVariants } from 'shared/components/title/title-variants';

export const Editor = styled(ReactQuill)<
	ThemeProps & { translation: Record<string, string> }
>`
	position: relative;
	display: block;
	margin-top: 0.75rem;

	.ql-container {
		position: relative;
		display: block;
		height: 100%;
		margin: 0;
		overflow: hidden;
	}

	.ql-editor {
		position: relative;
		display: block;
		height: 9.5rem;
		overflow: auto;
		word-break: break-all;
		word-break: break-word;
		background-color: transparent;
		color: ${({ theme }) => theme.input.color};

		& *::marker {
			color: ${({ theme }) => theme.input.color};
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
	}

	.ql-tooltip {
		position: absolute;
		display: flex;
		align-items: center;
		height: 2rem;
		padding: 0.375rem 0.75rem;
		border-radius: 0.25rem;
		box-sizing: border-box;
		background-color: ${({ theme }) => theme.tooltip.primary.bg};
		color: ${({ theme }) => theme.tooltip.primary.color};
		transform: translateY(0.3125rem);

		&::before {
			content: '';
			flex-shrink: 0;
			margin-right: 0.625rem;
			color: ${({ theme }) => theme.colors.white};
			width: 0.875rem;
			height: 0.5rem;
			background-image: url("data:image/svg+xml,%3Csvg width='14' height='8' viewBox='0 0 14 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8.50115 7.25038e-06H9.50115C10.4138 -0.00184924 11.2911 0.352881 11.946 0.988574C12.6009 1.62427 12.9816 2.49063 13.0069 3.40297C13.0322 4.3153 12.7001 5.20144 12.0815 5.87245C11.4628 6.54346 10.6065 6.94627 9.69515 6.99501L9.50315 7.00001L8.50315 7.00501C8.37784 7.00627 8.25662 6.96044 8.1635 6.87658C8.07038 6.79273 8.01214 6.67696 8.00032 6.5522C7.9885 6.42744 8.02395 6.3028 8.09967 6.20294C8.17538 6.10308 8.28583 6.0353 8.40915 6.01301L8.49915 6.00501L9.50115 6.00001C10.151 6.00159 10.776 5.75003 11.2436 5.29867C11.7111 4.8473 11.9846 4.23159 12.0059 3.58205C12.0272 2.93251 11.7948 2.3002 11.3578 1.81913C10.9209 1.33806 10.3137 1.04606 9.66515 1.00501L9.50115 1.00001H8.50115C8.3762 1.00024 8.2557 0.953678 8.16336 0.869499C8.07103 0.785319 8.01356 0.669621 8.00227 0.545186C7.99098 0.420751 8.02669 0.296598 8.10237 0.197176C8.17804 0.0977535 8.2882 0.0302674 8.41115 0.00800715L8.50115 7.25038e-06H9.50115H8.50115ZM4.50115 7.25038e-06H5.50115C5.62609 -0.000222763 5.7466 0.0463363 5.83893 0.130516C5.93126 0.214695 5.98873 0.330394 6.00002 0.454829C6.01131 0.579264 5.9756 0.703417 5.89993 0.802839C5.82425 0.902261 5.71409 0.969747 5.59115 0.992007L5.50115 1.00001H4.50115C3.85126 0.998426 3.2263 1.24998 2.75873 1.70135C2.29116 2.15272 2.01774 2.76842 1.99641 3.41796C1.97509 4.0675 2.20753 4.69981 2.64449 5.18088C3.08144 5.66195 3.68856 5.95396 4.33715 5.99501L4.50115 6.00001H5.50115C5.62609 5.99978 5.7466 6.04634 5.83893 6.13052C5.93126 6.21469 5.98873 6.33039 6.00002 6.45483C6.01131 6.57926 5.9756 6.70342 5.89993 6.80284C5.82425 6.90226 5.71409 6.96975 5.59115 6.99201L5.50115 7.00001H4.50115C3.58865 7.00132 2.71171 6.64622 2.05722 6.01037C1.40273 5.37452 1.02245 4.5082 0.997413 3.59604C0.972376 2.68388 1.30457 1.79801 1.92319 1.12722C2.54181 0.456422 3.39795 0.0537475 4.30915 0.00500736L4.50115 7.25038e-06H5.50115H4.50115ZM4.50115 3.00001L9.50115 3.00201C9.62609 3.00178 9.7466 3.04834 9.83893 3.13252C9.93126 3.21669 9.98873 3.33239 10 3.45683C10.0113 3.58126 9.9756 3.70542 9.89993 3.80484C9.82425 3.90426 9.71409 3.97175 9.59115 3.99401L9.50115 4.00201L4.50115 4.00001C4.3762 4.00024 4.2557 3.95368 4.16336 3.8695C4.07103 3.78532 4.01356 3.66962 4.00227 3.54519C3.99098 3.42075 4.02669 3.2966 4.10237 3.19718C4.17804 3.09775 4.2882 3.03027 4.41115 3.00801L4.50115 3.00001Z' fill='${THEME_COLORS.white_light.replace(
				'#',
				'%23',
			)}'/%3E%3C/svg%3E%0A");
			background-repeat: no-repeat;
			background-position: center center;
		}

		a.ql-preview {
			display: block;
			width: 11.25rem;
			padding: 0;
			margin: 0;
			font-size: 0.75rem;
			line-height: 0.75rem;
			color: ${({ theme }) => theme.tooltip.primary.color};
			overflow: hidden;
			text-decoration: none;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		input[type='text'] {
			display: none;
			width: 11.25rem;
			margin: 0;
			padding: 0.125rem 0.25rem;
			font-size: 0.75rem;
			line-height: 0.75rem;
			border: 0.0625rem solid ${({ theme }) => theme.tooltip.primary.color};
			border-radius: 0.1875rem;
			background-color: transparent;
			color: ${({ theme }) => theme.tooltip.primary.color};
			outline: none;

			::-ms-clear {
				display: none;
			}

			::placeholder {
				color: transparent;
			}
		}

		.ql-action {
			margin-left: 0.75rem;
			border-left: 1px solid ${({ theme }) => theme.tooltip.primary.color};

			&::after {
				content: '${({ translation }) => translation.edit}';
				margin-left: 0.75rem;
				cursor: pointer;
			}
		}

		a.ql-remove {
			margin-left: 0.75rem;
			border-left: 1px solid ${({ theme }) => theme.tooltip.primary.color};

			&::before {
				content: '${({ translation }) => translation.remove}';
				margin-left: 0.75rem;
				cursor: pointer;
			}
		}

		&.ql-editing {
			a.ql-action::after {
				content: '${({ translation }) => translation.save}';
			}

			a.ql-remove,
			a.ql-preview {
				display: none;
			}

			input[type='text'] {
				display: block;
			}
		}
	}

	.ql-hidden {
		display: none;
	}
`;
