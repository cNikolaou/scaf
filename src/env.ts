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

function isURL(endpoint: string) {
    try {
        const url = new URL(endpoint);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function getClient() {
    // fetch appropriate Sui client based on configuration

    let rpcURL;

    if (isURL(config.network)) {
        rpcURL = config.network;
    } else {
        rpcURL = getFullnodeUrl(config.network);
    }

    return new SuiClient({ url: rpcURL });
}

export function getFaucet() {
    if (config.network !== 'mainnet') {
        return getFaucetHost(config.network);
    } else {
        throw Error('No faucet available when running on Mainnet');
    }
}
