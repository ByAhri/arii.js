import { Player as PL, PlayerOptions, QueueSaver, RepeatMode } from "lavalink-client";
import { Queue } from "./queue.js";
import { LavalinkManager } from "../manager/lavalinkManager.js";

export class Player extends PL {
    LavalinkManager: LavalinkManager;
    queue: Queue;
    /** returns true if the player is paused (track paused) */
    paused: boolean = false;

    constructor(options: PlayerOptions, lavalinkManager: LavalinkManager) {
        super(options, lavalinkManager);

        this.LavalinkManager = lavalinkManager;

        let queueSaver = this.LavalinkManager.options.queueOptions ? new QueueSaver(this.LavalinkManager.options.queueOptions) : undefined
        this.queue = new Queue(this.guildId, this.LavalinkManager, {}, queueSaver, this.LavalinkManager.options.queueOptions); // Initialize with AriiQueue
    };

    /**
     * similar to skip, but it goes to the previous track. use this instead of adding the previous track to the queue and skipping for yourself
     * @param throwError if true, it throws an error if there's no previous track
     * @returns the player
     */
    public async previous(throwError: boolean = true): Promise<this | null> {
        const previousTrack = this.queue.previous[0];
        const currentTrack = this.queue.current;
        if (!previousTrack) {
            if (throwError) throw new RangeError("there's no previous track");
            return null;
        }

        const now = performance.now();

        if (currentTrack) await this.queue.add(currentTrack, 0); // add current track next
        await this.queue.add(previousTrack, 0); // add previous track next (so current track is after the previous track added next now)

        this.queue.previous.shift(); // remove previous track from previous list cause it's gonna go next now

        this.skip()
            .then(player => {
                // after skipping, the current track will be added to the previous list, so we remove it too cause it's after the next track (former previous)
                if (currentTrack) player.queue.previous.shift();
            })
            .catch(e => {
                console.error(e);
            });

        this.ping.lavalink = Math.round((performance.now() - now) / 10) / 100;

        return this;
    }
}