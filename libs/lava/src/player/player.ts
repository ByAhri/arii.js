import { Player as PL, PlayerOptions, QueueSaver, RepeatMode, Track, UnresolvedTrack } from "lavalink-client";
import { Queue } from "./queue.js";
import { LavalinkManager } from "../manager/lavalinkManager.js";
import { Utils, Format } from "@ariijs/utils";

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
     * Skip the current song, or a specific amount of songs
     * @param skipTo provide the index of the next track to skip to or a string to search for a track title
     * @param throwError if true, throws an error if the skip fails
     * @param [withPrevious=false] set true to enable full queue skipping (previous tracks included)
     */
    async skip(skipTo: number | string = 0, throwError: boolean = true, withPrevious: boolean = false): Promise<this> {
        let arr = this.queue.tracks;

        if (withPrevious) {
            arr = [];
            if (this.queue.previous.length) arr.push(...[...this.queue.previous].reverse());
            if (this.queue.current) arr.push(this.queue.current);
            if (this.queue.tracks.length) arr.push(...this.queue.tracks);
        };

        if (!arr.length && (throwError || (typeof skipTo === "boolean" && skipTo === true))) {
            if (throwError) throw new RangeError("Can't skip more than the queue size")
            else return this;
        }

        let targetIndex = 0;

        if (typeof skipTo === "number" || (typeof skipTo === "string" && !isNaN(Number(skipTo)))) {
            targetIndex = Number(skipTo);
            if (targetIndex >= arr.length || targetIndex < 0) {
                if (throwError) throw new RangeError("Can't skip more than the queue size")
                else return this;
            };
        } else if (typeof skipTo === "string") {
            const lowerSkipTo = Format.accentToNormal(skipTo.toLowerCase());
            const titles = arr.map(track => {
                let t = Format.accentToNormal(track.info.title.toLowerCase());
                if (track.info.author) t += " " + Format.accentToNormal(track.info.author.toLowerCase());
                return t;
            });
            const result = Utils.findMostSimilar(lowerSkipTo, titles, 20); // Adjust threshold as needed

            if (!result) {
                if (throwError) throw new RangeError("No sufficiently similar track found matching the provided title")
                else return this;
            }

            targetIndex = titles.indexOf(result.match); // Get the index of the best match
        }

        let currentTrackIndex = this.queue.previous.length;
        if (skipTo && withPrevious) {
            if (targetIndex > currentTrackIndex) {
                const set = arr.slice(0, targetIndex) as Track[];
                await this.queue.setPrevious([...set].reverse());
                await this.queue.setTracks(arr.slice(targetIndex));
            } else if (targetIndex < currentTrackIndex) {
                const set: (Track | UnresolvedTrack)[] = arr.slice(targetIndex);
                await this.queue.setTracks(set);
                await this.queue.setPrevious([...arr.slice(0, targetIndex)].reverse() as Track[]);
            }

        } else if (skipTo && !withPrevious && targetIndex > 1) {
            await this.queue.splice(0, targetIndex - 1);
        };

        if (!this.playing && !this.queue.current) {
            this.play();
            return this;
        };

        const now = performance.now();
        this.set("internal_skipped", true);

        if (this.queue.current) {
            await this.node.updatePlayer({ guildId: this.guildId, playerOptions: { track: { encoded: null }, paused: false } });
            if (skipTo && withPrevious) await this.queue.shiftPrevious();
        } else {
            await this.node.updatePlayer({ guildId: this.guildId, playerOptions: { track: { encoded: null }, paused: false } });
        };

        this.ping.lavalink = Math.round((performance.now() - now) / 10) / 100;

        return this;
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

        try {
            await this.skip();
        } catch (error) {
            throw error;
        };

        if (currentTrack) this.queue.previous.shift();

        this.ping.lavalink = Math.round((performance.now() - now) / 10) / 100;

        return this;
    };
}