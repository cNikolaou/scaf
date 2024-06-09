#!/usr/bin/env node

///
// A simple CLI to interract with scaf
//

import process from 'process';

import copy from './copy';
import run from './run';
import runTests from './tester';

const args = process.argv.slice(2);

const CLI_MESSAGE = `
Scaf is a tool for developing smart contracts for the Sui network.

AVAILABLE OPTIONS:
  run <script>      runs the specified .js script (which can automate interractions with the Sui network)
  init [directory]  initialises a new sample project in the current directory
  test              runs the tests in the ./test directory
`;

async function cli() {
    if (args.length === 0) {
        console.log(CLI_MESSAGE);
    } else {
        switch (args[0]) {
            case 'run':
                if (args.length > 1) {
                    await run(args[1]);
                    process.exit(0);
                } else {
                    console.error('Nothing to run');
                    process.exit(1);
                }
            case 'init':
                const toDir = args[1] || './';
                await copy(toDir);
                process.exit(0);
            case 'test':
                const whichTests = args[1] || 'all';
                await runTests(whichTests);
                process.exit(0);
            default:
                console.error('No such option');
                console.log(CLI_MESSAGE);
        }
    }
}

cli().catch((error) => console.error(error));
