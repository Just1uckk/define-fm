import { Option } from 'shared/components/select/select';

export interface FilterDataDto {
	total: string;
	totalBytes: number;
	sizeName: string;
}

export interface IApprovedListResponse {
	id: number;
	name: string;
	statKey: string;
	value: number;
	period: Date;
}

export const filterData = (data: any | undefined): FilterDataDto => {
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	let total: any = 0;

	if (data) {
		total = Object.values(data);
		total = total.reduce((partialSum, a) => partialSum + a, 0);
	}

	if (total === 0) {
		return {
			total: total.toString(),
			totalBytes: total,
			sizeName: sizes[0],
		};
	} else {
		const i = Math.min(
			Math.floor(Math.log(total) / Math.log(1024)),
			sizes.length - 1,
		);

		return {
			total: (total / 1024 ** i).toFixed(1),
			totalBytes: total,
			sizeName: sizes[i],
		};
	}
};

export const differenceData = (
	data: any | undefined,
	lastData: any | undefined,
): number => {
	let diskData: any = 0;
	let diskLastData: any = 0;

	if (data && lastData) {
		diskData = Object.values(data);
		diskData = diskData.reduce((partialSum, a) => partialSum + a, 0);
		diskLastData = Object.values(lastData);
		diskLastData = diskLastData.reduce((partialSum, a) => partialSum + a, 0);

		if (diskData > 0 && diskLastData > 0) {
			if (diskData > diskLastData) {
				return Number(((diskData / diskLastData) * 100).toFixed(1));
			}
			if (diskData < diskLastData) {
				return Number(((diskLastData / diskData) * 100 * -1).toFixed(1));
			}
			return 0;
		}
	} else {
		return 0;
	}
	return 0;
};
