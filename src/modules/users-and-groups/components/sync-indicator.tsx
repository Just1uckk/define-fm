import React from 'react';

import { THEME_COLORS } from 'app/settings/theme/theme';

import {
	Indicator,
	IndicatorProps,
} from 'shared/components/indicator/indicator';

interface SyncIndicatorProps extends Omit<IndicatorProps, 'background'> {
	className?: string;
	isSynced?: boolean;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
	className,
	isSynced,
	...props
}) => {
	const color = isSynced
		? THEME_COLORS.green.style_1
		: THEME_COLORS.red.style_1;

	return <Indicator className={className} background={color} {...props} />;
};
