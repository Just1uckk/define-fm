export type ICoreConfigSectionGroup = Record<string, string>;

export interface ICoreConfig {
	id: number;
	property: string; //core.general.email.smtp.from;
	presentation: {
		presentation:
			| 'dropdown'
			| 'textinput'
			| 'textarea'
			| 'toggle'
			| 'wysiwyg'
			| 'button';
		events?: {
			click?: string; // value is event name
		};
		value: string;
		label: string;
		values: {
			src: string;
			api: string;
			label: string;
			value: string;
			values?: Array<{ value: string; label: string }>;
		};
		validation: {
			range?: {
				min: number;
				max: number;
			};
			regex?: string;
			required: boolean;
			max?: number;
			min?: number;
		};
		multivalue?: {
			min: number;
			max: number;
			delimiter: string; //";"
		};
		default: any;
	};
	value: string;
	configType: 'String' | 'Number'; //"String"
	group: string; // "rda"
	section: string; //"rda.email"
}

export interface ICoreLang {
	id: number;
	code: 'en' | 'fr_CA';
	name: string;
	enabled: boolean;
}
