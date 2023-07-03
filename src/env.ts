import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';

import {
    JsonRpcProvider,
    localnetConnection,
    devnetConnection,
    testnetConnection,
    mainnetConnection,
} from '@mysten/sui.js';

const CONFIG_NAME = 'config.js';
const userConfigPath = path.resolve(process.cwd(), CONFIG_NAME);

let config;

if (fs.existsSync(userConfigPath)) {
    config = require(userConfigPath);
} else {
    const exampleConfig = path.join(__dirname, '../examples/', CONFIG_NAME);
    config = require(exampleConfig);
}

export function getProvider() {
    // fetch appropriate provider based on configuration

    let provider: JsonRpcProvider;

    switch (config.network) {
        case 'localnet':
            provider = new JsonRpcProvider(localnetConnection);
            break;
        case 'devnet':
            provider = new JsonRpcProvider(devnetConnection);
            break;
        case 'testnet':
            provider = new JsonRpcProvider(testnetConnection);
            break;
        case 'mainnet':
            provider = new JsonRpcProvider(mainnetConnection);
            break;
    }

    return provider;
}
