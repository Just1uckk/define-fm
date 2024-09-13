import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter } from 'react-router-dom';
import App from 'app/App';
import jwtDecode from 'jwt-decode';
import { ModalManager } from 'shared/context/modal-manager';
import { LocalStorageService } from 'shared/services/local-storage-service';
import { ThemeProvider } from 'styled-components';

import { useAuthState } from 'app/store/auth/auth-slice';
import { useUserStore } from 'app/store/user/user-slice';

import { axios } from 'app/settings/axios/axios';
import { Theme } from 'app/settings/theme/theme';

import { IToken } from 'shared/types/auth';

import './app/settings/i18n/i18n';

import * as serviceWorker from './serviceWorker';

import 'app/styles.scss';

(function () {
	if (LocalStorageService.get('token')) {
		const authStore = useAuthState.getState();
		const decodedJwtToken: IToken = jwtDecode(LocalStorageService.get('token'));

		const currentTime = Date.now() / 1000;
		const isExpired = decodedJwtToken.exp <= currentTime;

		if (!isExpired) {
			authStore.setUserData({ username: decodedJwtToken.sub });
			authStore.setIsAuth(true);
		}

		if (isExpired) {
			authStore.resetState();
			useUserStore.getState().setUser(null);
		}
	}
})();

axios.interceptors.response.use(
	(res) => {
		const token = res.headers?.authorization;

		if (token) {
			LocalStorageService.set('token', 'Bearer ' + token);
		}

		return res;
	},
	(error) => {
		const authStore = useAuthState.getState();

		if (error.response?.status === 403 && authStore.isAuth) {
			authStore.resetState();
			useUserStore.getState().setUser(null);
		}

		return Promise.reject(error);
	},
);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(
	<BrowserRouter basename="/app">
		<ModalManager.Provider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider theme={Theme}>
					<App />
					<ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
				</ThemeProvider>
			</QueryClientProvider>
		</ModalManager.Provider>
	</BrowserRouter>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
