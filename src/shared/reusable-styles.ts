import { css } from 'styled-components';

import { THEME_COLORS } from 'app/settings/theme/theme';

export const ScrollStyles = css`
	&::-webkit-scrollbar {
		width: 2px;
		height: 2px;
	}

	&::-webkit-scrollbar-track {
		background-color: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background-color: ${THEME_COLORS.grey.style_2};
		border-radius: 5px;
	}
`;
