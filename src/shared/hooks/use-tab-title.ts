import React from 'react';

import { APP_TITLE } from 'shared/constants/constans';

export function useTitle(title) {
	React.useInsertionEffect(() => {
		if (title) {
			document.title = `${APP_TITLE} | ${title}`;
			return;
		}

		document.title = APP_TITLE;

		return () => {
			document.title = APP_TITLE;
		};
	}, [title]);
}
