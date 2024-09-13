import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { RdaItemApi } from 'app/api/rda-item-api/rda-item-api';

import { IFileCategoryAttrValue } from 'shared/types/dispositions';

import { WORK_PACKAGE_FILES_KEYS } from 'shared/constants/query-keys';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useTitle } from 'shared/hooks/use-tab-title';

import { Text } from 'shared/components/text/text';

import { GeneralFileInfo } from './components/general-file-info';
import { PageSpinner } from './components/page-spinner';
import {
	CellContent,
	HeaderCell,
	RowBodyCell,
	Table,
	TableBody,
	TableRow,
} from './components/table-components';

const PageBody = styled.div`
	padding-top: 1.5rem;
`;

const TableWrapper = styled.div`
	&:not(:last-child) {
		margin-bottom: 1.5rem;
	}
`;

const StyledTable = styled(Table)`
	width: 100%;
	margin-top: 0.3rem;
`;

const StyledHeaderCell = styled(HeaderCell)`
	max-width: 186px;
`;

const FileInfoCategoriesPage: React.FC = () => {
	const { fileId } = useParams();
	const navigate = useNavigate();
	const { formats, isStringDate } = useDate();

	const { data: fileData, isLoading: isFileDataLoading } = useQuery({
		queryKey: WORK_PACKAGE_FILES_KEYS.file(Number(fileId)),
		queryFn: () => RdaItemApi.getFileById({ id: Number(fileId) }),
		enabled: fileId !== undefined,
	});

	const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
		queryKey: WORK_PACKAGE_FILES_KEYS.fileCategories(Number(fileId)),
		queryFn: () => RdaItemApi.getFileCategoriesById({ id: Number(fileId) }),
		enabled: fileId !== undefined,
	});

	const { data: fileFullPath, isLoading: isFileFullPathLoading } = useQuery({
		queryKey: WORK_PACKAGE_FILES_KEYS.fileFullPath(Number(fileId)),
		queryFn: () => RdaItemApi.getFileFullPathById({ id: Number(fileId) }),
		enabled: fileId !== undefined,
	});

	useTitle(`${fileData?.name ?? ''} | Categories`);

	useEffect(() => {
		window.onmessage = (e) => {
			if (e.data.type === 'changedFileId') {
				navigate(
					DISPOSITIONS_ROUTES.FILE_INFO_CATEGORIES.generate.local(
						e.data.workPackageId,
						e.data.oldId ? e.data.oldId : e.data.newId,
					),
				);
			}
		};
	}, [fileData]);

	const getCellContent = (value: IFileCategoryAttrValue) => {
		if (value === null || value === undefined) {
			return '—';
		}

		if (typeof value === 'string' && value.trim() === '') {
			return '—';
		}

		if (typeof value === 'string' && isStringDate(value)) {
			return formats.base(value);
		}

		return String(value);
	};

	const isDataLoading =
		isFileDataLoading || isCategoriesLoading || isFileFullPathLoading;

	if (isDataLoading) {
		return <PageSpinner />;
	}

	return (
		<>
			{fileData && (
				<>
					<GeneralFileInfo file={fileData} fileFullPath={fileFullPath} />

					<PageBody>
						{categories.map((category) => (
							<TableWrapper key={category.name}>
								<Text variant="body_3_primary_bold">{category.name}</Text>

								{category.sets.map((set, setIdx) => (
									<React.Fragment key={setIdx}>
										<Text variant="body_3_secondary_bold" mt="0.7rem">
											{set.name}
										</Text>
										<StyledTable>
											<TableBody>
												{set.rows.map((row, rowIdx) => (
													<React.Fragment key={rowIdx}>
														{row.attributes.map((attr, attrIdx) => (
															<TableRow key={attrIdx}>
																<StyledHeaderCell>
																	<CellContent>{attr.name + ' :'}</CellContent>
																</StyledHeaderCell>
																<RowBodyCell>
																	{attr.values.map((value, valueIdx) => (
																		<CellContent key={valueIdx}>
																			{getCellContent(value)}
																		</CellContent>
																	))}
																</RowBodyCell>
															</TableRow>
														))}
													</React.Fragment>
												))}
											</TableBody>
										</StyledTable>
									</React.Fragment>
								))}
							</TableWrapper>
						))}
					</PageBody>
				</>
			)}
		</>
	);
};

export default FileInfoCategoriesPage;
