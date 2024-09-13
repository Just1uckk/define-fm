import React from 'react';
import { toast, ToastOptions, UpdateOptions } from 'react-toastify';
import { ToastContentProps } from 'react-toastify/dist/types';

import {
	Toast,
	TOAST_VARIANTS,
	ToastProps,
} from 'shared/components/toats/toast';

type ToastId = React.ReactText;
type ToastContent =
	| React.ReactNode
	| ((props: ToastContentProps) => React.ReactNode);

type ToastBaseOptions = ToastOptions;
type SpecificToastOptions = Omit<ToastProps, 'variant'>;

abstract class ToastServiceAbstract {
	abstract show: (content: ToastContent, options?: ToastBaseOptions) => ToastId;
	abstract update: (toastId: ToastId, options?: UpdateOptions) => void;

	abstract closeOne: (toastId: ToastId) => void;
	abstract closeAll: () => void;

	abstract isActive: (toastId: ToastId) => boolean;
}

class _ToastService implements ToastServiceAbstract {
	show(content: ToastContent, options?: ToastBaseOptions): ToastId {
		return toast(content, options);
	}

	update(toastId: ToastId, options?: UpdateOptions) {
		toast.update(toastId, options);
	}

	closeOne(toastId: ToastId) {
		toast.dismiss(toastId);
	}

	closeAll() {
		toast.dismiss();
	}

	isActive(toastId: ToastId) {
		return toast.isActive(toastId);
	}
}

class ToastFacade {
	private readonly toastService: ToastServiceAbstract;

	constructor(toastService: ToastServiceAbstract) {
		this.toastService = toastService;
	}

	show(content: ToastContent, options?: ToastBaseOptions): ToastId {
		return this.toastService.show(content, options);
	}

	showInfo(options: SpecificToastOptions) {
		return this.toastService.show(({ closeToast }) => (
			<Toast onClose={options.onClose || closeToast} {...options} />
		));
	}

	showWarning(options: SpecificToastOptions) {
		return this.toastService.show(({ closeToast }) => (
			<Toast
				variant={TOAST_VARIANTS.WARNING}
				onClose={options.onClose || closeToast}
				{...options}
			/>
		));
	}

	showError(options: SpecificToastOptions) {
		return this.toastService.show(({ closeToast }) => (
			<Toast
				variant={TOAST_VARIANTS.ERROR}
				onClose={options.onClose || closeToast}
				{...options}
			/>
		));
	}

	showSuccess(options: SpecificToastOptions) {
		return this.toastService.show(({ closeToast }) => (
			<Toast
				variant={TOAST_VARIANTS.SUCCESS}
				onClose={options.onClose || closeToast}
				{...options}
			/>
		));
	}

	update(toastId: ToastId, options?: UpdateOptions) {
		this.toastService.update(toastId, options);
	}

	closeOne(toastId: ToastId) {
		this.toastService.closeOne(toastId);
	}

	closeAll() {
		this.toastService.closeAll();
	}

	isActive(toastId: ToastId) {
		return this.toastService.isActive(toastId);
	}
}

export const ToastService = new ToastFacade(new _ToastService());
