import { APP_ROLES } from 'shared/constants/constans';

export const getByPath = (value: object | string | number, path?: string) => {
	if (!path || typeof value !== 'object') {
		return value;
	}

	return path.split('.').reduce((acc, value) => acc[value], value);
};

export const copyToClipboard = (text: string) => {
	if (navigator.clipboard) {
		return navigator.clipboard.writeText(text);
	} else {
		const input = document.createElement('input');
		input.style.position = 'fixed';
		input.style.left = '-99999px';
		input.style.top = '-99999px';
		document.body.appendChild(input);
		input.value = text;
		input.focus();
		input.select();
		return new Promise((res: (value?: unknown) => void, rej) => {
			document.execCommand('copy') ? res() : rej();
			input.remove();
		});
	}
};

export const capitalizeFirstLetter: (string: string) => string = (string) =>
	string.charAt(0).toUpperCase() + string.slice(1);

export const filterGroupsByRoles = (groups: string[] = []) => {
	const roles = Object.values(APP_ROLES);

	return groups.filter((group) => !(roles as string[]).includes(group));
};

export const isImage = (url: string) => {
	return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
};

export const isDate = (dateStr: string) => !isNaN(new Date(dateStr).getDate());

export const getVariantCSS = (variants, variantProp) => (props) => {
	return variants[variantProp][props[variantProp]];
};
