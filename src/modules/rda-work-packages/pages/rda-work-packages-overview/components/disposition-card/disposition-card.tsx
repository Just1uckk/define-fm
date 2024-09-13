import React, { useMemo } from 'react';
import { LinkProps } from 'react-router-dom';
import { sortApprovers } from 'modules/rda-work-packages/helpers/sort-approvers';

import { ICoreConfig } from 'shared/types/core-config';
import { IApprover, IWorkPackage } from 'shared/types/dispositions';
import { IUser } from 'shared/types/users';

import { DISPOSITION_WORKFLOW_STATES } from 'shared/constants/constans';
import { DISPOSITIONS_ROUTES } from 'shared/constants/routes';

import { useDate } from 'shared/hooks/use-date';
import { useTranslation } from 'shared/hooks/use-translation';

import { MoreButtonProps } from 'shared/components/button/more-button';

import { IWorkPackageConfig } from '../../use-rda-work-packages-overview';

import { DispositionEntityCard } from './disposition-entity-card';
import { DispositionEntityRow } from './disposition-entity-row';

export enum DISPOSITION_CARD_VIEW_TYPES {
	ROW = 'row',
	CARD = 'card',
}

export interface DispositionBaseCardProps {
	disable?: boolean;
	view: DISPOSITION_CARD_VIEW_TYPES;
	to?: LinkProps['to'];
	linkState?: LinkProps['state'];
	isSelectable?: boolean;
	isSelected?: (id: number) => boolean;
	pageType: 'assignment' | 'workPackage';
	id: IWorkPackage['id'];
	name: IWorkPackage['name'];
	multilingual: IWorkPackage['multilingual'];
	sourceName: IWorkPackage['sourceName'];
	createDate: IWorkPackage['createDate'];
	workflowStatus: IWorkPackage['workflowStatus'];
	daysLeft: IWorkPackage['daysLeft'];
	daysTotal: IWorkPackage['daysTotal'];
	approvers: IWorkPackage['approvers'];
	createdBy: string;
	includedItemsCount: IWorkPackage['includedCount'];
	pendingItemsCount: IWorkPackage['pendingItemCount'];
	approvedItemsCount: IWorkPackage['approvedItemCount'];
	rejectedItemsCount: IWorkPackage['rejectedItemCount'];
	feedbackItemsCount: IWorkPackage['feedbackPendingItemCount'];
	currentFeedbackUser?: IApprover | boolean;
	hasMoreOptions?: boolean;
	moreOptions?: MoreButtonProps['options'];
	onSelect?: (id: number) => void;
}

interface DispositionCardProps {
	disable?: boolean;
	workPackage: IWorkPackage;
	workPackageConfigs?: ICoreConfig[] | [];
	currentUser: IUser;
	view: DispositionBaseCardProps['view'];
	pageType: DispositionBaseCardProps['pageType'];
	sourceName: DispositionBaseCardProps['sourceName'];
	isSelectable?: DispositionBaseCardProps['isSelectable'];
	isSelected?: DispositionBaseCardProps['isSelected'];
	hasMoreOptions?: DispositionBaseCardProps['hasMoreOptions'];
	currentLocation?: string;
	onVerifyApproverRights?: () => void;
	onComplete?: () => void;
	onGenerateAudit?: (data: IWorkPackage) => void;
	onInitiate?: (id: IWorkPackage['id']) => void;
	onReassign?: (id: IWorkPackage['id']) => void;
	onRecall?: (id: IWorkPackage['id']) => void;
	onForceApproval?: () => void;
	onModifyApprovers?: (id: IWorkPackage['id']) => void;
	onDelete?: () => void;
	onSelect?: DispositionBaseCardProps['onSelect'];
}

