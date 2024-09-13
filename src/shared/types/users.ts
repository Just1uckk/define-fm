import { ICoreConfig, ICoreLang } from 'shared/types/core-config';

import { APP_ROLES } from 'shared/constants/constans';

export interface IUser {
	id: number;
	username: string;
	password: string;
	display: string;
	profileImage: number;
	enabled: boolean;
	email: string;
	providerId: number;
	groups: string[];
	roles: Array<APP_ROLES>;
	langCode: LanguageTypes;
	deleted: boolean;
}

export type LanguageTypes = ICoreLang['code'];

export interface IUsersCount {
	providerId: number;
	providerName: string;
	enabled: number;
	disabled: number;
	total: number;
}

export type ValidationPasswordErrors = {
	hasValue?: string;
	notContainDigit?: boolean;
	notContainSymbol?: boolean;
	notContainLower?: boolean;
	notContainUpper?: boolean;
	minLength?: boolean;
	maxLength?: boolean;
};

export type PasswordSettings = {
	max: ICoreConfig;
	min: ICoreConfig;
	shouldContainDigit: ICoreConfig;
	shouldContainLower: ICoreConfig;
	shouldContainUpper: ICoreConfig;
	shouldContainSymbol: ICoreConfig;
};
