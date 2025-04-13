import { ManagerQueueOptions, Queue as Qe, QueueSaver, StoredQueue } from "lavalink-client";

export class AriiQueue extends Qe {
    constructor(guildId: string, data?: Partial<StoredQueue>, QueueSaver?: QueueSaver, queueOptions?: ManagerQueueOptions) {
        super(guildId, data, QueueSaver, queueOptions);
    }
}