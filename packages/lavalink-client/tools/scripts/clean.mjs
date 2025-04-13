import { rm } from 'fs/promises';
import { resolve } from 'path';
import "colors";

const distPath = resolve('dist');

try {
    await rm(distPath, { recursive: true, force: true });
    console.log('cleaned dist'.bgBlack);
} catch (err) {
    console.error('failed to clean: '.yellow, err);
};