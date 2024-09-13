import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import styled from 'styled-components';

import { useManagePopperState } from 'shared/hooks/use-manage-popper-state';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { PaginationItem } from 'shared/components/table-controls/pagination/pagination-item';
import { PaginationLink } from 'shared/components/table-controls/pagination/pagination-link';

const AdditionalNumberList = styled.div`
	border: 1px solid ${({ theme }) => theme.colors.borderColorPrimary};
	background-color: ${({ theme }) => theme.colors.white_inverted};
	border-radius: ${({ theme }) => theme.borderRadius.secondary};
`;

const StyledPaginationItem = styled(PaginationItem)`
	margin: 0;
	border: none;

	&.disabled {
		border: none;
	}
`;

const StyledPaginationLink = styled(PaginationLink)`
	height: 1.25rem;
`;

const ArrowIcon = styled(Icon)`
	svg {
		width: 5px;
		height: 5px;
	}
`;

const MENU_OFFSET: [number, number] = [0, 3];

export const PaginationNumbersMenu: React.FC<{
	pages: number[];
	onChangePage: (page: number) => void;
}> = ({ pages, onChangePage }) => {
	const managePopperState = useManagePopperState({ offset: MENU_OFFSET });

	const [currentPage, setCurrentPage] = useState(0);

	const totalPages = Math.ceil(pages.length / 3);
	const limitedPage = useMemo(
		() => pages.slice(currentPage * 3, currentPage * 3 + 3),
		[pages, currentPage],
	);

	const onOpenList = () => {
		managePopperState.toggleMenu();
	};

	const onChangeList = (page: number, disabled: boolean) => {
		if (disabled) return;

		setCurrentPage(page);
	};

	return (
		<>
			<PaginationItem ref={(ref) => managePopperState.setReferenceElement(ref)}>
				<StyledPaginationLink onClick={onOpenList}>
					<Icon icon={ICON_COLLECTION.more_horizontal} />
				</StyledPaginationLink>
			</PaginationItem>
			{managePopperState.isOpen && (
				<AdditionalNumberList
					ref={(ref) => managePopperState.setPopperElement(ref)}
					style={managePopperState.styles.popper}
					{...managePopperState.attributes.popper}
				>
					<StyledPaginationItem
						className={clsx({ disabled: currentPage === 0 })}
						onClick={() => onChangeList(currentPage - 1, currentPage === 0)}
					>
						<StyledPaginationLink>
							<ArrowIcon icon={ICON_COLLECTION.chevron_left} />
						</StyledPaginationLink>
					</StyledPaginationItem>

					{limitedPage.map((page) => (
						<StyledPaginationItem key={page}>
							<StyledPaginationLink onClick={() => onChangePage(page)}>
								{page}
							</StyledPaginationLink>
						</StyledPaginationItem>
					))}
					<StyledPaginationItem
						className={clsx({ disabled: currentPage + 1 === totalPages })}
						onClick={() =>
							onChangeList(currentPage + 1, currentPage + 1 === totalPages)
						}
					>
						<StyledPaginationLink>
							<ArrowIcon icon={ICON_COLLECTION.chevron_down} />
						</StyledPaginationLink>
					</StyledPaginationItem>
				</AdditionalNumberList>
			)}
		</>
	);
};
