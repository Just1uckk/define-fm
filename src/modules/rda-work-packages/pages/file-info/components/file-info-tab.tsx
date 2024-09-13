import React from 'react';
import styled from 'styled-components';

import { AdditionalInfoDto } from 'app/api/rda-item-api/rda-item-api';

import { IFile } from 'shared/types/dispositions';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import {
	CellContent,
	HeaderCell,
	RowBodyCell,
	Table,
	TableBody,
	TableRow,
} from './table-components';

const Tables = styled.div`
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
`;

const DatesTable = styled(Table)`
	margin-right: 0.5rem;
`;

interface FileInfoTabProps {
	file: IFile;
	additionalData?: AdditionalInfoDto;
}

export const FileInfoTab: React.FC<FileInfoTabProps> = ({
	file,
	additionalData,
}) => {
	const {
		formats: { base },
	} = useDate();
	const { t } = useTranslation();

	return (
		<Tables>
			<DatesTable>
				<TableBody>
					<TableRow>
						<HeaderCell>
							<CellContent>
								{t('disposition.file_info_modal.file_info.columns.status_date')}
							</CellContent>
						</HeaderCell>
						<RowBodyCell>
							<CellContent>
								{file.statusDate ? base(file.statusDate) : ''}
								{!file.statusDate && additionalData?.statusDate
									? base(additionalData.statusDate)
									: null}
							</CellContent>
						</RowBodyCell>
					</TableRow>
					<TableRow>
						<HeaderCell>
							<CellContent>
								{t('disposition.file_info_modal.file_info.columns.record_date')}
							</CellContent>
						</HeaderCell>
						<RowBodyCell>
							<CellContent>
								{file.createDate ? base(file.createDate) : ''}
								{!file.createDate && additionalData?.recordDate
									? base(additionalData.receivedDate)
									: null}
							</CellContent>
						</RowBodyCell>
					</TableRow>
					<TableRow>
						<HeaderCell>
							<CellContent>
								{t(
									'disposition.file_info_modal.file_info.columns.calculated_date',
								)}
							</CellContent>
						</HeaderCell>
						<RowBodyCell>
							<CellContent>
								{file.calculatedDate ? base(file.calculatedDate) : ''}
							</CellContent>
						</RowBodyCell>
					</TableRow>
					<TableRow>
						<HeaderCell>
							<CellContent>
								{t('disposition.file_info_modal.file_info.columns.subject')}
							</CellContent>
						</HeaderCell>
						<RowBodyCell>
							<CellContent>
								{file.subject ? file.subject : ''}
								{!file.subject && additionalData?.subject
									? additionalData.subject
									: null}
							</CellContent>
						</RowBodyCell>
					</TableRow>
				</TableBody>
			</DatesTable>

			<Table>
				<TableBody>
					<TableRow>
						<HeaderCell>
							<CellContent>
								{t('disposition.file_info_modal.file_info.columns.rm_class')}
							</CellContent>
						</HeaderCell>
						<RowBodyCell>
							<CellContent>{file.classificationName}</CellContent>
						</RowBodyCell>
					</TableRow>
					<TableRow>
						<HeaderCell>
							<CellContent>
								{t('disposition.file_info_modal.file_info.columns.rsi')}
							</CellContent>
						</HeaderCell>
						<RowBodyCell>
							<CellContent>{file.rsi}</CellContent>
						</RowBodyCell>
					</TableRow>
					<TableRow>
						<HeaderCell>
							<CellContent>
								{t('disposition.file_info_modal.file_info.columns.unique_id')}
							</CellContent>
						</HeaderCell>
						<RowBodyCell>
							<CellContent>{file.uniqueId}</CellContent>
						</RowBodyCell>
					</TableRow>
				</TableBody>
			</Table>
		</Tables>
	);
};
