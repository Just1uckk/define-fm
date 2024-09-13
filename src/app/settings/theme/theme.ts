export const THEME_COLORS = {
	primary: '#14295E',
	primary_rgb: '20 41 94',
	accent: '#4574F6',
	secondary: '#838A95',
	accentDark: '#2C57DCFF',
	white: '#fff',
	white_rgb: '255,255,255',
	white_light: '#d7d7d8',
	white_light_rgb: '215 215 216',

	backgroundPrimary: {
		light: 'rgb(248, 250, 253)',
		dark: '#1b1b1f',
		dark_rgb: '181 196 255',
	},

	backgroundSecondary: {
		light: '#fff',
		dark: '#272727',
	},

	borderColorPrimary: {
		light: '#F0F0F0',
		dark: '#353535',
	},

	grey: {
		style_0: '#F0F0F0',
		style_0_inverted: '#0f0f0f',
		style_1: '#C4C4C4',
		style_2: '#838A95',
	},

	blue: {
		primary: '#4574F6',
		secondary: '#ECF4FD',
		secondary_inverted: '#ECF4FD',
		style_1: 'rgba(69, 116, 246, 0.3)',
		style_2: '#6FACF0',
	},
	yellow: {
		style_1: '#F7BA40',
	},
	red: {
		style_1: '#DA5F5B',
		style_2: '#F8E2E1',
	},
	green: {
		style_1: '#71C879',
		style_2: '#edfdef',
		style_3: '#83C79A',
	},
} as const;

