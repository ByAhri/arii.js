import { fileURLToPath, pathToFileURL } from "url";
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

    /**
     * import a module using dynamic import avoiding errors on windows platform using windows path protocols
     * @param modulePath - the path to the module to import
     * @example
     * ```ts
     * import { Esm } from "@ariijs/utils";
     * const modulePath = "C:\\...\\path\\to\\your\\module.js"; // this type of path can be returned using, e.g.
     * path.join(__dirname, "../path/to/your", jsFile); // on windows platform
     * 
     * const module = await import(modulePath); // this will throw an error on windows platform
     * const module = await Esm.import(modulePath); // this will work on windows platform as well as linux etc.
     * ```
     * @returns 
     */
    static async import(modulePath: string): Promise<any> {
        if (process.platform === "win32") {
            // check if path is a windows protocol path instead od valid url path (e.g. file:///C:/path/to/file.js)
            if (modulePath.startsWith("C:") || modulePath.startsWith("D:")) {
                modulePath = pathToFileURL(modulePath).href;
            };
        }
        let imp;
        try {
            imp = await import(modulePath);
        } catch (error) {
            throw error;
        }
        return imp;
    }
}