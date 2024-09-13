import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { RdaItemApi } from 'app/api/rda-item-api/rda-item-api';

import { WORK_PACKAGE_FILES_KEYS } from 'shared/constants/query-keys';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useTitle } from 'shared/hooks/use-tab-title';
import { useTranslation } from 'shared/hooks/use-translation';

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

const StyledTable = styled(Table)`
	width: 100%;
	margin-top: 0.7rem;
`;

const StyledHeaderCell = styled(HeaderCell)`
	max-width: 186px;
`;

const FileInfoSpecificPage: React.FC = () => {
	const { fileId } = useParams();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const { data: fileData, isLoading: isFileDataLoading } = useQuery({
		queryKey: WORK_PACKAGE_FILES_KEYS.file(Number(fileId)),
		queryFn: () => RdaItemApi.getFileById({ id: Number(fileId) }),
		enabled: fileId !== undefined,
	});

	const { data: specifics, isLoading: isSpecificsLoading } = useQuery({
		queryKey: WORK_PACKAGE_FILES_KEYS.fileSpecifics(Number(fileId)),
		queryFn: () => RdaItemApi.getFileSpecificsById({ id: Number(fileId) }),
		enabled: fileId !== undefined,
	});

	useTitle(`${fileData?.name ?? ''} | Specific`);

	useEffect(() => {
		window.onmessage = (e) => {
			if (e.data.type === 'changedFileId') {
				navigate(
					DISPOSITIONS_ROUTES.FILE_INFO_SPECIFIC.generate.local(
						e.data.workPackageId,
						e.data.oldId ? e.data.oldId : e.data.newId,
					),
				);
			}
		};
	}, [fileData]);

	if (isFileDataLoading || isSpecificsLoading) {
		return <PageSpinner />;
	}

	return (
		<>
			{fileData && (
				<>
					<GeneralFileInfo file={fileData} />

					<PageBody>
						<StyledTable>
							<TableBody>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.specific.table.columns.type',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>{specifics?.infoType}</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.specific.table.columns.home_location',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>{specifics?.infoLocation}</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.specific.table.columns.box',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>{specifics?.infoBox}</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.specific.table.columns.offsite_storage_id',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>{specifics?.infoOffsiteStorageId}</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.specific.table.columns.client',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>{specifics?.infoClient}</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.specific.table.columns.temporary_id',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>{specifics?.infoTempId}</CellContent>
									</RowBodyCell>
								</TableRow>
							</TableBody>
						</StyledTable>
					</PageBody>
				</>
			)}
		</>
	);
};

export default FileInfoSpecificPage;
