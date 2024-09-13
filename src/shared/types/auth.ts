import { IUser } from 'shared/types/users';

export interface IToken {
	sub: IUser['username'];
	exp: number;
	iat: number;
	authorities: Array<{ authority: string }>;
}
