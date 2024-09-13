import React, { useEffect, useMemo } from 'react';
import { useMutation } from 'react-query';
import clsx from 'clsx';
import {
	DEFAULT_SETTINGS_LIST,
	findDefaultOption,
} from 'modules/auth/components/profile-settings-form/profile-tabs/edit-default-settings';
import { LocalStorageService } from 'shared/services/local-storage-service';
import styled from 'styled-components';

import {
	DefaultSettingsApi,
	DefaultSettingsDto,
	SendDefaultSettingsDto,
} from 'app/api/user-api/user-api-default';

import { setDefaultSettings } from 'app/store/user/user-actions';
import {
	selectDefaultSettingsData,
	selectUserData,
} from 'app/store/user/user-selectors';

import { IUser } from 'shared/types/users';

import { useTranslation } from 'shared/hooks/use-translation';

import { Icon, ICON_COLLECTION } from 'shared/components/icon/icon';
import { PageSizeSelect } from 'shared/components/table-controls/pagination/page-size-select';
import { PaginationItem } from 'shared/components/table-controls/pagination/pagination-item';
import { PaginationLink } from 'shared/components/table-controls/pagination/pagination-link';
import { PaginationNumbersMenu } from 'shared/components/table-controls/pagination/pagination-numbers-menu';
import { Text } from 'shared/components/text/text';

const Container = styled.div``;

const WrapperPageSize = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;
`;

const ShowCounter = styled(Text)`
	margin-right: 1rem;
`;

const StyledPaginate = styled.div`
	display: flex;
	align-items: center;
	list-style: none;
`;

const ItemsStats = styled(Text)`
	margin-top: 0.35rem;
`;

const StyledIcon = styled(Icon)`
	color: currentColor;
