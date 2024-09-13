import React, { useMemo } from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IDataSyncProvider } from 'shared/types/data-sync-provider';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ButtonList } from 'shared/components/button/button-list';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const StyledIcon = styled(Icon)<ThemeProps>`
	margin-top: 1.875rem;
	color: ${({ theme }) => theme.colors.red.style_1};

	svg {
		width: 2.3rem;
		height: auto;
	}
`;

const ModalBody = styled.div`
	text-align: center;
`;

interface ConfirmAuthProviderDeletingModalProps {
	providers: IDataSyncProvider[];
	isLoading: boolean;
	onAccept: () => void;
	onRegret: () => void;
}

export const ConfirmDataSyncProviderDeletingModal: React.FC<
	ConfirmAuthProviderDeletingModalProps
> = ({ providers, isLoading, onAccept, onRegret }) => {
	const { t, multilingualT, currentLang } = useTranslation();

	const title = useMemo(() => {
		return t(
			'general_settings.data_sync_providers.delete_provider_modal.confirm_text.name',
			{
				count: providers.length,
				name: providers[0]
					? multilingualT({
							field: 'name',
							translations: providers[0].multilingual,
							fallbackValue: providers[0].name,
					  })
					: null,
			},
		);
	}, [providers, currentLang]);

	return (
		<>
			<ModalBody>
				<StyledIcon icon={ICON_COLLECTION.x_octagon} />
				<Title variant="h2_primary_semibold" mt="0.8rem">
					{t(
						'general_settings.data_sync_providers.delete_provider_modal.title',
					)}
				</Title>
				<Text variant="body_1_primary" mt="1.5rem" p="0 2.7rem">
					{t(
						'general_settings.data_sync_providers.delete_provider_modal.confirm_text.before_name',
					)}{' '}
					<Text tag="span" variant="body_1_secondary">
						{title}
					</Text>{' '}
					{t(
						'general_settings.data_sync_providers.delete_provider_modal.confirm_text.after_name',
						{
							count: providers.length,
						},
					)}
				</Text>
				<Text variant="body_1_primary">
					{t(
						'general_settings.data_sync_providers.delete_provider_modal.warning_text',
					)}
				</Text>
			</ModalBody>
			<ModalFooter>
				<ButtonList justifyContent="center">
					<Button
						type="button"
						variant="primary_outlined"
						label={t(
							'general_settings.data_sync_providers.delete_provider_modal.actions.cancel',
						)}
						onClick={onRegret}
						disabled={isLoading}
					/>
					<Button
						icon={ICON_COLLECTION.delete}
						label={t(
							'general_settings.data_sync_providers.delete_provider_modal.actions.accept',
						)}
						onClick={onAccept}
						loading={isLoading}
					/>
				</ButtonList>
			</ModalFooter>
		</>
	);
};
