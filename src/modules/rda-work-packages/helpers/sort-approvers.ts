import { IApprover } from 'shared/types/dispositions';

export const sortApprovers = (approvers: IApprover[]) => {
	const list = [...approvers];

	list.sort((a, b) => {
		const orderA = a.conditionalApprover
			? parseFloat(`${a.conditionalApprover}${a.orderBy}`)
			: a.orderBy;
		const orderB = b.conditionalApprover
			? parseFloat(`${b.conditionalApprover}${b.orderBy}`)
			: b.orderBy;

		return orderA - orderB;
	});

	return list;
};
