import { ThemeProps } from 'app/settings/theme/theme';

export const badgeVariants = (theme: ThemeProps['theme']) => ({
	blue: {
		color: theme.badge.blue.color,
		backgroundColor: theme.badge.blue.bg,
		borderColor: theme.badge.blue.borderColor,
	},
	red: {
		color: theme.badge.red.color,
		backgroundColor: theme.badge.red.bg,
		borderColor: theme.badge.red.borderColor,
	},
	grey: {
		color: theme.badge.grey.color,
		backgroundColor: theme.badge.grey.bg,
		borderColor: theme.badge.grey.borderColor,
	},
	grey_white: {
		color: theme.badge.grey.color,
		backgroundColor: theme.badge.grey_white.bg,
		borderColor: theme.badge.grey_white.borderColor,
	},
	green: {
		color: theme.badge.green.color,
		backgroundColor: theme.badge.green.bg,
		borderColor: theme.badge.green.borderColor,
	},
});
