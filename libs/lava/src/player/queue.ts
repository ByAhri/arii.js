import { ManagerQueueOptions, ManagerUtils, Queue as Qe, QueueChangesWatcher, QueueSaver, StoredQueue, Track, UnresolvedTrack } from "lavalink-client";
import { TrackOrTracks, QueueResult } from "../types/index.js";
import { Tokens } from "@ariijs/utils";
import { LavalinkManager } from "../manager/lavalinkManager.js";

export class Queue extends Qe {

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
    };
    /** returns true if the queue is shuffled */
    get shuffled() {
        return this.isShuffled;
    };
    /**
     * leaves the queue empty and sets the given tracks to the queue
     * @example
     * ```ts
     * player.queue.setTracks([track1, track2, track3]); // sets tracks
     * player.queue.setTracks(); // clears tracks
     * ```
     */
    public async setTracks(trackOrTracks: TrackOrTracks = []) {
        let tracksAdded: (Track | UnresolvedTrack)[] = (Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks])
            .filter(v => this.managerUtilsCustom.isTrack(v) || this.managerUtilsCustom.isUnresolvedTrack(v))
            .map((track) => {
                const snowflake = Tokens.getRandomToken(); // generate a new id for each track
                if (!track.userData) track.userData = { cid: snowflake }
                else track.userData.cid = snowflake;
                // if track source is played from provider, add the arl to the userData
                // check if any arls are defined in the lavalink manager constructor
                if (this.manager.deezer && (this.manager.deezer.arls?.length || this.manager.deezer.premiumArls?.length)) {
                    if (["deezer", "spotify", "apple"].some(v => track.info.sourceName?.includes(v))) {
                        if (!track.userData.arl) {
                            const arl = this.manager.getDeezerArl();
                            if (arl) track.userData.arl = arl;
                        };
                    };
                };
                return track;
            })
            ;
        if (tracksAdded.length) {
            this.tracks.splice(0, this.tracks.length, ...tracksAdded);
            if (this.shuffled) this.pushToBackup(tracksAdded);
        } else this.tracks.splice(0, this.tracks.length);
        await this.utils.save();
    };

    /**
     * leaves the previous tracks empty and sets the given tracks to the previous tracks
     * @example
     * ```ts
     * player.queue.setPrevious([track1, track2, track3]); // sets tracks
     * player.queue.setPrevious(); // clears tracks
     * ```
     */
    public async setPrevious(trackOrTracks: Track | Track[] = []) {
        let tracksAdded: Track[] = (Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks])
            .filter(v => this.managerUtilsCustom.isTrack(v))
            .map((track) => {
                const snowflake = Tokens.getRandomToken(); // generate a new id for each track
                if (!track.userData) track.userData = { cid: snowflake }
                else track.userData.cid = snowflake;
                // if track source is played from provider, add the arl to the userData
                // check if any arls are defined in the lavalink manager constructor
                if (this.manager.deezer && (this.manager.deezer.arls?.length || this.manager.deezer.premiumArls?.length)) {
                    if (["deezer", "spotify", "apple"].some(v => track.info.sourceName?.includes(v))) {
                        if (!track.userData.arl) {
                            const arl = this.manager.getDeezerArl();
                            if (arl) track.userData.arl = arl;
                        };
                    };
                };
                return track;
            })
            ;
        if (tracksAdded.length) {
            this.previous.splice(0, this.previous.length, ...tracksAdded);
            if (this.shuffled) this.unshiftToBackup(tracksAdded);
        } else this.previous.splice(0, this.previous.length);
        await this.utils.save();
    };

    /**
     * Add a Track to the Queue, and after saved in the "db" it returns the amount of the Tracks
     * @param TrackOrTracks Track or Tracks to add to the queue
     * @param index At what position to add the Track
     * @returns previous tracks, current track, next tracks and tracks added
     */
    public async add(trackOrTracks: TrackOrTracks, index?: number): Promise<QueueResult> {
        let tracksAdded: (Track | UnresolvedTrack)[] = (Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks])
            .filter(v => this.managerUtilsCustom.isTrack(v) || this.managerUtilsCustom.isUnresolvedTrack(v))
            .map((track) => {
                const snowflake = Tokens.getRandomToken(); // generate a new id for each track
                if (!track.userData) track.userData = { cid: snowflake }
                else track.userData.cid = snowflake;
                // if track source is played from provider, add the arl to the userData
                // check if any arls are defined in the lavalink manager constructor
                if (this.manager.deezer && (this.manager.deezer.arls?.length || this.manager.deezer.premiumArls?.length)) {
                    if (["deezer", "spotify", "apple"].some(v => track.info.sourceName?.includes(v))) {
                        if (!track.userData.arl) {
                            const arl = this.manager.getDeezerArl();
                            if (arl) track.userData.arl = arl;
                        };
                    };
                };
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

        if (this.shuffled) this.pushToBackup(tracksAdded);

        // save the queue
        await this.utils.save();

        return {
            previous: this.previous,
            current: this.current,
            tracks: this.tracks,
            tracksAdded: tracksAdded
        }
    };

    /**
     * Splice the tracks in the Queue
     * @param start Where to remove the Track
     * @param deleteCount How many Tracks to remove?
     * @param TrackOrTracks Want to Add more Tracks?
     * @returns previous tracks, current track, next tracks and tracks added if any
     */
    public async splice(start: number, deleteCount: number, trackOrTracks?: TrackOrTracks): Promise<QueueResult> {
        let tracksAdded: (Track | UnresolvedTrack)[] = [];

        if (trackOrTracks) {
            tracksAdded = (Array.isArray(trackOrTracks) ? trackOrTracks : [trackOrTracks])
                .filter(v => this.managerUtilsCustom.isTrack(v) || this.managerUtilsCustom.isUnresolvedTrack(v))
                .map((track) => {
                    const snowflake = Tokens.getRandomToken(); // generate a new id for each track
                    if (!track.userData) track.userData = { cid: snowflake }
                    else track.userData.cid = snowflake;
                    // if track source is played from provider, add the arl to the userData
                    // check if any arls are defined in the lavalink manager constructor
                    if (this.manager.deezer && (this.manager.deezer.arls?.length || this.manager.deezer.premiumArls?.length)) {
                        if (["deezer", "spotify", "apple"].some(v => track.info.sourceName?.includes(v))) {
                            if (!track.userData.arl) {
                                const arl = this.manager.getDeezerArl();
                                if (arl) track.userData.arl = arl;
                            };
                        };
                    };
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

        if (tracksAdded.length && this.shuffled) this.pushToBackup(tracksAdded);

        return {
            previous: this.previous,
            current: this.current,
            tracks: this.tracks,
            tracksAdded: tracksAdded
        }
    };

    /**
     * Shuffles the current Queue, then saves it.
     * This method simply shuffles the next tracks. Consider using toggleShuffle() for a more advanced implementation.
     */
    public async shuffle(): Promise<number> {
        return await super.shuffle();
    };

    /**
     * enables/disables shuffle of the entire queue 
     * @param [shuffle=false] - true to simply shuffle the queue. this will shuffle the queue and won't be reversible. DON'T SET THIS TO TRUE IF you only want to toggle on shuffle mode. useful when you want to re-shuffle the queue when it's already shuffled on.
     * @returns previous tracks, current track and next tracks in the queue
     */
    public async toggleShuffle(shuffle: boolean = false): Promise<QueueResult> {
        if (this.shuffled && !shuffle) {
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
            if (this.current) bc = bc.filter(t => this.current?.userData!.cid !== t.userData!.cid)
            // restore queue
            await this.setPrevious([...bc.slice(0, currentTrackIndex).filter(t => this.managerUtilsCustom.isTrack(t))].reverse());
            await this.setTracks(bc.slice(currentTrackIndex));
        } else {
            if (!shuffle) {
                this.isShuffled = true;
                this.backup = [];
                if (this.previous.length) this.backup.push(...[...this.previous].reverse());
                if (this.current) this.backup.push(this.current);
                if (this.tracks.length) this.backup.push(...this.tracks);
            };
            // shuffle the queue
            const prev = this.shufflePrevious(this.previous),
                tracks = this.shuffleTracks(this.tracks);

            this.previous.splice(0, this.previous.length, ...prev);
            this.tracks.splice(0, this.tracks.length, ...tracks);
        };
        await this.utils.save();
        return {
            previous: this.previous,
            current: this.current,
            tracks: this.tracks,
            tracksAdded: []
        };
    };

    private shuffleTracks(array: (Track | UnresolvedTrack)[]): (Track | UnresolvedTrack)[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    private shufflePrevious(array: Track[]): Track[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    /**
     * Adds tracks to the backup array.
     * @param tracks Tracks to add to the backup.
     */
    private pushToBackup(tracks: (Track | UnresolvedTrack)[]): void {
        const res = tracks.filter(t => this.backup.every(b => b.userData?.cid !== t.userData?.cid)); // ensure no duplicates
        // console.log("to backup tracks: ", tracks.map(t => t.info.title));
        // console.log("to backup: ", res.map(t => t.info.title));
        if (res.length) this.backup.push(...res);
    };
    /**
     * Adds tracks to the backup array.
     * @param tracks Tracks to add to the backup.
     */
    private unshiftToBackup(tracks: (Track | UnresolvedTrack)[]): void {
        const res = tracks.filter(t => this.backup.every(b => b.userData?.cid !== t.userData?.cid)); // ensure no duplicates
        if (res.length) this.backup.unshift(...res);
    };
}