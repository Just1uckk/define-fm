import { ThemeProps } from 'app/settings/theme/theme';

export const titleVariants = (theme: ThemeProps['theme']) => ({
	h1_primary: {
		fontSize: '2rem', //32px
		lineHeight: '2.625rem', //42px
		color: theme.title.primaryColor,
		letterSpacing: '0.02em',
	},
	h1_primary_bold: {
		fontSize: '2rem', //32px
		lineHeight: '2.625rem', //42px
		fontWeight: 600,
		color: theme.title.primaryColor,
		letterSpacing: '0.02em',
	},
	h2_primary: {
		fontSize: '1.5rem', // 24px
		lineHeight: '2.125rem', // 34px
		color: theme.title.primaryColor,
	},
	h2_primary_bold: {
		fontSize: '1.5rem', // 24px
		lineHeight: '2.125rem', // 34px
		color: theme.title.primaryColor,
		fontWeight: 600,
	},
	h2_primary_semibold: {
		fontSize: '1.5rem', // 24px
		lineHeight: '2.125rem', // 34px
		color: theme.title.primaryColor,
		fontWeight: 700,
	},
	h3_primary: {
		fontSize: '1.125rem', // 18px
		lineHeight: '1.4375rem', // 23px
		color: theme.title.primaryColor,
	},
	h3_primary_semibold: {
		fontSize: '1.125rem', // 18px
		lineHeight: '1.4375rem', // 23px
		color: theme.title.primaryColor,
		fontWeight: 700,
	},
	h4_primary: {
		fontSize: '1rem', // 16px
		lineHeight: '1.375rem', // 22px
		color: theme.title.primaryColor,
	},
	h4_primary_bold: {
		fontSize: '1rem', // 16px
		lineHeight: '1.375rem', // 22px
		color: theme.title.primaryColor,
		fontWeight: 600,
	},
});
