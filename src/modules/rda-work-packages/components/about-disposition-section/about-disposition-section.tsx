import React, { useMemo } from 'react';
import styled from 'styled-components';

import { IApprover, IWorkPackage } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import { ModalFooter } from 'shared/components/modal/modal-footer';
import { HeaderTitle } from 'shared/components/modal-form/header-title';
import { PageBody } from 'shared/components/modal-form/page-body';
import { PageHeader } from 'shared/components/modal-form/page-header';
import { HorizontalProgressBar } from 'shared/components/progress-bar/horizontal-progress-bar';
import { Text } from 'shared/components/text/text';
import { textVariants } from 'shared/components/text/text-variants';
import { Title } from 'shared/components/title/title';
import { titleVariants } from 'shared/components/title/title-variants';

import { UsersSection } from './users-section';

const ProgressBar = styled.div``;

const ProgressBarText = styled.div`
	display: flex;
	justify-content: space-between;
	margin-bottom: 0.8rem;

	& > * {
		* + * {
			margin-left: 0.5rem;
		}
	}
`;

const ProgressBarLabel = styled(Text)`
	display: inline-block;
	margin-right: 0.2rem;
`;

const Dates = styled.div`
	display: flex;
	justify-content: space-between;
	margin-top: 0.8rem;
`;

const CreateDate = styled(Text)`
	margin-right: 1rem;
`;

const DueDate = styled(Text)``;

const Instructions = styled.div`
	margin-top: 4.12rem;
`;

const InstructionsBody = styled(Text)`
	margin-top: 0.8rem;
	color: ${({ theme }) => theme.input.color};

	& *::marker {
		color: ${({ theme }) => theme.input.color};
	}

	&:focus-visible {
		outline: none;
	}

	& *:first-child {
		margin-top: 0;
	}

	& > * {
		margin: 0.75rem 0 0;
		${({ theme }) => textVariants(theme).body_2_primary}
	}

	.ql-align-right {
		text-align: right;
	}

	.ql-align-center {
		text-align: center;
	}

	.ql-align-justify {
		text-align: justify;
	}

	ul,
	ol {
		margin: 1.2rem 0;
		padding-left: 1.875rem;
	}

	li {
		margin: 0;
	}

	h1 {
		margin-top: 2rem;
		${({ theme }) => titleVariants(theme).h1_primary_bold}
	}

	h2 {
		margin-top: 2rem;
		${({ theme }) => titleVariants(theme).h2_primary}
	}

	h3 {
		margin-top: 1.5rem;
		${({ theme }) => titleVariants(theme).h3_primary}
	}

	a {
		color: ${({ theme }) => theme.textEditor.editor.linkColor};
		text-decoration: underline;
	}
`;

interface AboutDispositionSectionProps {
	disposition: IWorkPackage;
	approvers: IApprover[];
	creatorId: number;
	creatorName: string;
	creatorProfileImage: number;
	currentUser: IUser;
}

export const AboutDispositionSection: React.FC<
	React.PropsWithChildren<AboutDispositionSectionProps>
> = ({
	disposition,
	approvers,
	creatorId,
	creatorName,
	creatorProfileImage,
	currentUser,
	children,
}) => {
	const { t, multilingualT } = useTranslation();
	const {
		formats: { base },
	} = useDate();

	const createDate = disposition.createDate;
	const numberOfDaysToComplete = disposition.daysTotal;
	const numberOfDaysLeftToComplete = disposition.daysLeft;

	const formattedCreateDate = useMemo(() => {
		return base(disposition.createDate);
	}, [createDate]);

	return (
		<>
			<PageHeader>
				<HeaderTitle variant="h2_primary_semibold">
					{t('disposition.about_modal.title')}
				</HeaderTitle>
			</PageHeader>
			<PageBody>
				<ProgressBar>
					<ProgressBarText>
						<ProgressBarLabel variant="body_3_primary_semibold">
							{numberOfDaysLeftToComplete < 0
								? t('disposition.about_form.days_outstanding')
								: t('disposition.about_form.days_left')}
						</ProgressBarLabel>

						<Text tag="span" variant="body_4_primary">
							{numberOfDaysLeftToComplete < 0
								? `${Math.abs(numberOfDaysLeftToComplete)} days`
								: `${numberOfDaysLeftToComplete}/${numberOfDaysToComplete}`}
						</Text>
					</ProgressBarText>
					<HorizontalProgressBar
						percentage={
							(numberOfDaysLeftToComplete / numberOfDaysToComplete) * 100
						}
					/>
				</ProgressBar>
				<Dates>
					<CreateDate variant="body_4_secondary">
						{t('disposition.about_form.created')} {formattedCreateDate}
					</CreateDate>
					<DueDate variant="body_4_secondary">
						{t('disposition.about_form.due_date')} {base(disposition.dueDate)}
					</DueDate>
				</Dates>

				<UsersSection
					creatorId={creatorId}
					creatorName={creatorName}
					creatorProfileImage={creatorProfileImage}
					approvers={approvers}
					currentUser={currentUser}
				/>

				<Instructions>
					<Title variant="h3_primary_semibold">
						{t('disposition.about_form.instructions')}
					</Title>

					<InstructionsBody tag="div">
						<div
							dangerouslySetInnerHTML={{
								__html: multilingualT({
									field: 'instructions',
									translations: disposition.multilingual,
									fallbackValue: disposition.rejectButtonLabel,
								}) as string,
							}}
						/>
					</InstructionsBody>
				</Instructions>
			</PageBody>
			<ModalFooter>{children}</ModalFooter>
		</>
	);
};
