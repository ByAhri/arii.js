@byahri/utils

utility functions that i use for arii and more

## contents

- [install](#installation)
- [usage](#usage)

## install

```bash
npm install @byahri/utils
```

## usage
### typescript or esm
```typescript
import { Tokens, BufferEncodingType, Format } from "@byahri/utils";

const randomToken = Tokens.getRandomToken(32, BufferEncodingType.base64url);
const snowflake = Tokens.getSnowflake().toString();

const time = 3204900; // Example timestamp in milliseconds

const formatTime = Format.simpleTimeFormat(time, true);

console.log(randomToken); // output: 7hUjwGQZJhumhGE7Y2zhpr7P9BnrTgttP-GWPJgKP44
console.log(snowflake); // output: 1360781405386182656
console.log(formatTime); // output: 53 min 24 sec
```

### commonjs

```javascript
const { Tokens, BufferEncodingType, Format } = require("@byahri/utils");

const randomToken = Tokens.getRandomToken(32, BufferEncodingType.base64url);
const snowflake = Tokens.getSnowflake().toString();

const time = 3204900; // Example timestamp in milliseconds

const formatTime = Format.simpleTimeFormat(time, true);

console.log(randomToken); // output: 7hUjwGQZJhumhGE7Y2zhpr7P9BnrTgttP-GWPJgKP44
console.log(snowflake); // output: 1360781405386182656
console.log(formatTime); // output: 53 min 24 sec
```