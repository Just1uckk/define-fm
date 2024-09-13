import { API_BASE_URL } from 'shared/constants/variables';

export const getUserAvatarUrl = (userId: number, profileImageTime: number) => {
	if (!profileImageTime) {
		return undefined;
	}

	return `${API_BASE_URL}/api/coreuser/profile/image/fetch/${userId}/${profileImageTime}`;
};
