import React from 'react';
import SuccessfulImage from 'shared/assets/images/successful_completion_project.svg';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useTranslation } from 'shared/hooks/use-translation';

import { Button } from 'shared/components/button/button';
import { ICON_COLLECTION } from 'shared/components/icon/icon';
import { Image } from 'shared/components/image/image';
import { Text } from 'shared/components/text/text';
import { Title } from 'shared/components/title/title';

const Section = styled.section<ThemeProps>`
	display: flex;
	justify-content: center;
	margin-top: 1rem;
	padding: 2.65rem 1rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: ${({ theme }) => theme.border.base};
	border-radius: ${({ theme }) => theme.borderRadius.base};
`;

const Content = styled.div<ThemeProps>`
	display: flex;
	width: 100%;
	max-width: 812px;
`;

const SectionLeft = styled.div`
	margin-right: 5rem;
`;

const SectionRight = styled.div`
	padding-top: 3.4rem;
`;

interface CompleteReviewSectionProps {
	onComplete: () => void;
	isCompleteLoading: boolean;
}

export const CompleteReviewSection: React.FC<CompleteReviewSectionProps> = ({
	onComplete,
	isCompleteLoading,
}) => {
	const { t } = useTranslation();

	return (
		<Section>
			<Content>
				<SectionLeft>
					<Image src={SuccessfulImage} alt="successful" />
				</SectionLeft>
				<SectionRight>
					<Title variant="h2_primary" mb="0.5rem">
						{t('disposition.table.complete_section.title')}
					</Title>
					<Text variant="body_2_primary" mb="1.5rem">
						<span
							dangerouslySetInnerHTML={{
								__html: t('disposition.table.complete_section.description'),
							}}
						/>
					</Text>
					<Button
						label={t('disposition.table.complete_section.action')}
						icon={ICON_COLLECTION.chevron_right}
						onClick={onComplete}
						loading={isCompleteLoading}
					/>
				</SectionRight>
			</Content>
		</Section>
	);
};
