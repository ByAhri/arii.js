import { LavalinkManager, Player as PL, PlayerOptions, QueueSaver } from "lavalink-client";
import { AriiQueue } from "./queue.js";
import { AriiLavalinkManager } from "../manager/lavalinkManager.js";

export class AriiPlayer extends PL {
    public LavalinkManager: AriiLavalinkManager;
    public queue: AriiQueue;

    constructor(options: PlayerOptions, lavalinkManager: AriiLavalinkManager) {
        super(options, lavalinkManager);
        this.LavalinkManager = lavalinkManager;
        let queueSaver = this.LavalinkManager.options.queueOptions ? new QueueSaver(this.LavalinkManager.options.queueOptions) : undefined
        this.queue = new AriiQueue(this.guildId, {}, queueSaver, this.LavalinkManager.options.queueOptions); // Initialize with AriiQueue
    }
}