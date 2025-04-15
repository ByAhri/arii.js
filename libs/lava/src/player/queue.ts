import { ManagerQueueOptions, ManagerUtils, Queue as Qe, QueueChangesWatcher, QueueSaver, StoredQueue, Track, UnresolvedTrack } from "lavalink-client";
import { TrackOrTracks, QueueResult } from "../types/index.js";
import { Tokens } from "@ariijs/utils";
import { LavalinkManager } from "../manager/lavalinkManager.js";

export class Queue extends Qe {
    // public tracks: (Track | UnresolvedTrack)[] = [];
    // public previous: Track[] = [];

    protected managerUtilsCustom = new ManagerUtils();
    protected queueChangesCustom: QueueChangesWatcher | null;
    protected readonly guildIdCustom: string = "";

    protected readonly manager: LavalinkManager; // Reference to the LavalinkManager
    

    constructor(guildId: string, manager: LavalinkManager, data: Partial<StoredQueue> = {}, QueueSaver?: QueueSaver, queueOptions?: ManagerQueueOptions) {
        super(guildId, data, QueueSaver, queueOptions);

        this.manager = manager; // Assign the manager
        this.queueChangesCustom = queueOptions?.queueChangesWatcher || null;
        this.guildIdCustom = guildId;

        // this.previous = Array.isArray(data.previous) && data.previous.some(track => this.managerUtilsCustom.isTrack(track) || this.managerUtilsCustom.isUnresolvedTrack(track)) ? data.previous.filter(track => this.managerUtilsCustom.isTrack(track) || this.managerUtilsCustom.isUnresolvedTrack(track)) : [];
        // this.tracks = Array.isArray(data.tracks) && data.tracks.some(track => this.managerUtilsCustom.isTrack(track) || this.managerUtilsCustom.isUnresolvedTrack(track)) ? data.tracks.filter(track => this.managerUtilsCustom.isTrack(track) || this.managerUtilsCustom.isUnresolvedTrack(track)) : [];
    };

    /** leaves the queue empty and sets the given tracks to the queue */
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
        if (tracksAdded.length) this.tracks.splice(0, this.tracks.length, ...tracksAdded)
        else this.tracks.splice(0, this.tracks.length);
    }

    /** leaves the previous tracks empty and sets the given tracks to the previous tracks */
    public set setPrevious(trackOrTracks: TrackOrTracks) {
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
        if (tracksAdded.length) this.previous.splice(0, this.previous.length, ...tracksAdded)
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
            const splice = await this.splice(index, 0, trackOrTracks);
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
        }

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
            if (trackOrTracks) return await this.add(trackOrTracks, start);

        }
        // Log if available
        if ((trackOrTracks) && typeof this.queueChangesCustom?.tracksAdd === "function") {
            try {
                this.queueChangesCustom.tracksAdd(this.guildIdCustom, tracksAdded, start, oldStored!, this.utils.toJSON());
            } catch { };
        }
        // remove the tracks (and add the new ones)
        let spliced = trackOrTracks ? this.tracks.splice(start, deleteCount, ...tracksAdded) : this.tracks.splice(start, deleteCount);
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

        return {
            queueSize: this.tracks.length,
            tracks: this.tracks,
            tracksAdded: tracksAdded
        }
    }
}