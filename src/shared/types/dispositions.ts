import { LanguageTypes } from 'shared/types/users';

import {
	APPROVAL_STATES,
	APPROVER_STATES,
	DISPOSITION_WORKFLOW_STATES,
	RDA_ASSIGNMENT_ITEM_STATES,
} from 'shared/constants/constans';

export interface IDispositionType {
	id: number;
	name: string;
	clazz: string;
}

export interface IDispositionTypeDisposition {
	dispositionId: string;
	name: string;
	source: string;
}

export interface IDispositionTypeSnapshot {
	dispositionId: string;
	name: string;
	snapshotDate: string;
	snapshotId: string;
	source: number;
}

export interface IWorkPackage {
	id: number;
	name: string;
	instructions: string;
	createDate: string;
	initiateDate: string;
	snapshotDate: string;
	numberOfDaysToComplete: number;
	daysLeft: number;
	daysTotal: number;
	itemCount: number;
	includedCount: number;
	excludedCount: number;
	approvedItemCount: number;
	pendingItemCount: number;
	rejectedItemCount: number;
	feedbackPendingItemCount: number;
	approveButtonLabel: string;
	rejectButtonLabel: string;
	securityOverride: 1 | 0;
	autoprocessApprovedItems: 1 | 0;
	workflowStatus: DISPOSITION_WORKFLOW_STATES;
	approvers: IApprover[];
	activeFeedbackUserIds: number[];
	rdaType: number;
	dispNodeId: number;
	sourceId: number;
	sourceName: string;
	sourceClazz: string;
	createBy: number;
	createdByDisplay: string;
	createdByProfileImage: number;
	completedDate: string | null;
	dueDate: string;
	dispositionActionId: number;
	feedbackUsers: IApprover[];
	multilingual: Record<
		'name' | 'comment',
		Record<LanguageTypes, string>
	> | null;
}

export type IFileFullPath = string;

export type IFileFullPathTotal = any;

interface DispositionActionDto {
	dateField: any[];
	dispositionActionProviders: any[];
	id: number;
	multilingual: any;
	name: string;
}

export interface IFile {
	id: number;
	rdaId: number;
	dataid: number;
	fileNumber: string;
	parent: string;
	parentPath: string;
	name: string;
	mimeType: string | null;
	essential: string;
	uniqueId: string;
	included: 0 | 1;
	includedIn: number;
	location: string | null;
	namePath: string | null;
	status: string;
	statusDate: string | null;
	calculatedDate: string | null;
	classificationName: string;
	comment: string;
	objectOwner: string;
	groupOwner: string;
	rsi: string;
	subject: null | string;
	receivedDate: string;
	official: 0 | 1;
	originator: string;
	addressee: null;
	createDate: string;
	gif: null | string;
	approvalHistory: IApprovalHistory[];
	action: string | null;
	actionMain: string;
	dispositionAction: DispositionActionDto;
	approvals: Array<{
		approverId: number;
		userId: number | null;
		userDisplay: string;
		userProfile: string;
		state: APPROVAL_STATES;
	}>;
}

export interface IFileCategory {
	name: string;
	sets: Array<{
		name: string;
		rows: Array<{
			attributes: Array<{
				name: string;
				values: Array<IFileCategoryAttrValue>;
			}>;
		}>;
	}>;
}

export interface IFileSpecifics {
	infoBox: null | string;
	infoClient: null | string;
	infoLocation: null | string;
	infoOffsiteStorageId: null | string;
	infoTempId: null | string;
	infoType: null | string;
}

export type IFileCategoryAttrValue = boolean | number | string;

export interface IApprover {
	approverId: number;
	approverType: number;
	assignedDate: string;
	completedDate: string | null;
	conditionalApprover: 0 | 1;
	feedbackForId: number;
	forcedById: number;
	memberAcceptGroupId: number;
	memberAcceptedDate: string | null;
	orderBy: number;
	rdaId: number;
	state: APPROVER_STATES;
	userId: number;
	userDisplayName: string;
	userProfileImage: number;
	pending: number;
	approved: number;
	rejected: number;
}

export interface IRdaAssignmentItem {
	id: number;
	parent: string;
	uniqueId: string;
	calculatedDate: string | null;
	approverId: number;
	approverUserId: number;
	forcedById: number | null;
	item: IFile & { rdamain: IWorkPackage };
	itemComment: string | null;
	itemId: number;
	lastEditedById: number;
	reason: string | null;
	stateContext: number;
	state: RDA_ASSIGNMENT_ITEM_STATES;
	feedback: Array<IApprover['approverId']>;
	approvals: Array<{
		approverId: number;
		userId: number | null;
		userDisplay: string;
		userProfile: string;
		state: APPROVAL_STATES;
	}>;
}

export type IExtensionReason = string;

export interface IApprovalHistory {
	id: number;
	approverId: number;
	approverType: boolean;
	forcedById: number | null;
	historyDate: string;
	historyObjectId: number;
	historyUser: number;
	itemComment: string | null;
	itemId: number;
	lastEditedById: number;
	rdaId: number;
	reason: string | null;
	state: RDA_ASSIGNMENT_ITEM_STATES;
	stateContext: number;
	userDisplay: string;
	userProfileImage: string;
}

export interface IFeedbackHistory {
	approverId: number;
	approverState: number;
	forcedById: number | null;
	id: number;
	itemComment: string | null;
	lastEditedById: number;
	overrideReason: string | null;
	reason: string | null;
	requestorDisplayName: string;
	requestorId: number;
	requestorProfileImage: string;
	state: RDA_ASSIGNMENT_ITEM_STATES;
	userDisplay: string;
	userId: number;
	userProfileImage: string;
}

export interface IDispositionTableTab {
	tabIndex: number;
	tabLabel: string;
	count: number;
	workflowStatus: Array<DISPOSITION_WORKFLOW_STATES>;
}
