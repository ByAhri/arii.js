import { PlayerOptions, LavalinkManager as LM, MiniMap } from "lavalink-client";
import { DeezerManagerOptions, ManagerOptions } from "../types/index.js";
import { Player } from "../player/player.js";

let currentArl: string | null = null; // index of the arl to use for deezer

export class LavalinkManager extends LM {

    public readonly players: MiniMap<string, Player> = new MiniMap();
    /** deezer category */
    public deezer: DeezerManagerOptions;

    constructor(options: ManagerOptions) {
        super(options);
        this.deezer = {
            arls: options.deezer?.arls ?? [],
            premiumArls: options.deezer?.premiumArls ?? []
        };
    };

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
    };

    /**
     * Add an ARL to the Deezer list
     * @param valueOrValues The ARL(s) to add
     * @param type The type of the ARL to add (optional)
     */
    public addDeezerArl(valueOrValues: string | string[], type?: "free" | "premium"): string[] {
        function add(manager: LavalinkManager, arr: "premiumArls" | "arls") {
            if (Array.isArray(valueOrValues)) {
                manager.deezer[arr]!.push(...valueOrValues.filter(value => !manager.deezer[arr]!.includes(value)));
            } else if (typeof valueOrValues === "string") {
                if (!manager.deezer[arr]!.includes(valueOrValues)) manager.deezer[arr]!.push(valueOrValues);
            }
        };

        if (!this.deezer) throw new Error("Deezer is not enabled in the manager, please define it in the constructor options");

        if (type === "premium") {
            if (!this.deezer.premiumArls) throw new Error("Deezer premium ARLs are not enabled in the manager, please define them in the constructor options");
            add(this, "premiumArls");
            return this.deezer.premiumArls;
        };

        if (!this.deezer.arls) throw new Error("Deezer ARLs are not enabled in the manager, please define them in the constructor options");
        add(this, "arls");
        return this.deezer.arls;
    };

    /**
     * Remove an ARL from the Deezer list
     * @param valueOrValues The ARL(s) to remove
     * @param type The type of the ARL to remove (optional)
     */
    public removeDeezerArl(valueOrValues: string | string[], type?: "free" | "premium"): string[] {
        function remove(manager: LavalinkManager, arr: "premiumArls" | "arls") {
            if (Array.isArray(valueOrValues)) {
                manager.deezer[arr] = manager.deezer[arr]!.filter(existingArl => !valueOrValues.includes(existingArl));
            } else if (typeof valueOrValues === "string") {
                manager.deezer[arr] = manager.deezer[arr]!.filter(existingArl => existingArl !== valueOrValues);
            }
        };

        if (!this.deezer) throw new Error("Deezer is not enabled in the manager, please define it in the constructor options");
        if (type === "premium" && !this.deezer.premiumArls) throw new Error("Deezer premium ARLs are not enabled in the manager, please define them in the constructor options");
        if (type === "free" && !this.deezer.arls) throw new Error("Deezer ARLs are not enabled in the manager, please define them in the constructor options");
        if (!type && !this.deezer.premiumArls && !this.deezer.arls) throw new Error("Deezer ARLs are not enabled in the manager, please define them in the constructor options");

        if (type === "premium") {
            if (!this.deezer.premiumArls) throw new Error("Deezer premium ARLs are not enabled in the manager, please define them in the constructor options");
            remove(this, "premiumArls");
            return this.deezer.premiumArls;
        } else if (type === "free") {
            if (!this.deezer.arls) throw new Error("Deezer ARLs are not enabled in the manager, please define them in the constructor options");
            remove(this, "arls");
            return this.deezer.arls;
        };
        if (!type) {
            if (!this.deezer.premiumArls) throw new Error("Deezer premium ARLs are not enabled in the manager, please define them in the constructor options");
            if (!this.deezer.arls) throw new Error("Deezer ARLs are not enabled in the manager, please define them in the constructor options");
            remove(this, "premiumArls");
            remove(this, "arls");
            return [...this.deezer.premiumArls, ...this.deezer.arls];
        };
        return [];
    };

    /**
     * Get the next ARL from the Deezer list. It will loop through the list if there are multiple ARLs
     * @param type The type of the ARL to get (optional)
     * @returns The next ARL or null if there are no ARLs
     */
    public getDeezerArl(type?: "free" | "premium"): string | null {
        if (!this.deezer) throw new Error("Deezer is not enabled in the manager, please define it in the constructor options");

        if (!this.deezer.arls && !this.deezer.premiumArls) throw new Error("Deezer ARLs are not enabled in the manager, please define them in the constructor options");

        let arls: string[] = [],
            arl: string | null = null;
        if (this.deezer.arls) arls.push(...this.deezer.arls);
        if (this.deezer.premiumArls) arls.push(...this.deezer.premiumArls);

        if (type === "premium") {
            if (!this.deezer.premiumArls) throw new Error("Deezer premium ARLs are not enabled in the manager, please define them in the constructor options");
            arls = this.deezer.premiumArls;
        } else if (type === "free") {
            if (!this.deezer.arls) throw new Error("Deezer ARLs are not enabled in the manager, please define them in the constructor options");
            arls = this.deezer.arls;
        }

        if (arls.length === 0) return null; // No ARLs available

        if (currentArl) {
            const ix = arls.indexOf(currentArl);
            if (ix !== -1) {
                currentArl = arls[(ix + 1) % arls.length]; // Increment the index and wrap around if necessary
                arl = currentArl;
            } else {
                currentArl = arls[0]; // Reset to the first ARL if currentArl is invalid
                arl = currentArl;
            }
        } else {
            currentArl = arls[0]; // Set the current ARL to the first one
            arl = currentArl;
        }
        return arl;
    }
}