import { Track, UnresolvedTrack } from "lavalink-client";

/** track object or array of track objects from lavalink-client */
export type TrackOrTracks = Track | UnresolvedTrack | (Track | UnresolvedTrack)[];

export interface QueueResult {
    /** size of the queue after modification */
    queueSize: number;
    /** the total tracks after modification */
    tracks: (Track | UnresolvedTrack)[];
    /** the tracks that were added */
    tracksAdded: (Track | UnresolvedTrack)[];
}