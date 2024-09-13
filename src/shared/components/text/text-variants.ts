import { ThemeProps } from 'app/settings/theme/theme';

export const textVariants = (theme: ThemeProps['theme']) => ({
	body_1_primary: {
		fontSize: '1.125rem', //18px
		lineHeight: '1.4375', //23px
		color: theme.text.primaryColor,
		fontWeight: 400,
	},
	body_1_primary_bold: {
		fontSize: '1.125rem', //18px
		lineHeight: '1.4375rem', //23px
		color: theme.text.primaryColor,
		fontWeight: 600,
	},
	body_1_primary_semibold: {
		fontSize: '1.125rem', //18px
		lineHeight: '1.4375rem', //23px
		color: theme.text.primaryColor,
		fontWeight: 700,
	},
	body_1_secondary: {
		fontSize: '1.125rem', //18px
		lineHeight: '1.4375', //23px
		color: theme.colors.secondary,
		fontWeight: 400,
	},
	body_2_secondary: {
		fontSize: '1rem', //16px
		lineHeight: '1.1875rem', //19px
		color: theme.colors.secondary,
		fontWeight: 400,
	},
	body_2_primary: {
		fontSize: '1rem', //16px
		lineHeight: '1.1875rem', //19px
		color: theme.text.primaryColor,
		fontWeight: 400,
	},
	body_2_primary_bold: {
		fontSize: '1rem', //16px
		lineHeight: '1.1875rem', //19px
		color: theme.text.primaryColor,
		fontWeight: 600,
	},
	body_2_primary_semibold: {
		fontSize: '1rem', //16px
		lineHeight: '1.1875rem', //19px
		color: theme.text.primaryColor,
		fontWeight: 700,
	},
	body_3_primary: {
		fontSize: '0.875rem', //14px
		lineHeight: '1.0625rem', //17px
		color: theme.text.primaryColor,
		fontWeight: 400,
	},
	body_3_primary_bold: {
		fontSize: '0.875rem', //14px
		lineHeight: '1.0625rem', //17px
		color: theme.text.primaryColor,
		fontWeight: 600,
	},
	body_3_primary_semibold: {
		fontSize: '0.875rem', //14px
		lineHeight: '1.0625rem', //17px
		color: theme.text.primaryColor,
		fontWeight: 700,
	},
	body_3_secondary: {
		fontSize: '0.875rem', //14px
		lineHeight: '1.0625rem', //17px
		color: theme.colors.secondary,
		fontWeight: 400,
	},
	body_3_secondary_bold: {
		fontSize: '0.875rem', //14px
		lineHeight: '1.0625rem', //17px
		color: theme.colors.secondary,
		fontWeight: 600,
	},
	body_3_secondary_semibold: {
		fontSize: '0.875rem', //14px
		lineHeight: '1.0625rem', //17px
		color: theme.colors.secondary,
		fontWeight: 700,
	},
	body_3_error: {
		fontSize: '0.875rem', //14px
		lineHeight: '1.0625rem', //17px
		color: theme.colors.error,
	},

	body_4_primary: {
		fontSize: '0.75rem', //12px
		lineHeight: '0.875rem', //14px
		color: theme.text.primaryColor,
		fontWeight: 400,
	},
	body_4_primary_semibold: {
		fontSize: '0.75rem', //12px
		lineHeight: '0.875rem', //14px
		color: theme.text.primaryColor,
		fontWeight: 700,
	},
	body_4_secondary: {
		fontSize: '0.75rem', //12px
		lineHeight: '0.875rem', //14px
		color: theme.colors.secondary,
		fontWeight: 400,
	},
	body_4_secondary_bold: {
		fontSize: '0.75rem', //12px
		lineHeight: '0.875rem', //14px
		color: theme.colors.secondary,
		fontWeight: 600,
	},
	body_4_secondary_semibold: {
		fontSize: '0.75rem', //12px
		lineHeight: '0.875rem', //14px
		color: theme.colors.secondary,
		fontWeight: 700,
	},
	body_5_primary: {
		fontSize: '0.875rem', //14px
		lineHeight: '1.125rem', //18px
		color: theme.text.primaryColor,
		fontWeight: 400,
	},
	body_5_secondary: {
		fontSize: '0.875rem', //14px
		lineHeight: '1.3125rem', //21px
		color: theme.colors.secondary,
		fontWeight: 400,
	},
	body_6_secondary: {
		fontSize: '0.6875rem', //11px
		lineHeight: '0.875rem', //14px
		color: theme.colors.secondary,
		fontWeight: 400,
	},
	body_6_error: {
		fontSize: '0.6875rem', //11px
		lineHeight: '0.8125rem', //13px
		color: theme.colors.error,
	},
	help_text: {
		fontSize: '0.6875rem', //11px
		lineHeight: '0.8125rem', //13px
		color: theme.colors.secondary,
	},
});
