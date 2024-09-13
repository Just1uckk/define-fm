import { ThemeProps } from 'app/settings/theme/theme';

import { TOAST_VARIANTS } from 'shared/components/toats/toast';

export const toastStyleVariation = (_: ThemeProps) => ({
	[TOAST_VARIANTS.INFO]: {
		color: '#527FAA',
		background: `#D2E7F3`,
		borderColor: '#8CBCDC',
	},

	[TOAST_VARIANTS.WARNING]: {
		color: '#866E3F',
		background: `#FCF8E4`,
		borderColor: '#D6CD8E',
	},

	[TOAST_VARIANTS.ERROR]: {
		color: '#A53A33',
		background: `#E6C9C6`,
		borderColor: '#B48482',
	},

	[TOAST_VARIANTS.SUCCESS]: {
		color: '#497441',
		background: `#E2F0D9`,
		borderColor: '#B5CBA8',
	},
});
