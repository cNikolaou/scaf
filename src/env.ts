import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';

import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { getFaucetHost } from '@mysten/sui.js/faucet';

const CONFIG_FILE_NAME = 'scaf.config.js';
const userConfigPath = path.resolve(process.cwd(), CONFIG_FILE_NAME);

let config;

if (fs.existsSync(userConfigPath)) {
    config = require(userConfigPath);
} else {
    const sampleProjectConfig = path.join(__dirname, '../sample-project/', CONFIG_FILE_NAME);
    config = require(sampleProjectConfig);
}

export function getClient() {
    // fetch appropriate Sui client based on configuration

    const rpcURL = getFullnodeUrl(config.network);
    const client = new SuiClient({ url: rpcURL });

    return client;
}

export function getFaucet() {
    if (config.network !== 'mainnet') {
        return getFaucetHost(config.network);
    } else {
        throw Error('No faucet available when running on Mainnet');
    }
}