export const Theme = {
	colors: {
		...THEME_COLORS,
		primary: 'var(--palette-primary)',
		primary_rba: 'var(--palette-primary-rgb)',
		secondary: 'var(--palette-secondary)',
		accent: 'var(--palette-accent)',
		white: 'var(--palette-white)',
		white_inverted: 'var(--palette-white-inverted)',

		background: {
			primary: 'var(--background-primary)',
			secondary: 'var(--background-secondary)',
		},

		error: THEME_COLORS.red.style_1,

		blue: {
			...THEME_COLORS.blue,
			secondary_inverted: 'var(--pallet-blue-secondary-inverted)',
		},

		borderColorPrimary: 'var(--border-color-primary)',

		backgroundPrimary: 'var(--background-primary)',
		backgroundSecondary: 'var(--background-secondary)',
	},
	langButton: {
		iconColor: 'var(--palette-secondary)',
		active: {
			bg: 'var(--pallet-blue-secondary-inverted)',
			iconColor: THEME_COLORS.accent,
		},
	},

	border: {
		base: `1px solid var(--border-color-primary)`,
		base_dashed: `1px dashed var(--border-color-primary)`,
	},

	icon: {
		color: 'var(--icon-color)',
	},
	input: {
		color: 'var(--primary-text-color)',
		bg: 'rgb(var(--background-primary) / 0.04)',
		labelColor: 'var(--palette-secondary)',
		borderColor: 'var(--border-color-primary)',
		focus: {
			borderColor: 'var(--palette-accent)',
		},
		disabled: {
			bg: 'var(--pallet-grey-o-inverted)',
		},
	},

	toggle: {
		bg_off: 'rgba(69, 116, 246, 0.3)',
	},

	search_bar: {
		color: 'var(--primary-text-color)',
		bg: 'var(--background-secondary)',
		borderColor: 'var(--border-color-primary)',

		focus: {
			borderColor: 'var(--palette-accent)',
		},
	},

	text: {
		primaryColor: 'var(--primary-text-color)',
		whiteText: 'var(--white-text-color)',
	},

	title: {
		primaryColor: 'var(--primary-text-color)',
	},

	buttons: {
		primary_outlined: {
			color: 'var(--primary-text-color)',
			background: 'transparent',
			borderColor: 'transparent',
			hover: {
				background: `rgb(var(--palette-primary-rgb) / 0.1)`,
			},
		},
		primary: {
			color: 'var(--white-text-color)',
			background: 'var(--palette-accent)',
			borderColor: 'var(--palette-accent)',
			hover: {
				background: 'var(--palette-accent-dark)',
			},
		},
		disabled: {
			color: 'var(--palette-secondary)',
			background: 'var(--border-color-primary)',
			borderColor: 'var(--border-color-primary)',
		},
	},
	radioButtons: {
		color: 'var(--palette-accent)',
		textColor: 'var(--primary-text-color)',
		bg: 'var(--background-secondary)',
		borderColor: 'var(--palette-secondary)',
	},

	shadow: {
		base: '0px 2px 1px rgba(0, 0, 0, var(--box-shadow-opacity, 0.15))',
	},

	dropdownOption: {
		active: {
			color: THEME_COLORS.accent,
			backgroundColor: 'var(--pallet-blue-secondary-inverted)',
		},
	},
	userAvatarMore: {
		color: 'var(--primary-text-color)',
		bg: 'var(--pallet-blue-secondary-inverted)',
	},
	progressBar: {
		color: 'var(--primary-text-color)',
		bg: 'var(--progress-bar-bg)',
		progress: THEME_COLORS.accent,
		progressOutstanding: THEME_COLORS.red.style_1,
		progressAlmostOutstanding: THEME_COLORS.yellow.style_1,
	},
	badgeGroup: {
		color: 'var(--primary-text-color)',
		bg: 'var(--pallet-blue-secondary-inverted)',
	},
	dropzone: {
		color: 'var(--palette-accent)',
		bg: 'var(--pallet-blue-secondary-inverted)',
		borderColor: 'var(--palette-accent)',
		active: {
			bg: THEME_COLORS.blue.style_1,
		},
	},
	groupButton: {
		borderColor: THEME_COLORS.grey.style_1,
	},
	datePicker: {
		background: 'var(--palette-white-inverted)',
		borderColor: 'var(--border-color-primary)',
		boxShadowColor: 'rgba(0, 0, 0, var(--box-shadow-opacity, 0.15))',
		dataElement: {
			color: 'var(--white-text-color)',
			borderColor: 'var(--palette-accent)',
			daysOfWeekColor: THEME_COLORS.grey.style_2,
			disabledColor: 'var(--border-color-primary)',
			active: {
				color: 'var(--white-text-color)',
				background: 'var(--palette-accent)',
			},
		},
		navButton: {
			background: 'var(--border-color-primary)',
			disabledColor: THEME_COLORS.grey.style_2,
		},
	},
	textEditor: {
		editor: {
			linkColor: 'var(--palette-accent)',
		},
		toolbarItem: {
			separatorColor: 'var(--border-color-primary)',
			color: 'var(--palette-secondary)',
			active: {
				color: 'var(--palette-accent)',
				bg: 'var(--pallet-blue-secondary-inverted)',
			},
		},
	},

	dispositionCard: {
		bg: 'var(--background-secondary)',
		primaryColor: 'var(--palette-primary)',
		secondaryColor: 'var(--palette-secondary)',
		borderColor: 'var(--border-color-primary)',
	},
	tooltip: {
		primary: {
			color: 'var(--palette-white)',
			bg: 'var(--tooltip-bg)',
		},
		secondary: {
			color: 'var(--primary-text-color)',
			bg: 'var(--background-secondary)',
		},
	},
	badge: {
		filter: 'brightness(var(--badge-brightness, 1))',

		blue: {
			color: THEME_COLORS.blue.style_2,
			bg: THEME_COLORS.blue.secondary,
			borderColor: THEME_COLORS.blue.secondary,
		},
		green: {
			color: THEME_COLORS.green.style_1,
			bg: THEME_COLORS.green.style_2,
			borderColor: THEME_COLORS.green.style_2,
		},
		red: {
			color: THEME_COLORS.red.style_1,
			bg: THEME_COLORS.red.style_2,
			borderColor: THEME_COLORS.red.style_2,
		},
		grey: {
			color: 'var(--palette-secondary)',
			bg: THEME_COLORS.grey.style_0,
			borderColor: THEME_COLORS.grey.style_0,
		},
		grey_white: {
			color: 'var(--palette-secondary)',
			bg: 'var(--background-secondary)',
			borderColor: THEME_COLORS.grey.style_0,
		},
	},
	checkbox: {
		color: 'var(--palette-accent)',
		textColor: 'var(--primary-text-color)',
		bg: 'var(--background-secondary)',
		borderColor: 'var(--palette-secondary)',
	},

	header: {
		background: 'var(--background-primary)',
	},

	app_navigator: {
		background: 'var(--background-secondary)',
		nav_link: {
			color: 'var(--palette-secondary)',
			background: 'transparent',
		},
		active_nav_link: {
			color: 'var(--palette-accent)',
			background: 'var(--background-primary)',
		},
	},
	tabs: {
		tabCounter: {
			color: 'var(--palette-secondary)',
			backgroundColor: 'var(--pallet-blue-secondary-inverted)',
		},
		tabCounterActive: {
			color: 'var(--white-text-color)',
			backgroundColor: 'var(--palette-accent)',
		},

		activeIndicator: {
			color: 'var(--palette-accent)',
			backgroundColor: 'var(--border-color-primary)',
		},
	},

	borderRadius: {
		base: '0.5rem', //8px
		secondary: '0.25rem', //4px
	},

	image_brightness: 'var(--image-brightness, 1)',
} as const;

export type ThemeType = typeof Theme;

export interface ThemeProps {
	theme: ThemeType;
}
