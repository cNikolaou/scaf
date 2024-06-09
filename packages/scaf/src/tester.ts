#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

import Mocha from 'mocha';

const MOCHA_TEST_DIR_NAME = 'test';
const PACKAGES_DIR_NAME = 'packages';

async function runMochaTests() {
    let mocha = new Mocha({
        reporter: 'spec',
        ui: 'bdd',
    });

    if (fs.existsSync(MOCHA_TEST_DIR_NAME)) {
        fs.readdirSync(MOCHA_TEST_DIR_NAME).forEach((file) => {
            if (file.endsWith('.js')) {
                const fp = path.join('./test', file);
                mocha.addFile(fp);
            }
        });
    }

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

function isDirectory(path: string) {
    try {
        const stat = fs.statSync(path);
        return stat.isDirectory();
    } catch (error) {
        return false;
    }
}

async function runMoveTests() {
    if (!fs.existsSync(PACKAGES_DIR_NAME)) {
        return;
    }

    const packages = fs.readdirSync(PACKAGES_DIR_NAME).filter((name) => {
        const dirPath = path.join(PACKAGES_DIR_NAME, name);
        const manifestFp = path.join(dirPath, 'Move.toml');
        return isDirectory(dirPath) && fs.existsSync(manifestFp);
    });

    for (const pkg of packages) {
        const pkgPath = path.join(PACKAGES_DIR_NAME, pkg);
        try {
            const child = spawn('sui', ['move', 'test', '--path', pkgPath]);
            console.log('================================');
            console.log(`Tests for package "${pkg}":`);

            child.stdout.on('data', (data) => {
                console.log(data.toString());
            });

            child.stderr.on('data', (data) => {
                console.error(`Error running tests for package "${pkg}":`);
                console.error(data.toString());
            });

            child.on('error', (error) => {
                console.error(`error: ${error.message}`);
            });

            await new Promise((resolve) => {
                child.on('close', resolve);
            });
            console.log('================================');
        } catch (error) {
            console.error(`Error running tests for package "${pkg}":`);
            console.error(error);
        }
    }
}

export default async function test(whichTests: string) {
    try {
        if (whichTests === 'mocha') {
            await runMochaTests();
        } else if (whichTests === 'move') {
            await runMoveTests();
        } else {
            await runMoveTests();
            await runMochaTests();
        }
    } catch (error) {
        console.error('Test execution failed with:', error);
        process.exitCode = 1;
    }
}
