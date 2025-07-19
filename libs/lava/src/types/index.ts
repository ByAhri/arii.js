import { Track, UnresolvedTrack, ManagerOptions as MO } from "lavalink-client";

/** track object or array of track objects from lavalink-client */
export type TrackOrTracks = Track | UnresolvedTrack | (Track | UnresolvedTrack)[];

export interface QueueResult {
    /** tracks in the previous list */
    previous: Track[];
    /** current track if any */
    current: Track | null | undefined;
    /** tracks in the next list */
    tracks: (Track | UnresolvedTrack)[];
    /** the tracks that were added */
    tracksAdded: (Track | UnresolvedTrack)[];
}

export interface ManagerOptions extends MO {
    deezer?: DeezerManagerOptions
}

export interface DeezerManagerOptions {
    arls?: string[];
    premiumArls?: string[];
}

export interface SimilarSearchOptions {
    /** the similarity threshold for fuzzy matching (default: 20) */
    threshold?: number;
    /** whether to include the author in the search (default: false) */
    withAuthor?: boolean;
}