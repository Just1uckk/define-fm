import React from 'react';
import { useMutation } from 'react-query';
import { ToastService } from 'shared/services/toast';

import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';

import { ICoreConfig } from 'shared/types/core-config';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';

interface SettingFieldActionProps {
	label: string;
	field: ICoreConfig;
}

const EVENTS = {
	sendTestEmail: CoreConfigApi.sendTestEmail,
};

export const SettingFieldButton: React.FC<SettingFieldActionProps> = ({
	label,
	field,
}) => {
	const { t } = useTranslation();

	const handlers = field.presentation.events;
	const mutation = useMutation({
		mutationFn: async () => {
			if (handlers?.click && handlers.click in EVENTS) {
				await EVENTS[handlers.click]();
			}
		},
		onSuccess: () => {
			ToastService.showSuccess({
				text: t('settings.completed_action_success'),
			});
		},
	});

	const onClick = () => {
		mutation.mutate();
	};

	return (
		<Button label={label} loading={mutation.isLoading} onClick={onClick} />
	);
};
