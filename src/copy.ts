#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';

async function copyDirectory(fromDir: string, toDir: string) {
    // Copy the files that do not exist in `toDir` and they are in `fromDir`

    // Create target directory if it doesn't exist
    if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir);
    }

    // Get list of files and directories
    const filesAndDirs = await fse.readdir(fromDir);

    try {
        for (const fd of filesAndDirs) {
            const src = path.join(fromDir, fd);
            const dst = path.join(toDir, fd);

            // Check if the file or dir exists and copy the files if it doesn't
            if (!(await fse.pathExists(dst))) {
                await fse.copy(src, dst, { overwrite: false, errorOnExist: true });
            }
        }
        console.log(`Example project created under directory "${path.resolve(toDir)}/"`);
    } catch (error) {
        console.log(`Copy to directory "${path.resolve(toDir)}" failed`);
        console.log(error);
    }
}

export default async function copy(toDir: string) {
    const sampleProjectDir = path.join(__dirname, '../sample-project');
    await copyDirectory(sampleProjectDir, toDir);
}
