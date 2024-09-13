import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-query';
import { keyBy } from 'lodash';
import styled from 'styled-components';

import { CoreConfigApi } from 'app/api/core-config-api/core-config-api';

import { ICoreConfig } from 'shared/types/core-config';
import { IWorkPackage } from 'shared/types/dispositions';

import { CORE_CONFIG_LIST_QUERY_KEYS } from 'shared/constants/query-keys';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ModalContext, ModalContextProps } from 'shared/components/modal';
import { ModalFooter } from 'shared/components/modal/modal-footer';
import { ModalNavbar } from 'shared/components/modal/modal-navbar';
import { FieldToggle } from 'shared/components/modal-form/field-toggle';
import { FormField } from 'shared/components/modal-form/form-field';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { Text } from 'shared/components/text/text';
import { TextEditorHtml } from 'shared/components/text-editor/text-editor-html';

const Field = styled.div`
	padding-left: 1rem;
	margin-top: 2rem;

	&:first-child {
		margin-top: 0;
	}
`;

const FieldName = styled(Text)``;

const FieldValue = styled(Text)`
	margin-top: 0.2rem;
`;

const Instructions = styled.div`
	max-height: 32.5rem;
	padding: 0.5rem 1rem;
	margin-top: 1.5rem;
	border: ${({ theme }) => theme.border.base};
	border-radius: ${({ theme }) => theme.borderRadius.base};
	overflow-y: auto;
`;

const InstructionsBody = styled(TextEditorHtml)`
	margin-top: 0.6rem;
	color: ${({ theme }) => theme.input.color};
`;

interface AboutDispositionSection {
	disposition: IWorkPackage;
}

export const DispositionInfoModal: React.FC<AboutDispositionSection> = ({
	disposition,
}) => {
	const modalContext = useContext<ModalContextProps>(ModalContext);
	const { t, multilingualT } = useTranslation();
	const { formats } = useDate();

	const { data: defaultSettings } = useQuery({
		queryKey: CORE_CONFIG_LIST_QUERY_KEYS.config_list,
		queryFn: CoreConfigApi.getConfigList,
		select: useCallback((data: ICoreConfig[]) => {
			const groupedList = keyBy(data, 'property');

			return {
				showAutoProcess:
					groupedList['rda.Autoprocess.AllowAutoprocessOfApproved'].value,
			};
		}, []),
	});

	return (
		<>
			<ModalNavbar onClose={modalContext.onClose} />
			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					{t('disposition.info_modal.title')}
				</HeaderTitle>
			</PageHeader>
			<PageBody>
				<Field>
					<FieldName variant="body_6_secondary">
						{t('disposition.about_form.name')}
					</FieldName>
					<FieldValue variant="body_3_primary">
						{multilingualT({
							field: 'name',
							translations: disposition.multilingual,
							fallbackValue: disposition.name,
						})}
					</FieldValue>
				</Field>
				<Field>
					<FieldName variant="body_6_secondary">
						{t('disposition.about_form.snapshot')}
					</FieldName>
					<FieldValue variant="body_3_primary">
						{formats.base(disposition.snapshotDate)}
					</FieldValue>
				</Field>

				<Instructions>
					<FieldName variant="body_6_secondary">
						{t('disposition.about_form.instructions')}
					</FieldName>

					<InstructionsBody>
						<div
							dangerouslySetInnerHTML={{
								__html: multilingualT({
									field: 'instructions',
									translations: disposition.multilingual,
									fallbackValue: disposition.instructions,
								}) as string,
							}}
						/>
					</InstructionsBody>
				</Instructions>

				<FormField grid={false}>
					<FieldToggle
						label={
							<Text>
								{t('disposition.rda_settings_form.security_override.name')}
							</Text>
						}
						subText={t(
							'disposition.rda_settings_form.security_override.sub_text',
						)}
						checked={Boolean(disposition.securityOverride)}
						justifyContent="space-between"
					/>
				</FormField>
				{defaultSettings?.showAutoProcess !== 'false' && (
					<FormField grid={false}>
						<FieldToggle
							label={
								<Text>
									{t(
										'disposition.rda_settings_form.autoprocess_approved_items.name',
									)}
								</Text>
							}
							subText={t(
								'disposition.rda_settings_form.autoprocess_approved_items.sub_text',
							)}
							justifyContent="space-between"
							checked={Boolean(disposition.autoprocessApprovedItems)}
						/>
					</FormField>
				)}
			</PageBody>
			<ModalFooter>
				<Button
					label={t('components.modal.actions.close')}
					onClick={modalContext.onClose}
				/>
			</ModalFooter>
		</>
	);
};
