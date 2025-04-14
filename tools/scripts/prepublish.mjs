import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { Esm } from "../../packages/utils/dist/esm/index.js";
import "colors";

const __dirname = Esm.getDirname(import.meta.url);

const packagesPath = path.join(__dirname, "../../packages");

const packages = fs.readdirSync(packagesPath);
for (const pkg of packages) {
    const packageJsonPath = path.join(packagesPath, pkg, "package.json");
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        if (packageJson.scripts && packageJson.scripts.prepublish) {
            console.log(`Running prepublish script for ${pkg}...`.magenta);
            execSync("npm run prepublish", { cwd: path.join(packagesPath, pkg), stdio: "inherit" });
        }
    }
}

console.log("all packages ready to publish ♡".brightMagenta);