import { existsSync, writeFileSync } from "fs";
import { Esm } from "@ariijs/utils";
import { join } from "path";

const __dirname = Esm.getDirname(import.meta.url);

const writePackageJson = (path) => {
    if (!existsSync(path)) return console.error("no path found for: ", path);
    writeFileSync(join(path, "/package.json"), JSON.stringify({ type: path.endsWith("esm") ? "module" : "commonjs" }, null, 2));
};

writePackageJson(join(__dirname, '../../dist/cjs'));
writePackageJson(join(__dirname, '../../dist/esm'));