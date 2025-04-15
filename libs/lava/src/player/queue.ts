import { ManagerQueueOptions, ManagerUtils, Queue as Qe, QueueChangesWatcher, QueueSaver, StoredQueue, Track, UnresolvedTrack } from "lavalink-client";
import { TrackOrTracks, QueueResult } from "../types/index.js";
import { Tokens } from "@ariijs/utils";
import { LavalinkManager } from "../manager/lavalinkManager.js";

export class Queue extends Qe {
    // public tracks: (Track | UnresolvedTrack)[] = [];
    // public previous: Track[] = [];

    protected isShuffled: boolean = false;
    backup: (Track | UnresolvedTrack)[] = [];

    protected managerUtilsCustom: ManagerUtils;
    protected queueChangesCustom: QueueChangesWatcher | null;
    protected readonly guildIdCustom: string = "";

    protected readonly manager: LavalinkManager; // Reference to the LavalinkManager


    constructor(guildId: string, manager: LavalinkManager, data: Partial<StoredQueue> = {}, QueueSaver?: QueueSaver, queueOptions?: ManagerQueueOptions) {
        super(guildId, data, QueueSaver, queueOptions);

        this.manager = manager; // Assign the manager
        this.queueChangesCustom = queueOptions?.queueChangesWatcher || null;
        this.guildIdCustom = guildId;
        this.managerUtilsCustom = new ManagerUtils(this.manager);

        // this.previous = Array.isArray(data.previous) && data.previous.some(track => this.managerUtilsCustom.isTrack(track) || this.managerUtilsCustom.isUnresolvedTrack(track)) ? data.previous.filter(track => this.managerUtilsCustom.isTrack(track) || this.managerUtilsCustom.isUnresolvedTrack(track)) : [];
        // this.tracks = Array.isArray(data.tracks) && data.tracks.some(track => this.managerUtilsCustom.isTrack(track) || this.managerUtilsCustom.isUnresolvedTrack(track)) ? data.tracks.filter(track => this.managerUtilsCustom.isTrack(track) || this.managerUtilsCustom.isUnresolvedTrack(track)) : [];
    };
    /** returns true if the queue is shuffled */
    get shuffled() {
        return this.isShuffled;
    };
    /**
     * leaves the queue empty and sets the given tracks to the queue
     * @example
     * ```ts
     * player.queue.setTracks = [track1, track2, track3]; // sets tracks
     * player.queue.setTracks = []; // clears tracks
     * ```
     */
    public set setTracks(trackOrTracks: TrackOrTracks) {
        let tracksAdded: (Track | UnresolvedTrack)[] = (Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks])
            .filter(v => this.managerUtilsCustom.isTrack(v) || this.managerUtilsCustom.isUnresolvedTrack(v))
            .map((track) => {
                if (!track.userData?.cid) { // only add custom id if it doesn't exist
                    const snowflake = Tokens.getRandomToken(); // generate a new id for each track
                    if (!track.userData) {
                        track.userData = {
                            cid: snowflake
                        };
                    } else {
                        track.userData.cid = snowflake;
                    };
                };
                // if track source is played from deezer provider, add the arl to the userData
                if (["deezer", "spotify", "apple"].some(v => track.info.sourceName?.includes(v))) {
                    if (!track.userData.arl) {
                        const arl = this.manager.getDeezerArl();
                        if (arl) track.userData.arl = arl;
                    };
                }
                return track;
            })
            ;
        if (tracksAdded.length) {
            this.tracks.splice(0, this.tracks.length, ...tracksAdded);
            if (this.shuffled) this.backup.push(...tracksAdded);
        } else this.tracks.splice(0, this.tracks.length);
    }

    /**
     * leaves the previous tracks empty and sets the given tracks to the previous trackss
     * @example
     * ```ts
     * player.queue.setPrevious = [track1, track2, track3]; // sets tracks
     * player.queue.setPrevious = []; // clears tracks
     * ```
     */
    public set setPrevious(trackOrTracks: Track | Track[]) {
        let tracksAdded: Track[] = (Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks])
            .filter(v => this.managerUtilsCustom.isTrack(v))
            .map((track) => {
                if (!track.userData?.cid) { // only add custom id if it doesn't exist
                    const snowflake = Tokens.getRandomToken(); // generate a new id for each track
                    if (!track.userData) {
                        track.userData = {
                            cid: snowflake
                        };
                    } else {
                        track.userData.cid = snowflake;
                    };
                };
                return track;
            })
            ;
        if (tracksAdded.length) {
            this.previous.splice(0, this.previous.length, ...tracksAdded);
            if (this.shuffled) this.backup.unshift(...tracksAdded);
        }
        else this.previous.splice(0, this.previous.length);
    }

    /**
     * Add a Track to the Queue, and after saved in the "db" it returns the amount of the Tracks
     * @param TrackOrTracks Track or Tracks to add to the queue
     * @param index At what position to add the Track
     * @returns queue size, total tracks and tracks added
     */
    public async add(trackOrTracks: TrackOrTracks, index?: number): Promise<QueueResult> {
        let tracksAdded: (Track | UnresolvedTrack)[] = (Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks])
            .filter(v => this.managerUtilsCustom.isTrack(v) || this.managerUtilsCustom.isUnresolvedTrack(v))
            .map((track) => {
                if (!track.userData?.cid) { // only add custom id if it doesn't exist
                    const snowflake = Tokens.getRandomToken(); // generate a new id for each track
                    if (!track.userData) {
                        track.userData = {
                            cid: snowflake
                        };
                    } else {
                        track.userData.cid = snowflake;
                    };
                };
                // if track source is played from deezer provider, add the arl to the userData
                // check if any arls are defined in the lavalink manager constructor
                if (this.manager.deezer && (this.manager.deezer.arls?.length || this.manager.deezer.premiumArls?.length)) {
                    if (["deezer", "spotify", "apple"].some(v => track.info.sourceName?.includes(v))) {
                        if (!track.userData.arl) {
                            const arl = this.manager.getDeezerArl();
                            if (arl) track.userData.arl = arl;
                        };
                    };
                }
                return track;
            })
            ;

        if (typeof index === "number" && index >= 0 && index < this.tracks.length) {
            const splice = await this.splice(index, 0, tracksAdded);
            return splice
        }

        const oldStored = typeof this.queueChangesCustom?.tracksAdd === "function" ? this.utils.toJSON() : null;
        // add the track(s)
        this.tracks.push(...tracksAdded);
        // log if available
        if (typeof this.queueChangesCustom?.tracksAdd === "function") {
            try {
                this.queueChangesCustom.tracksAdd(this.guildIdCustom, tracksAdded, this.tracks.length, oldStored!, this.utils.toJSON());
            } catch (error) {
                throw error
            }
        };

        if (this.shuffled) this.backup.push(...tracksAdded.filter(t => this.backup.some(t2 => t2.userData!.cid !== t.userData!.cid)));

        // save the queue
        await this.utils.save();

        return {
            queueSize: this.tracks.length,
            tracks: this.tracks,
            tracksAdded: tracksAdded
        }
    };

    /**
     * Splice the tracks in the Queue
     * @param start Where to remove the Track
     * @param deleteCount How many Tracks to remove?
     * @param TrackOrTracks Want to Add more Tracks?
     * @returns queue size, total tracks and tracks added if any
     */
    public async splice(start: number, deleteCount: number, trackOrTracks?: TrackOrTracks): Promise<QueueResult> {
        let tracksAdded: (Track | UnresolvedTrack)[] = [];

        if (trackOrTracks) {
            tracksAdded = (Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks])
                .filter(v => this.managerUtilsCustom.isTrack(v) || this.managerUtilsCustom.isUnresolvedTrack(v))
                .map((track) => {
                    if (!track.userData?.cid) { // only add custom id if it doesn't exist
                        const snowflake = Tokens.getRandomToken(); // generate a new id for each track
                        if (!track.userData) {
                            track.userData = {
                                cid: snowflake
                            };
                        } else {
                            track.userData.cid = snowflake;
                        };
                    };
                    // if track source is played from deezer provider, add the arl to the userData
                    if (["deezer", "spotify", "apple"].some(v => track.info.sourceName?.includes(v))) {
                        if (!track.userData?.arl) {
                            const arl = this.manager.getDeezerArl();
                            if (arl) track.userData.arl = arl;
                        };
                    }
                    return track;
                })
                ;
        }

        const oldStored = typeof this.queueChangesCustom?.tracksAdd === "function" || typeof this.queueChangesCustom?.tracksRemoved === "function" ?
            this.utils.toJSON() : null;

        // if no tracks to splice, add the tracks
        if (!this.tracks.length) {
            if (tracksAdded.length) return await this.add(tracksAdded, start);
        }
        // Log if available
        if ((tracksAdded) && typeof this.queueChangesCustom?.tracksAdd === "function") {
            try {
                this.queueChangesCustom.tracksAdd(this.guildIdCustom, tracksAdded, start, oldStored!, this.utils.toJSON());
            } catch { };
        }
        // remove the tracks (and add the new ones)
        let spliced = tracksAdded.length ? this.tracks.splice(start, deleteCount, ...tracksAdded) : this.tracks.splice(start, deleteCount);
        // get the spliced array
        spliced = (Array.isArray(spliced) ? spliced : [spliced]);
        // Log if available
        if (typeof this.queueChangesCustom?.tracksRemoved === "function") {
            try {
                this.queueChangesCustom.tracksRemoved(this.guildIdCustom, spliced, start, oldStored!, this.utils.toJSON());
            } catch { };
        }
        // save the queue
        await this.utils.save();

        if (tracksAdded.length && this.shuffled) this.backup.push(...tracksAdded.filter(t => this.backup.some(t2 => t2.userData!.cid !== t.userData!.cid)));

        return {
            queueSize: this.tracks.length,
            tracks: this.tracks,
            tracksAdded: tracksAdded
        }
    };

    /**
     * Shuffles the current Queue, then saves it.
     * This method is simple. Consider using toggleShuffle() for a more advanced implementation.
     */
    public async shuffle(): Promise<number> {
        return await super.shuffle();
    };

    /** enables/disables shuffle of the entire queue */
    public toggleShuffle(): (Track | UnresolvedTrack)[] {
        if (this.shuffled) {
            this.isShuffled = false;
            let currentTrackIndex = this.previous.length;
            
            let bc = this.backup.filter(t => {
                const cids = [];
                if (this.previous.length) cids.push(...this.previous.map(t => t.userData!.cid));
                if (this.current) cids.push(this.current.userData!.cid);
                if (this.tracks.length) cids.push(...this.tracks.map(t => t.userData!.cid));
                // only add the tracks that are in the current queue
                if (cids.includes(t.userData!.cid)) return true
                else return false;
            });
            console.log("toggle off: ", bc.length);
            if (this.current) bc = bc.filter(t => this.current?.userData!.cid !== t.userData!.cid)
            // restore queue
            this.setPrevious = bc.slice(0, currentTrackIndex).filter(t => this.managerUtilsCustom.isTrack(t));
            this.setTracks = bc.slice(currentTrackIndex);
        } else {
            this.isShuffled = true;
            this.backup = [];
            console.log("toggle on: ", this.backup.length);
            if (this.previous.length) this.backup.push(...[...this.previous].reverse().filter(t => this.backup.some(t2 => t2.userData!.cid !== t.userData!.cid)));
            if (this.current && this.backup.some(t => t.userData!.cid !== this.current?.userData!.cid)) this.backup.push(this.current);
            if (this.tracks.length) this.backup.push(...this.tracks.filter(t => this.backup.some(t2 => t2.userData!.cid !== t.userData!.cid)));
            console.log("toggle on previous: ", this.previous.length, " tracks: ", this.tracks.length);
            // shuffle the queue
            this.setPrevious = this.shufflePrevious(this.previous);
            this.setTracks = this.shuffleTracks(this.tracks);

            console.log("toggle on: ", this.backup.length);

            console.log("-------------------------------------------");
        }
        return this.tracks;
    }

    private shuffleTracks(array: (Track | UnresolvedTrack)[]): (Track | UnresolvedTrack)[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    private shufflePrevious(array: Track[]): Track[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

}