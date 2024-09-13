import React, { useState } from 'react';
import { parseFileFullPath } from 'shared/utils/parse-file-full-path';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IFile } from 'shared/types/dispositions';

import { useTranslation } from 'shared/hooks/use-translation';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { IconButton } from 'shared/components/icon-button/icon-button';
import { Text } from 'shared/components/text/text';

const Container = styled.div<ThemeProps>`
	display: flex;
	padding: 1rem;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	border-radius: 0.625rem;
`;

const ContainerLeft = styled.div`
	padding-left: 0.15rem;
	margin-right: 1rem;
	height: 24px;
`;

const ContainerRight = styled.div`
	padding-top: 0.15rem;
	flex-grow: 1;
`;

const Header = styled.div`
	position: relative;
	padding-right: 1.5rem;
	cursor: pointer;
`;

const CollapseButton = styled(IconButton)`
	position: absolute;
	top: 1px;
	right: -1px;
`;

const Breadcrumbs = styled.div`
	display: flex;
	flex-wrap: wrap;

	font-size: 0.625rem;
	line-height: 0.75rem;
`;

const Breadcrumb = styled.div<ThemeProps>`
	position: relative;
	padding-right: 1rem;
	margin-right: 0.3rem;
	margin-top: 0.5rem;
	color: ${({ theme }) => theme.colors.secondary};
`;

const BreadcrumbSeparator = styled(Icon)`
	position: absolute;
	top: 2px;
	right: 2px;
	color: currentColor;

	svg {
		width: 4px;
		height: 8px;
	}
`;

const OwnersSection = styled.div`
	display: flex;
	margin-top: 0.75rem;
`;

const Owner = styled.div`
	display: flex;
	align-items: center;
	margin-right: 1.5rem;
`;

const OwnerLabel = styled(Text)`
	margin-right: 0.7rem;
`;

const Description = styled.div`
	margin-top: 0.75rem;
`;

const DescriptionText = styled(Text)`
	margin-top: 0.3rem;
	line-height: 1.0625rem;
`;

interface GeneralFileInfoProps {
	file: IFile;
	fileFullPath?: string;
}

export const GeneralFileInfo: React.FC<GeneralFileInfoProps> = ({
	file,
	fileFullPath,
}) => {
	const { t } = useTranslation();
	const [isCollapsed, setIsCollapsed] = useState(false);

	const toggleCollapsing = (e) => {
		e.stopPropagation();
		setIsCollapsed((prevValue) => !prevValue);
	};

	const parsedFileFullPath = fileFullPath
		? parseFileFullPath(fileFullPath, file.name)
		: [];

	return (
		<Container>
			<ContainerLeft>
				<Icon icon={ICON_COLLECTION.doc_file} />
			</ContainerLeft>
			<ContainerRight>
				<Header onClick={toggleCollapsing}>
					<Text variant="body_2_primary_bold">{file.name}</Text>
					{/* <CollapseButton
						icon={ICON_COLLECTION.chevron_down}
						onPress={toggleCollapsing}
					/> */}
				</Header>

				{!isCollapsed && (
					<>
						<Breadcrumbs>
							{parsedFileFullPath.map((step, idx, self) => (
								<Breadcrumb key={step}>
									{step}
									{idx < self.length - 1 && (
										<BreadcrumbSeparator icon={ICON_COLLECTION.chevron_right} />
									)}
								</Breadcrumb>
							))}
						</Breadcrumbs>

						<OwnersSection>
							<Owner>
								<OwnerLabel variant="body_4_secondary">
									{t('disposition.file_info_modal.general_info.owner')}
								</OwnerLabel>
								<Text variant="body_4_primary">{file.objectOwner}</Text>
							</Owner>
							<Owner>
								<OwnerLabel variant="body_4_secondary">
									{t('disposition.file_info_modal.general_info.group_owner')}
								</OwnerLabel>
								<Text variant="body_4_primary">{file.groupOwner}</Text>
							</Owner>
						</OwnersSection>

						<Description>
							<Text variant="body_4_secondary_bold">
								{t('disposition.file_info_modal.general_info.description')}
							</Text>
							<DescriptionText variant="body_4_primary">
								{file.comment}
							</DescriptionText>
						</Description>
					</>
				)}
			</ContainerRight>
		</Container>
	);
};
