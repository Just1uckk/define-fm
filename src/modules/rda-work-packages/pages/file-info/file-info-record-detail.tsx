import React, { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { RdaItemApi } from 'app/api/rda-item-api/rda-item-api';

import { WORK_PACKAGE_FILES_KEYS } from 'shared/constants/query-keys';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
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
	display: flex;
	flex-wrap: wrap;
	padding-top: 1.5rem;
`;

const StyledTable = styled(Table)`
	margin-top: 0.7rem;

	&:not(:last-child) {
		margin-right: 0.6rem;
	}
`;

const StyledHeaderCell = styled(HeaderCell)`
	max-width: 186px;
`;

const FileInfoRecordDetailPage: React.FC = () => {
	const { fileId } = useParams();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const {
		formats: { base },
	} = useDate();
	const { data: fileData, isLoading: isFileDataLoading } = useQuery({
		queryKey: WORK_PACKAGE_FILES_KEYS.file(Number(fileId)),
		queryFn: () => RdaItemApi.getFileById({ id: Number(fileId) }),
		enabled: fileId !== undefined,
	});

	const { data: additionalData, isLoading: isAdditionalDataLoading } = useQuery(
		{
			queryKey: WORK_PACKAGE_FILES_KEYS.additionalInfo(Number(fileId)),
			queryFn: () => RdaItemApi.getAdditionalInfo({ id: Number(fileId) }),
			enabled: fileId !== undefined,
		},
	);

	useTitle(`${fileData?.name ?? ''} | Record Details`);

	useEffect(() => {
		window.onmessage = (e) => {
			if (e.data.type === 'changedFileId') {
				navigate(
					DISPOSITIONS_ROUTES.FILE_INFO_RECORD_DETAILS.generate.local(
						e.data.workPackageId,
						e.data.oldId ? e.data.oldId : e.data.newId,
					),
				);
			}
		};
	}, [fileData]);

	if (isFileDataLoading || isAdditionalDataLoading) {
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
												'disposition.file_info_modal.record_details.table.columns.rm_file_number',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>{fileData.fileNumber}</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.record_date',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>{base(fileData.createDate)}</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.status',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>{fileData.status}</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.status_date',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{fileData.statusDate ? base(fileData.statusDate) : null}
											{!fileData.statusDate && additionalData?.statusDate
												? base(additionalData.statusDate)
												: null}
										</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.received_date',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{fileData.receivedDate
												? base(fileData.receivedDate)
												: null}
											{!fileData.receivedDate && additionalData?.receivedDate
												? base(additionalData.receivedDate)
												: null}
										</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.essential',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{fileData.essential ? fileData.essential : null}
											{!fileData.essential && additionalData?.essential
												? additionalData.essential
												: null}
										</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.official.field',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{additionalData?.official
												? t(
														'disposition.file_info_modal.record_details.table.columns.official.yes',
												  )
												: t(
														'disposition.file_info_modal.record_details.table.columns.official.no',
												  )}
										</CellContent>
									</RowBodyCell>
								</TableRow>
							</TableBody>
						</StyledTable>

						<StyledTable>
							<TableBody>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.accession',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{additionalData?.accession
												? additionalData.accession
												: null}
										</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.subject',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{fileData.subject ? fileData.subject : null}
											{!fileData.subject && additionalData?.subject
												? additionalData.subject
												: null}
										</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.rsi',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{fileData.rsi ? fileData.rsi : null}
											{!fileData.rsi && additionalData?.rsi
												? additionalData.rsi
												: null}
										</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.author_of_originator',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{fileData.originator ? fileData.originator : null}
											{!fileData.originator &&
											additionalData?.authorOrOriginator
												? additionalData.authorOrOriginator
												: null}
										</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.addressee(s)',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{fileData.addressee ? fileData.addressee : null}
											{!fileData.addressee && additionalData?.addressees
												? additionalData.addressees
												: null}
										</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.other_addreessee',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{additionalData?.otherAddressees
												? additionalData.otherAddressees
												: null}
										</CellContent>
									</RowBodyCell>
								</TableRow>
								<TableRow>
									<StyledHeaderCell>
										<CellContent>
											{t(
												'disposition.file_info_modal.record_details.table.columns.originating',
											)}
										</CellContent>
									</StyledHeaderCell>
									<RowBodyCell>
										<CellContent>
											{additionalData?.originating
												? additionalData.originating
												: null}
										</CellContent>
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

export default FileInfoRecordDetailPage;
