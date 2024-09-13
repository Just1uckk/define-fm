import { ThemeProps } from 'app/settings/theme/theme';

export const tooltipVariants = (theme: ThemeProps['theme']) => ({
	primary: {
		color: theme.tooltip.primary.color,
		backgroundColor: theme.tooltip.primary.bg,
	},
	secondary: {
		color: theme.tooltip.secondary.color,
		backgroundColor: theme.tooltip.secondary.bg,
	},
});
