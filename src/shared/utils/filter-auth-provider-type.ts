import { IAuthProviderType } from 'shared/types/auth-provider';

export const filterAuthProviderTypeByInstance = (list: IAuthProviderType[]) =>
	list.filter((type) => !(type.singleton && type.instanceCount > 0));
