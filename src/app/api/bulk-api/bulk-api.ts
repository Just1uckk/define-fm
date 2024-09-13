import { BaseHttpServices } from 'shared/services/base-http-services';

interface BulkApiInterface {
	getHoldInformation: (rdaId: number) => Promise<any>;
	sendHoldInformation: (
		holdInformation: SendHoldInformationInterface,
	) => Promise<any>;
	getUpdateRecordsManagementMetadata: (
		rdaId: number,
	) => Promise<GetUpdateRecordsManagementDto>;
	sendRecordsManagementMetadata: (
		metadataInformation: SendMetadataInterface,
	) => Promise<any>;
	getUpdatePhysicalObject: (rdaId: number) => Promise<GetUpdatePhysicalObject>;
	sendPhysicalObject: (
		physicalInformation: SendPhysicalInterface,
	) => Promise<any>;
	getMoveInformation: (rdaId: number) => Promise<NodeFileInterface[]>;
	sendNoveInformation: (moveInformation: SendMoveInterface) => Promise<any>;
	sendRejectedState: (
		rejectedInformation: SendRejectedInterface,
	) => Promise<any>;
	getFeedbackInformation: (rdaId: number) => Promise<any[]>;
}

export interface SendApprovedInterface {
	reason: string;
	comment: string;
	state: number;
	rdaItemApprovals: number[];
}

export interface SendRejectedInterface {
	overrideComment?: string;
	reason?: string;
	comment?: string;
	rdaItems: number[];
}

export interface GetUpdatePhysicalObject {
	locationCodes: PhysicalObject[];
}

export interface NodeFileInterface {
	dataId: number;
	parentId: number;
	type: string;
	displayType: string;
	name: string;
	children: number;
}

export interface PhysicalObject {
	custodianSite: null | string;
	description: string | null;
	disabled: number;
	email: null | string;
	location: string;
}

export interface SendHoldInformationInterface {
	rdaItems: number[];
	holdAction: string;
	holdId: number;
}

export interface HoldInformationDto {
	activeHold: number;
	applyPatron: string;
	holdID: number;
	editPatron: null | any;
	holdComment: null | any;
	holdName: string;
	holdType: string;
}

export interface MetadataRsiInterfase {
	description: string | null;
	rsi: string;
}

export interface MetadataStatuslInterfase {
	description: string | null;
	status: string;
}
export interface MetadataEssentialInterfase {
	description: string | null;
	essential: string;
}
export interface MetadataEssentialInterfase {
	description: string | null;
	essential: string;
}
export interface MetadataStorageInterfase {
	description: string | null;
	storage: string;
}
export interface MetadataAccessionInterfase {
	description: string | null;
	accession: string;
}

export interface SendMetadataInterface {
	rdaItems: number[];
	rsi: string | null;
	recordDate: Date;
	status: string;
	statusDate: Date;
	essential: string;
	storage: string;
	accession: string;
	official: string;
}

export interface SendPhysicalInterface {
	rdaItems: number[];
	homeLocation: string;
	currentLocation: string;
	fromDate: Date | null;
	toDate: Date | null;
	offsiteStorageId: number | null;
	temporaryId: number | null;
}

export interface GetUpdateRecordsManagementDto {
	rmrsi: MetadataRsiInterfase[];
	rmStatusCode: MetadataStatuslInterfase[];
	rmEssCode: MetadataEssentialInterfase[];
	rmStorage: MetadataStorageInterfase[];
	rmAccession: MetadataAccessionInterfase[];
}

export interface SendMoveInterface {
	rdaItems: number[];
	targetContainerId: number;
	nameConflict: number;
	categoryRetention: number;
	classificationRetention: number;
}

export class BulkApiService implements BulkApiInterface {
	private readonly http: BaseHttpServices;

	constructor(httpService: BaseHttpServices) {
		this.http = httpService;
	}

	getHoldInformation = async (rdaId: number): Promise<HoldInformationDto[]> => {
		const payload = await this.http.get(`/api/rdamain/holdinfo/${rdaId}/true`);

		return payload.data.data;
	};

	getFeedbackInformation = async (rdaId: number): Promise<any[]> => {
		const payload = await this.http.get(
			`/api/rdaitemapproval/feedback/${rdaId}`,
		);

		return payload.data.data;
	};

	sendHoldInformation = async (
		holdInformation: SendHoldInformationInterface,
	): Promise<any> => {
		const payload = await this.http.post(
			'/api/rdamain/performhold',
			holdInformation,
		);

		return payload.data.data;
	};

	getUpdateRecordsManagementMetadata = async (
		rdaId: number,
	): Promise<GetUpdateRecordsManagementDto> => {
		const payload = await this.http.get(`/api/rdamain/getrmcodes/${rdaId}`);

		return payload.data.data;
	};

	sendRecordsManagementMetadata = async (
		metadataInformation: SendMetadataInterface,
	): Promise<any> => {
		const payload = await this.http.post(
			`/api/rdamain/updatermmetadata`,
			metadataInformation,
		);

		return payload.data.data;
	};

	getUpdatePhysicalObject = async (
		rdaId: number,
	): Promise<GetUpdatePhysicalObject> => {
		const payload = await this.http.get(`/api/rdamain/physobjcodes/${rdaId}/0`);

		return payload.data.data;
	};

	sendPhysicalObject = async (
		physicalInformation: SendPhysicalInterface,
	): Promise<any> => {
		const payload = await this.http.post(
			`/api/rdamain/updatephysobjmetadata`,
			physicalInformation,
		);

		return payload.data.data;
	};

	getMoveInformation = async (rdaId: number): Promise<NodeFileInterface[]> => {
		const payload = await this.http.post(`/api/rdamain/fetchchildren`, {
			rdaItem: { id: rdaId },
		});

		return payload.data.data.nodes;
	};

	sendNoveInformation = async (
		moveInformation: SendMoveInterface,
	): Promise<any> => {
		const payload = await this.http.post(
			`/api/rdamain/moverdaitems`,
			moveInformation,
		);

		return payload.data.data;
	};

	sendRejectedState = async (
		rejectedInformation: SendRejectedInterface,
	): Promise<any> => {
		const payload = await this.http.post(
			`/api/rdaitemapproval/override`,
			rejectedInformation,
		);

		return payload.data.data;
	};
}

export const BulkApi = new BulkApiService(new BaseHttpServices());
