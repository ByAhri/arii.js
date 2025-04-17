import { fileURLToPath } from "url";
import { dirname, basename, extname } from "path";

export class Esm {
    /**
     * 
     * @param importMetaUrl - the url of the module (import.meta.url)
     * @returns returns the __dirname value for ESM environments
     * @example
     * ```ts
     * import { Esm } from "@ariijs/utils";
     * const __dirname = Esm.getDirname(import.meta.url);
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
     * import { Esm } from "@ariijs/utils";
     * const __filename = Esm.getFilename(import.meta.url);
     * console.log(__filename); // /path/to/your/module/index.js
     * ```
     */
    static getFilename(importMetaUrl: string) {
        // Ensure the URL is valid for Windows environments
        if (!importMetaUrl.startsWith("file://")) {
            importMetaUrl = `file://${importMetaUrl}`;
        }
        return fileURLToPath(importMetaUrl);
    };

    /**
     * 
     * @returns returns an object containing path info: dirname, filename, basename, and extension
     * @example
     * ```ts
     * import { Esm } from "@ariijs/utils";
     * const pathInfo = Esm.getPathInfo(import.meta.url);
     * console.log(pathInfo);
     * // {
     * //   dirname: '/path/to/your/module',
     * //   filename: '/path/to/your/module/index.js',
     * //   basename: 'index.js',
     * //   extension: '.js'
     * // }
     * ```
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