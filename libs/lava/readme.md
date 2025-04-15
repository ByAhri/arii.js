arii \"plugin\" / extras for lavalink-client package. fully compatible with commonjs and esm enviroments.

## contents

- [install](#installation)
- [usage](#usage)

## install

```bash
npm install @ariijs/lavalink-client
```

## usage
### typescript or esm
```typescript
// import LavalinkManager from this package instead of lavalink-client
import { LavalinkManager } from "@ariijs/lavalink-client";
import { Client } from "discord.js";

const client = new Client({
    intents: intents,
    ...
});

client.lava = new LavalinkManager(...);

// always import @ariijs/lavalink-client classes instead of lavalink-client classes if they exist
// example
import { Player } from "@ariijs/lavalink-client";
import { Track } from "lavalink-client"; // doesn't exists in @ariijs/lavalink-client

export default {
    name: "trackStart",
    once: false,
    async execute(player: Player, track: Track) {
        player.queue.add(tracks); // add tracks
        player.previous(); // go back to previous track

        // cid (custom id) is a property that @ariijs package sets to all track's userData object.
        // useful to identify precisely each track regardless of them having repeated identifiers
        // or encoded values when multiple tracks in the queue are the same, from the same source
        console.log(track.userData?.cid); // output: random token / id
    };
}
```

### commonjs

```javascript
// require LavalinkManager from this package instead of lavalink-client
const { LavalinkManager, Player } = require("@ariijs/lavalink-client");
const { Client } = require("discord.js");

const client = new Client({
    intents: intents,
    ...
});

client.lava = new LavalinkManager(...);

// example usage
module.exports = {
    name: "trackStart",
    once: false,
    async execute(player, track) {
        player.queue.add(tracks); // add tracks
        player.previous(); // go back to previous track

        // cid (custom id) is a property that @ariijs package sets to all track's userData object.
        console.log(track.userData?.cid); // output: random token / id
    }
};
```