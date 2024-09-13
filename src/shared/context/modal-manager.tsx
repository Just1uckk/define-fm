import React, { useContext, useEffect, useState } from 'react';

interface IModalState {
	open: boolean;
	onBeforeOpen?: (...args: any[]) => void;
}

const defaultModalState: IModalState = {
	open: false,
};

interface IModalManagerContext {
	modalPoolCallback: Map<
		string,
		{
			resolve: (args: unknown) => void;
			reject: (args: unknown) => void;
			promise: Promise<unknown>;
		}
	>;
	register: (name: string, params: { onBeforeOpen?: () => void }) => void;
	unregister: (name: string) => void;
	open: (name: string, ...args: any[]) => Promise<unknown>;
	close: (name: string) => void;
	getState: (name: string) => IModalState;
	subscribeStateChanging: (name: string, cb: () => void) => () => void;
}

const ModalManagerContext = React.createContext<IModalManagerContext>({
	modalPoolCallback: new Map(),
	register: () => false,
	unregister: () => false,
	open: () => Promise.resolve(),
	close: () => false,
	getState: () => defaultModalState,
	subscribeStateChanging: () => () => null,
});

export const useModalManager = () => {
	const modalManagerContext =
		useContext<IModalManagerContext>(ModalManagerContext);

	return {
		open: modalManagerContext.open,
		close: modalManagerContext.close,
	};
};

export const useStateModalManager = (
	name: string,
	{ onBeforeOpen }: { onBeforeOpen?: (...args: any[]) => void } = {},
) => {
	const modalManagerContext =
		useContext<IModalManagerContext>(ModalManagerContext);

	const [, setFakeState] = useState({});

	useEffect(() => {
		console.log(`Register modal: ${name}`);
		modalManagerContext.register(name, { onBeforeOpen });

		const unsubscribe = modalManagerContext.subscribeStateChanging(name, () => {
			setFakeState({});
		});

		return () => {
			modalManagerContext.unregister(name);
			console.log(`Unregister modal: ${name}`);
			unsubscribe();
		};
	}, [name]);

	const resolveCallback = (args?: unknown) => {
		modalManagerContext.modalPoolCallback.get(name)?.resolve(args);
		modalManagerContext.modalPoolCallback.delete(name);
	};

	const rejectCallback = (args?: unknown) => {
		modalManagerContext.modalPoolCallback.get(name)?.reject(args);
		modalManagerContext.modalPoolCallback.delete(name);
	};

	return {
		...modalManagerContext.getState(name),
		close: () => modalManagerContext.close(name),
		openModal: () => modalManagerContext.open(name),
		resolveCallback,
		rejectCallback,
	};
};

const modalPool: Map<string, IModalState> = new Map();
const modalPoolCallback: Map<
	string,
	{
		resolve: (args: unknown) => void;
		reject: (args: unknown) => void;
		promise: Promise<unknown>;
	}
> = new Map();
const modalPoolStateObserver: Map<string, { notify: () => void }> = new Map();

const ModalManagerProvider: React.FC<React.PropsWithChildren> = ({
	children,
}) => {
	const register = (name: string, params: { onBeforeOpen?: () => void }) => {
		const initialState = { ...defaultModalState };

		if (params.onBeforeOpen) {
			initialState.onBeforeOpen = params.onBeforeOpen;
		}

		modalPool.set(name, initialState);
	};

	const unregister = (name: string) => {
		modalPool.delete(name);
		modalPoolCallback.delete(name);
	};

	const subscribeStateChanging = (name: string, cb: () => void) => {
		modalPoolStateObserver.set(name, {
			notify: cb,
		});

		return () => {
			modalPoolStateObserver.delete(name);
		};
	};

	const open = (name: string, ...args: any[]) => {
		const prevState = modalPool.get(name);

		if (!prevState) {
			throw Error(`Could find state with this modal name (${name})`);
		}

		if (prevState.onBeforeOpen) prevState.onBeforeOpen(...args);

		modalPool.set(name, { ...prevState, open: true });

		if (!modalPoolCallback.get(name)) {
			// `!` tell ts that theResolve will be written before it is used
			let theResolve!: (args?: unknown) => void;
			let theReject!: (args?: unknown) => void;
			const promise = new Promise((resolve, reject) => {
				theResolve = resolve;
				theReject = reject;
			});
			modalPoolCallback.set(name, {
				resolve: theResolve,
				reject: theReject,
				promise,
			});
		}

		modalPoolStateObserver.get(name)?.notify();

		return modalPoolCallback.get(name)!.promise;
	};

	const close = (name: string) => {
		modalPool.set(name, { ...modalPool.get(name), open: false });
		modalPoolStateObserver.get(name)?.notify();
	};

	const getState = (name: string) => {
		return modalPool.get(name) ?? defaultModalState;
	};

	return (
		<ModalManagerContext.Provider
			value={{
				register,
				unregister,
				open,
				close,
				getState,
				subscribeStateChanging,
				modalPoolCallback,
			}}
		>
			{children}
		</ModalManagerContext.Provider>
	);
};

export const ModalManager = {
	Provider: ModalManagerProvider,
};
