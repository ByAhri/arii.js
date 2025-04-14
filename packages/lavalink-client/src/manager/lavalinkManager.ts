import { PlayerOptions, LavalinkManager as LM, ManagerOptions, MiniMap } from "lavalink-client";
import { Player } from "../player/player.js";

export class LavalinkManager extends LM {

    public readonly players: MiniMap<string, Player> = new MiniMap();

    constructor(options: ManagerOptions) {
        super(options);
    }

    /**
     * Get a Player from Lava
     * @param guildId The guildId of the player
     *
     * @example
     * ```ts
     * const player = client.lavalink.getPlayer(interaction.guildId);
     * ```
     * A quicker and easier way than doing:
     * ```ts
     * const player = client.lavalink.players.get(interaction.guildId);
     * ```
     * @returns
     */
    public getPlayer(guildId: string): Player | undefined {
        return this.players.get(guildId);
    }

    /**
     * Create a Music-Player. If a player exists, then it returns it before creating a new one
     * @param options
     * @returns
     *
     * @example
     * ```ts
     * const player = client.lavalink.createPlayer({
     *   guildId: interaction.guildId,
     *   voiceChannelId: interaction.member.voice.channelId,
     *   // everything below is optional
     *   textChannelId: interaction.channelId,
     *   volume: 100,
     *   selfDeaf: true,
     *   selfMute: false,
     *   instaUpdateFiltersFix: true,
     *   applyVolumeAsFilter: false
     *   //only needed if you want to autopick node by region (configured by you)
     *   // vcRegion: interaction.member.voice.rtcRegion,
     *   // provide a specific node
     *   // node: client.lavalink.nodeManager.leastUsedNodes("memory")[0]
     * });
     * ```
     */
    public createPlayer = (options: PlayerOptions): Player => {
        const oldPlayer = this.players.get(options?.guildId);
        if (oldPlayer) return oldPlayer;

        const newPlayer = new Player(options, this);
        this.players.set(newPlayer.guildId, newPlayer);
        return newPlayer;
    }
}