export interface IGroup {
	id: number;
	appGroup: boolean;
	name: string;
	comment: null | string;
	enabled: null | boolean;
	createdBy: number;
	createdByDisplay: string;
	createdOn: string;
	modifiedBy: number;
	modifiedOn: string;
}
