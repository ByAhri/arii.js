import { fileURLToPath } from "url";
import { dirname, basename, extname } from "path";

export class Esm {
    /**
     * 
     * @param importMetaUrl - the url of the module (import.meta.url)
     * @returns returns the __dirname value for ESM environments
     * @example
     * ```ts
     * import { AriiEsm } from "@byahri/utils";
     * const __dirname = AriiEsm.getDirname(import.meta.url);
     * console.log(__dirname); // /path/to/your/module
     * ```
     */
    static getDirname(importMetaUrl: string) {
        return dirname(this.getFilename(importMetaUrl));
    };

    /**
     * 
     * @param importMetaUrl - the url of the module (import.meta.url)
     * @returns returns the __filename value for ESM environments
     * @example
     * ```ts
     * import { AriiEsm } from "@byahri/utils";
     * const __filename = AriiEsm.getFilename(import.meta.url);
     * console.log(__filename); // /path/to/your/module/index.js
     * ```
     */
    static getFilename(importMetaUrl: string) {
        // Define __filename for ESM modules
        return fileURLToPath(importMetaUrl);
    };

    /**
     * 
     * @returns returns an object containing path info: dirname, filename, basename, and extension
     */
    static getPathInfo(importMetaUrl: string) {
        const filename = this.getFilename(importMetaUrl);
        return {
            dirname: dirname(filename),
            filename,
            basename: basename(filename),
            extension: extname(filename),
        };
    };
}