import { PlayerOptions, LavalinkManager as LM, ManagerOptions } from "lavalink-client";
import { AriiPlayer } from "../player/player.js";

export class AriiLavalinkManager extends LM {
    constructor(options: ManagerOptions) {
        super(options);
    }
    public createPlayer = (options: PlayerOptions): AriiPlayer => {
        const oldPlayer = this.getPlayer(options?.guildId);
        if (oldPlayer) return oldPlayer;

        const newPlayer = new AriiPlayer(options, this);
        this.players.set(newPlayer.guildId, newPlayer);
        return newPlayer;
    }
}