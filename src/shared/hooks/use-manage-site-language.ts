import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { LocalStorageService } from 'shared/services/local-storage-service';

import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';
import { UserApi } from 'app/api/user-api/user-api';

import { setUser } from 'app/store/user/user-actions';
import { selectUserData } from 'app/store/user/user-selectors';

import { IUser, LanguageTypes } from 'shared/types/users';

export function useManageSiteLanguage() {
	const queryClient = useQueryClient();
	const currentUser = selectUserData();
	const setUserAction = setUser();
	const { data: languages = [], isLoading } = useQuery({
		queryKey: 'app-languages',
		queryFn: CoreConfigApi.getLanguageList,
		enabled:
			!queryClient.getQueryState('app-languages')?.isFetching &&
			!queryClient.getQueryState('app-languages')?.data,
	});
	const changeLangMutation = useMutation(UserApi.updateUser);
	const { i18n, t } = useTranslation();

	const changLanguage = async (
		lang: LanguageTypes,
		isEditSettings?: boolean,
	) => {
		if (currentUser) {
			await changeLanguageForAuthUser(lang, isEditSettings);
		} else {
			await changeLanguageForNotAuthUser(lang);
		}
	};

	const changeLanguageForAuthUser = async (
		lang: LanguageTypes,
		isEditSettings?: boolean,
	) => {
		const user = currentUser as IUser;
		if (isEditSettings) {
			const response = await changeLangMutation.mutateAsync({
				id: user.id,
				langCode: lang,
			});
			setUserAction(response);
		}
		await i18n.changeLanguage(lang);
		LocalStorageService.set('lang', lang);
	};
	const changeLanguageForNotAuthUser = async (lang: LanguageTypes) => {
		await i18n.changeLanguage(lang);
		LocalStorageService.set('lang', lang);
	};

	return {
		changLanguage,
		t,
		currentLang: i18n.language as LanguageTypes,
		languages,
		isLoadingList: isLoading,
	};
}
