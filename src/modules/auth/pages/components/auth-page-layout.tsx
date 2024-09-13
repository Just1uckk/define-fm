import React from 'react';
import { LanguageMenu } from 'app/layout/components/language-menu/language-menu';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { useManageAppTheme } from 'shared/hooks/use-manage-app-theme';
import { useManageSiteLanguage } from 'shared/hooks/use-manage-site-language';

import { Image } from 'shared/components/image/image';
import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { Text } from 'shared/components/text/text';
import { ThemeToggle } from 'shared/components/theme-toggle';
import { Title } from 'shared/components/title/title';

import AuthBgImg from '../../../../shared/assets/images/auth-page-bg.jpg';
import LogoImg from '../../../../shared/assets/images/logo.svg';

const Container = styled.div`
	display: flex;
	height: 100vh;
`;

const LeftPage = styled.div`
	display: flex;
	flex-direction: column;
	width: 50%;
	padding: 1.5rem;
	overflow-y: auto;

	@media (max-width: 740px) {
		width: 100%;
	}
`;

const RightPage = styled.div`
	position: relative;
	width: 50%;

	@media (max-width: 740px) {
		display: none;
	}
`;

const FormWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	width: 100%;
	max-width: 400px;
	margin: auto;
	padding-top: 3.7rem;
`;

const FormSubTitle = styled(Text)`
	margin-top: 0.8rem;
`;

const LanguageSelectWrap = styled.div`
	display: flex;
	align-items: center;
	gap: 0.5rem;

	margin-top: auto;

	@media (max-width: 740px) {
		margin-top: 1rem;
	}
`;

const RightPageImage = styled(Image)`
	width: 100%;
	height: 100%;
	object-fit: cover;
	pointer-events: none;
`;

const Logo = styled(Image)`
	width: 3rem;
`;

const CopyRight = styled(Text)<ThemeProps>`
	position: absolute;
	bottom: 1.5rem;
	right: 1.5rem;
	color: ${({ theme }) => theme.colors.white};
	z-index: 1;
`;

const CopyRightLeftSide = styled(Text)<ThemeProps>`
	display: none;
	margin-top: 1rem;
	text-align: center;

	@media (max-width: 740px) {
		display: block;
	}
`;

interface AuthPageLayoutProps {
	className?: string;
	title: string;
	subTitle: React.ReactNode;
}

export const AuthPageLayout: React.FC<
	React.PropsWithChildren<AuthPageLayoutProps>
> = ({ className, title, subTitle, children }) => {
	const manageSiteLanguage = useManageSiteLanguage();

	const manageAppTheme = useManageAppTheme();

	const handleChangeLang = (lang) => {
		manageSiteLanguage.changLanguage(lang.code);
	};

	const handleChangeAppTheme = () => {
		manageAppTheme.toggleTheme();
	};

	return (
		<Container className={className}>
			<LeftPage>
				<Logo src={LogoImg} />
				<FormWrapper>
					<Title variant="h1_primary_bold">{title}</Title>
					<FormSubTitle
						variant="body_3_secondary_semibold"
						className="auth-layout__sub-title"
					>
						{subTitle}
					</FormSubTitle>
					{children}
				</FormWrapper>
				<LanguageSelectWrap>
					<ThemeToggle
						currentTheme={manageAppTheme.theme}
						onClick={handleChangeAppTheme}
					/>
					{!manageSiteLanguage.isLoadingList && (
						<LanguageMenu
							currentLang={manageSiteLanguage.currentLang}
							languages={manageSiteLanguage.languages}
							onChangeLang={handleChangeLang}
							fulfilled={true}
						/>
					)}
				</LanguageSelectWrap>

				<CopyRightLeftSide variant="body_3_secondary">
					<LocalTranslation tk="copyright" />
				</CopyRightLeftSide>
			</LeftPage>
			<RightPage>
				<RightPageImage src={AuthBgImg} />
				<CopyRight variant="body_3_secondary">
					<LocalTranslation tk="copyright" />
				</CopyRight>
			</RightPage>
		</Container>
	);
};
