import React from 'react';
import styled from 'styled-components';

import { ThemeProps } from 'app/settings/theme/theme';

import { IApprover } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';
import { useTranslation } from 'shared/hooks/use-translation';

import { DropdownContainer } from 'shared/components/dropdown/dropdown-container';
import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
// import { DropdownList } from 'components/dropdown/dropdown-list';
// import { DropdownItem } from 'components/dropdown/dropdown-item';
// import { DropdownSimpleButton } from 'components/dropdown/dropdown-simple-button';
import { UserSearchInput } from 'shared/components/input/user-search-input';
import { Spinner } from 'shared/components/spinner/spinner';
import { Text } from 'shared/components/text/text';

const Container = styled.div`
	position: relative;
`;

const DragIcon = styled(Icon)`
	width: 1rem;
	opacity: 0.3;
`;

const AddButton = styled.button<ThemeProps>`
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0.4rem 1rem;
	margin-right: 0.5rem;
	border: ${({ theme }) => theme.border.base_dashed};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
	background-color: ${({ theme }) => theme.colors.background.secondary};
`;

const ContainerLeft = styled.div`
	display: flex;
	align-items: center;
	flex-shrink: 0;
	margin-right: 0.8rem;
`;

const ContainerRight = styled.div`
	display: flex;
	align-items: center;
	width: 241px;
	min-width: 0;
`;

const UserAvatar = styled.div`
	width: 2.53rem;
	height: 2.53rem;
	margin-right: 0.5rem;
	border: 2px solid ${({ theme }) => theme.colors.white};
	border-radius: 50%;
	background-color: ${({ theme }) => theme.colors.borderColorPrimary};
`;

const Order = styled(Text)`
	margin-left: 1rem;
`;

const StyledDropdownContainer = styled(DropdownContainer)`
	width: 100%;
`;

const Loader = styled.div`
	position: absolute;
	top: 0;
	left: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	background-color: rgba(var(--palette-white-inverted_rgb), 0.8);
`;

interface ApproverItemProps {
	order: number;
	isAddingApprover: boolean;
	selectedApproverIds: IUser['id'][];
	onAddApprover: (
		user: IUser,
		conditionalApprover: IApprover['conditionalApprover'],
	) => void;
}

export const AddApprover: React.FC<ApproverItemProps> = ({
	order,
	isAddingApprover,
	selectedApproverIds,
	onAddApprover,
}) => {
	const { t } = useTranslation();

	// const [approverType, setApproverType] =
	// 	useState<IApprover['conditionalApprover']>(0);

	const approverType: IApprover['conditionalApprover'] = 0;

	const managePopperState = useManagePopperState({ placement: 'bottom' });

	// useEffect(() => {
	// 	if (!managePopperState.isOpen && approverType !== undefined) {
	// 		setApproverType(undefined);
	// 	}
	// }, [managePopperState.isOpen, approverType]);

	// const onChooseApproverType =
	// 	(type: IApprover['conditionalApprover'] | undefined) => () => {
	// 		setApproverType(type);
	// 	};

	const onSelectUser = (user: IUser) => {
		if (approverType === undefined) return;

		onAddApprover(user, approverType);
	};

	return (
		<Container>
			<AddButton
				ref={managePopperState.setReferenceElement}
				onClick={() => managePopperState.toggleMenu()}
			>
				{order && (
					<ContainerLeft>
						<DragIcon icon={ICON_COLLECTION.order_dots_vertical} />
						<Order variant="body_3_primary_bold">{order}</Order>
					</ContainerLeft>
				)}
				<ContainerRight>
					<UserAvatar />
					<Text variant="body_3_secondary_bold">
						{t(
							'rda_report.approvers_section.add_new_approver.add_new_approver',
						)}
					</Text>
				</ContainerRight>
			</AddButton>

			{managePopperState.isOpen && (
				<StyledDropdownContainer
					ref={managePopperState.setPopperElement}
					style={managePopperState.styles.popper}
					{...managePopperState.attributes.popper}
				>
					{/*{approverType === undefined && (*/}
					{/*	<DropdownList>*/}
					{/*		<DropdownItem>*/}
					{/*			<DropdownSimpleButton onClick={onChooseApproverType(0)}>*/}
					{/*				{t(*/}
					{/*					'rda_report.approvers_section.add_new_approver.add_approver',*/}
					{/*				)}*/}
					{/*			</DropdownSimpleButton>*/}
					{/*		</DropdownItem>*/}
					{/*		<DropdownItem>*/}
					{/*			<DropdownSimpleButton onClick={onChooseApproverType(1)}>*/}
					{/*				{t(*/}
					{/*					'rda_report.approvers_section.add_new_approver.add_conditional_approver',*/}
					{/*				)}*/}
					{/*			</DropdownSimpleButton>*/}
					{/*		</DropdownItem>*/}
					{/*	</DropdownList>*/}
					{/*)}*/}

					{approverType !== undefined && (
						<>
							<UserSearchInput
								reassign
								selectedUsers={selectedApproverIds}
								autoFocus
								closeOnScroll={false}
								onSelectUser={onSelectUser}
							/>
							{isAddingApprover && (
								<Loader>
									<Spinner />
								</Loader>
							)}
						</>
					)}
				</StyledDropdownContainer>
			)}
		</Container>
	);
};
