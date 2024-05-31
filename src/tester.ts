#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import Mocha from 'mocha';

const MOCHA_TEST_DIR_NAME = 'test';

async function runMochaTests() {
    let mocha = new Mocha({
        reporter: 'spec',
        ui: 'bdd',
    });

    fs.readdirSync(MOCHA_TEST_DIR_NAME).forEach((file) => {
        if (file.endsWith('.js')) {
            const fp = path.join('./test', file);
            console.log(fp, fs.existsSync(fp));
            mocha.addFile(fp);
        }
    });

    console.debug('Running tests with Mocha...');

    return new Promise((resolve, reject) => {
        mocha.run((failures) => {
            if (failures > 0) {
                reject(new Error(`${failures} tests failed`));
            } else {
                resolve(0);
            }
        });
    });
}

export default async function runTests() {
    try {
        await runMochaTests();
    } catch (error) {
        console.error('Test execution failed with:', error);
        process.exitCode = 1;
    }
}
