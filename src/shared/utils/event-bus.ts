import EventEmitter from 'eventemitter3';

export enum GROUP_GLOBAL_EVENTS {
	findGroups = 'find_groups',
}

export enum TABLE_GLOBAL_EVENTS {
	set_column_order = 'set_column_order',
	toggle_hidden_columns = 'toggle_hidden_columns',
}

export type EventBusEvents = GROUP_GLOBAL_EVENTS | TABLE_GLOBAL_EVENTS;

const eventEmitter = new EventEmitter();

const Emitter = {
	on: (event: EventBusEvents, fn) => eventEmitter.on(event, fn),

	once: (event: EventBusEvents, fn) => eventEmitter.once(event, fn),

	off: (event: EventBusEvents, fn) => eventEmitter.off(event, fn),

	emit: (event: EventBusEvents, payload?) => eventEmitter.emit(event, payload),
};

Object.freeze(Emitter);

export { Emitter as EventBus };