`;

interface PaginationProps {
	pageSize?: string | number;
	page?: number;
	totalPages?: number;
	itemsCount?: number;
	onChangePage?: (page: number) => void;
	onChangePageSize?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
	page: currentPage = 0,
	itemsCount = 0,
	pageSize,
	totalPages,
	onChangePage,
	onChangePageSize,
}) => {
	const { t } = useTranslation();
	const defaultSettings = selectDefaultSettingsData();
	const currentUser = selectUserData() as IUser;
	const numberOfItemsPerPage = (): number => {
		const itemsPerPage = LocalStorageService.get('itemsPerPage');
		if (itemsPerPage) return itemsPerPage;

		let value: any = findDefaultOption(
			defaultSettings,
			DEFAULT_SETTINGS_LIST.ITEMS_PER_PAGE,
		)?.value;
		value = Number(value);
		LocalStorageService.set('itemsPerPage', value);

		return value;
	};
	const itemsPerPage = useMemo(() => {
		if (
			!findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.ITEMS_PER_PAGE)
				?.value
		) {
			return 12;
		}
		return Number(
			findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.ITEMS_PER_PAGE)
				?.value,
		);
	}, [defaultSettings]);
	const totalPagesMemo = useMemo(() => {
		if (!totalPages) {
			const stringPerPage: string | undefined = findDefaultOption(
				defaultSettings,
				DEFAULT_SETTINGS_LIST.ITEMS_PER_PAGE,
			)?.value;
			const numberPerPage = Number(stringPerPage);
			return Math.ceil(itemsCount / numberPerPage);
		}
		return totalPages;
	}, [totalPages]);
	const visiblePages = getVisiblePages(currentPage, totalPagesMemo);
	const activePage = currentPage + 1;

	function filterPages(visiblePages, totalPagesMemo) {
		return visiblePages.filter((page) => page <= totalPagesMemo);
	}

	function getHiddenPages(from, to) {
		const start = from;
		const end = to;
		const diff = end - start;
		const pages: number[] = [];

		let count = 0;
		while (pages.length !== diff) {
			if (from < to) {
				pages.push(start + count);
			} else {
				pages.unshift(start + count);
			}

			count++;
		}

		return pages;
	}

	function getVisiblePages(page, total) {
		if (total < 8) {
			return filterPages([1, 2, 3, 4, 5, 6, 7], total);
		}

		if (page % 5 >= 0 && page > 3 && page + 4 < total) {
			const start = total;
			const end = page + 2 < 4 ? 4 : page + 3;
			const diff = start - end;
			const hiddenNumbersAfter: number[] = [];

			let count = 0;
			while (hiddenNumbersAfter.length !== diff) {
				hiddenNumbersAfter.push(end + count);

				count++;
			}

			if (page === 0) {
				return [page + 1, page + 2, page + 3, hiddenNumbersAfter, total]; // [1] 2 3 ... 6
			}

			if (!hiddenNumbersAfter.length) {
				return [1, getHiddenPages(1, page + 1), page + 1, page + 2, total]; // 3 [4] 5 6
			}

			return [
				1,
				getHiddenPages(2, page),
				page,
				page + 1,
				page + 2,
				hiddenNumbersAfter,
				total,
			]; // 1 [2] 3 ... 6
		} else if (page % 5 >= 0 && page > 3 && page + 4 >= total) {
			if (page + 1 === total) {
				return [
					1,
					getHiddenPages(2, page - 2),
					page - 3,
					page - 2,
					page - 1,
					page,
					total,
				]; // 1 ... 7 [8] 9 10
			}

			if (page + 2 === total) {
				return [
					1,
					getHiddenPages(2, page - 2),
					page - 2,
					page - 1,
					page,
					page + 1,
					total,
				]; // 1 ... 7 8 [9] 10
			}

			if (page + 3 === total) {
				return [
					1,
					getHiddenPages(2, page - 2),
					page - 1,
					page,
					page + 1,
					page + 2,
					total,
				]; // 1 ... 7 8 9 [10]
			}

			return [
				1,
				getHiddenPages(2, page),
				page,
				page + 1,
				page + 2,
				page + 3,
				total,
			]; // 1 [2] 3 4 5 ... 10
		} else {
			return [1, 2, 3, 4, 5, getHiddenPages(6, total), total];
		}
	}

	const changePage = (page) => {
		const activePage = page + 1;

		if (page === activePage) {
			return;
		}

		onChangePage && onChangePage(page - 1);
	};

	const onPrev = () => {
		if (activePage === 1) return;
		onChangePage && onChangePage(currentPage - 1);
	};

	const onNext = () => {
		if (activePage === totalPagesMemo) return;

		onChangePage && onChangePage(currentPage + 1);
	};

	const countItemsFrom =
		currentPage === 0
			? 1
			: numberOfItemsPerPage() * (currentPage + 1) -
			  (numberOfItemsPerPage() - 1);
	const countItemsTo = numberOfItemsPerPage() * (currentPage + 1);

	const setDefaultSettingsUser = setDefaultSettings();

	const updateUserDefaultSettingsMutation = useMutation<DefaultSettingsDto[]>({
		mutationFn: async (payload: any) => {
			const sendRequestBody: SendDefaultSettingsDto[] = [];
			sendRequestBody.push({
				userId: currentUser.id,
				value: `${payload}`,
				property: DEFAULT_SETTINGS_LIST.ITEMS_PER_PAGE,
			});
			const updateUser = await DefaultSettingsApi.updateDefaultUserSettings(
				currentUser.id,
				sendRequestBody,
			);

			setDefaultSettingsUser(updateUser);
			return updateUser;
		},
	});

	const onChangePageSizeLocal = (size) => {
		// if (
		// 	findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.ITEMS_PER_PAGE)
		// 		?.value
		// ) {
		// 	updateUserDefaultSettingsMutation.mutate(size);
		// }
		if (onChangePageSize) {
			LocalStorageService.set('itemsPerPage', size);
			onChangePageSize(size);
		}
	};

	useEffect(() => {
		if (
			findDefaultOption(defaultSettings, DEFAULT_SETTINGS_LIST.ITEMS_PER_PAGE)
				?.value
		) {
			onChangePageSize!(numberOfItemsPerPage());
		}
	}, [defaultSettings]);

	return (
		<Container>
			<WrapperPageSize>
				<ShowCounter tag="div" variant="body_4_secondary">
					{t('components.table.pagination.before_select_page_size')}
					<PageSizeSelect
						value={numberOfItemsPerPage() || Number(pageSize) || itemsPerPage}
						onSelectOption={onChangePageSizeLocal}
					/>
					{t('components.table.pagination.after_select_page_size')}
				</ShowCounter>

				<StyledPaginate>
					<PaginationItem className={clsx({ disabled: activePage === 1 })}>
						<PaginationLink onClick={onPrev} disabled={activePage === 1}>
							<StyledIcon icon={ICON_COLLECTION.chevron_left} />
						</PaginationLink>
					</PaginationItem>
					{visiblePages.map((page) => {
						if (Array.isArray(page)) {
							return (
								<PaginationNumbersMenu
									key={page.join()}
									pages={page}
									onChangePage={changePage}
								/>
							);
						}

						return (
							<PaginationItem
								className={clsx({
									active: activePage === page,
								})}
								key={page}
							>
								<PaginationLink onClick={() => changePage(page)}>
									{page}
								</PaginationLink>
							</PaginationItem>
						);
					})}
					<PaginationItem
						className={clsx({ disabled: activePage === totalPagesMemo })}
					>
						<PaginationLink
							onClick={onNext}
							disabled={activePage === totalPagesMemo}
						>
							<StyledIcon icon={ICON_COLLECTION.chevron_right} />
						</PaginationLink>
					</PaginationItem>
				</StyledPaginate>
			</WrapperPageSize>

			<ItemsStats tag="div" variant="body_4_secondary">
				{t('components.table.pagination.items_stats', {
					countItemsFrom,
					countItemsTo: countItemsTo < itemsCount ? countItemsTo : itemsCount,
					totalItems: itemsCount,
				})}
			</ItemsStats>
		</Container>
	);
};
