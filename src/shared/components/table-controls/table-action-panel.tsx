import React, { HTMLAttributes } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { LocalTranslation } from 'shared/components/local-translation/local-translation';
import { Text } from 'shared/components/text/text';

const ActionPanel = styled.div<ThemeProps>`
	position: fixed;
	bottom: 0;
	left: 0;
	display: flex;
	width: 100%;
	height: 6.5rem;
	box-shadow: 1px -7px 41px -5px rgba(0, 0, 0, var(--box-shadow-opacity, 0.18));
	z-index: 2;
`;

const ActionPanelWrapper = styled.div`
	position: relative;
	display: flex;
	width: 100%;
	padding: 1.75rem;
	padding-left: 112px;
	background-color: ${({ theme }) => theme.colors.background.secondary};
	z-index: 1;
	transition: padding-left 0.3s ease;
`;

const SelectedItems = styled.div`
	display: flex;
	flex-shrink: 0;
`;
const SelectedItemsLeft = styled.div`
	margin-right: 0.75rem;
`;
const SelectedItemsRight = styled.div``;

const SelectedItemsCount = styled(Text)`
	& {
		font-size: 2.5rem;
		line-height: 3rem;
	}
`;

const ButtonSelectAll = styled.button<ThemeProps>`
	padding: 0;
	padding-top: 0.5rem;
	border: none;
	background-color: transparent;
	text-decoration: underline;
	text-underline-offset: 0.3rem;
`;

const Actions = styled.div`
	margin-left: 2.75rem;
`;

const GlobalStyles = createGlobalStyle`
	#page-wrapper::after {
		content: '';
		display: block;
		padding-bottom: 7rem;
	}

	body.is-left-menu-open ${ActionPanelWrapper} {
		padding-left: 19rem;
	}
`;

interface TableActionPanelProps {
	selectedCountItems: number;
	allCountItems: number;
	onSelectAll?: HTMLAttributes<HTMLButtonElement>['onClick'];
}

export const TableActionPanel: React.FC<
	React.PropsWithChildren<TableActionPanelProps>
> = ({ selectedCountItems, allCountItems, onSelectAll, children }) => {
	return (
		<>
			<GlobalStyles />
			<ActionPanel>
				<ActionPanelWrapper>
					<SelectedItems>
						<SelectedItemsLeft>
							<SelectedItemsCount>{selectedCountItems}</SelectedItemsCount>
						</SelectedItemsLeft>
						<SelectedItemsRight>
							<Text variant="body_2_primary">
								<LocalTranslation tk="components.table.action_panel.items_selected" />
							</Text>
							<ButtonSelectAll onClick={onSelectAll}>
								<Text variant="body_3_primary">
									<LocalTranslation tk="components.table.action_panel.select_all" />{' '}
									{allCountItems}
								</Text>
							</ButtonSelectAll>
						</SelectedItemsRight>
					</SelectedItems>
					<Actions>{children}</Actions>
				</ActionPanelWrapper>
			</ActionPanel>
		</>
	);
};
