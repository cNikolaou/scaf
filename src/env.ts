import {
    JsonRpcProvider,
    localnetConnection,
    devnetConnection,
    mainnetConnection,
} from '@mysten/sui.js';

import config from '../config';

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
        case 'mainnet':
            provider = new JsonRpcProvider(mainnetConnection);
            break;
    }

    return provider;
}