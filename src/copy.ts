import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';

async function copyDirectory(examplesDir: string, toDir: string) {
    // create target directory if it doesn't exist
    if (!fs.existsSync(toDir)) {
        fs.mkdirSync(toDir);
    }
    try {
        await fse.copy(examplesDir, toDir, { overwrite: false, errorOnExist: true });
        console.log(`Example project created under directory "${path.resolve(toDir)}/"`);
    } catch (error) {
        console.log(`Copy failed as the directory "${path.resolve(toDir)}" is not empty`);
    }
}

const toDir = process.argv[2] || './';
copyDirectory('./examples', toDir).catch((err) => {
    console.log(err);
});