export const DispositionCard: React.FC<DispositionCardProps> = ({
	disable,
	workPackage,
	workPackageConfigs,
	view,
	sourceName,
	currentUser,
	hasMoreOptions = true,
	currentLocation,
	onVerifyApproverRights,
	onComplete,
	onGenerateAudit,
	onInitiate,
	onReassign,
	onRecall,
	onForceApproval,
	onModifyApprovers,
	onDelete,
	...props
}) => {
	const {
		formats: { base },
	} = useDate();
	const { t, currentLang } = useTranslation();

	const currentFeedbackUser: any = useMemo(() => {
		let feedbackUserInfo: IApprover | boolean = false;
		if (workPackage && currentUser) {
			workPackage.feedbackUsers.forEach((element) => {
				if (element.userId === currentUser.id) {
					feedbackUserInfo = element;
				}
			});
			return feedbackUserInfo;
		}
		return feedbackUserInfo;
	}, [workPackage]);

	const moreOptions: MoreButtonProps['options'] = useMemo(() => {
		if (!hasMoreOptions) {
			return [];
		}

		if (workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.PENDING) {
			return [
				{
					key: 'modify_approvers',
					label: t('disposition.actions.modify_approvers'),
					onSelect: () =>
						onModifyApprovers && onModifyApprovers(workPackage.id),
				},
				{
					key: 'verify_approvers',
					label: t('disposition.actions.verify_approvers_rights'),
					onSelect: () => onVerifyApproverRights && onVerifyApproverRights(),
				},
				{
					key: 'generate_audit',
					label: t('disposition.actions.generate_audit_report'),
					onSelect: () => onGenerateAudit && onGenerateAudit(workPackage),
				},
				{
					key: 'initiate',
					label: t('disposition.actions.initiate'),
					onSelect: () => onInitiate && onInitiate(workPackage.id),
				},
				{
					key: 'delete',
					label: t('disposition.actions.delete'),
					onSelect: () => onDelete && onDelete(),
				},
			];
		}

		if (workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.INITIATED) {
			const options = [
				{
					key: 'force_approval',
					label: t('disposition.actions.force_approval'),
					onSelect: () => onForceApproval && onForceApproval(),
				},
				{
					key: 'verify_approvers',
					label: t('disposition.actions.verify_approvers_rights'),
					onSelect: () => onVerifyApproverRights && onVerifyApproverRights(),
				},
				{
					key: 'generate_audit',
					label: t('disposition.actions.generate_audit_report'),
					onSelect: () => onGenerateAudit && onGenerateAudit(workPackage),
				},
				{
					key: 'modify_approvers',
					label: t('disposition.actions.modify_approvers'),
					onSelect: () =>
						onModifyApprovers && onModifyApprovers(workPackage.id),
				},
				{
					key: 'recall',
					label: t('disposition.actions.recall'),
					onSelect: () => onRecall && onRecall(workPackage.id),
				},
			];

			if (workPackageConfigs && workPackageConfigs.length) {
				for (const config of workPackageConfigs) {
					if (
						config.property === IWorkPackageConfig.AllowReassign &&
						config.value === 'true'
					) {
						options.unshift({
							key: 'reassign',
							label: t('disposition.actions.reassign'),
							onSelect: () => onReassign && onReassign(workPackage.id),
						});
					}
				}
			}
			return options;
		}

		if (
			workPackage.workflowStatus ===
				DISPOSITION_WORKFLOW_STATES.READY_TO_COMPLETE ||
			workPackage.workflowStatus === DISPOSITION_WORKFLOW_STATES.ARCHIVE
		) {
			const actions: MoreButtonProps['options'] = [
				{
					key: 'generate_audit',
					label: t('disposition.actions.generate_audit_report'),
					onSelect: () => onGenerateAudit && onGenerateAudit(workPackage),
				},
				{
					key: 'recall',
					label: t('disposition.actions.recall'),
					onSelect: () => onRecall && onRecall(workPackage.id),
				},
				{
					key: 'delete',
					label: t('disposition.actions.delete'),
					onSelect: () => onDelete && onDelete(),
				},
			];

			if (
				workPackage.workflowStatus ===
				DISPOSITION_WORKFLOW_STATES.READY_TO_COMPLETE
			) {
				actions.unshift({
					key: 'complete',
					label: t('disposition.actions.archive'),
					onSelect: () => onComplete && onComplete(),
				});
			}

			return actions;
		}

		return [];
	}, [currentLang, workPackage.workflowStatus, workPackageConfigs]);

	const sortedApprovers = useMemo(
		() => sortApprovers(workPackage.approvers),
		[workPackage.approvers],
	);

	const isAssignmentsPage = props.pageType === 'assignment';
	const isWorkPackagePage = props.pageType === 'workPackage';

	let to;
	if (isWorkPackagePage) {
		to = DISPOSITIONS_ROUTES.RDA_WORK_PACKAGE.generate(workPackage.id);
	}
	if (isAssignmentsPage) {
		to = DISPOSITIONS_ROUTES.RDA_ASSIGNMENT.generate(workPackage.id);
	}

	const Entity =
		view === DISPOSITION_CARD_VIEW_TYPES.ROW
			? DispositionEntityRow
			: DispositionEntityCard;

	return (
		<Entity
			disable={disable}
			id={workPackage.id}
			to={to}
			linkState={{ from: currentLocation }}
			name={workPackage.name}
			multilingual={workPackage.multilingual}
			createDate={base(workPackage.createDate)}
			createdBy={workPackage.createdByDisplay}
			workflowStatus={workPackage.workflowStatus}
			daysLeft={workPackage.daysLeft}
			daysTotal={workPackage.daysTotal}
			includedItemsCount={workPackage.includedCount}
			pendingItemsCount={
				currentFeedbackUser
					? currentFeedbackUser.pending
					: workPackage?.pendingItemCount
			}
			approvedItemsCount={
				currentFeedbackUser
					? currentFeedbackUser.approved
					: workPackage?.approvedItemCount
			}
			rejectedItemsCount={
				currentFeedbackUser
					? currentFeedbackUser.rejected
					: workPackage?.rejectedItemCount
			}
			feedbackItemsCount={
				currentFeedbackUser ? 0 : workPackage?.feedbackPendingItemCount
			}
			currentFeedbackUser={currentFeedbackUser}
			approvers={sortedApprovers}
			moreOptions={hasMoreOptions ? moreOptions : undefined}
			sourceName={
				currentFeedbackUser
					? `${sourceName} - ${t(
							'disposition.files_state_count.feedback_label',
					  )}`
					: sourceName
			}
			{...props}
		/>
	);
};
