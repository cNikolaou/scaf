import { JsonRpcProvider, devnetConnection } from '@mysten/sui.js';
import "dotenv/config.js";

import { getAccount } from "./account";
import { reqFaucetSui, showOwnership } from './utils';
import { mergeCoinParts, sendSuiCoins } from './objects';
import { buildAndPublishPackage, moveCall } from './package';

// connect to Devnet
const provider = new JsonRpcProvider(devnetConnection);

async function main() {
    const currentRpcApiVersion = await provider.getRpcApiVersion();
    console.log('RPC API Version:', currentRpcApiVersion);

    const account = getAccount(process.env.SEED, process.env.SCHEMA);
    console.log('Account Address:', account.address)

    // request Sui coins from the faucet (two times to create two
    // different coins)
    await reqFaucetSui(account.address, provider);
    await reqFaucetSui(account.address, provider);
    await showOwnership(account.address, provider);

    // merge the Sui coins and show the result
    await mergeCoinParts(account, provider);
    await showOwnership(account.address, provider);

    // send coins to address
    const toAddress = process.env.SEND_TO;
    await sendSuiCoins(account, toAddress, provider, 10000);
    await showOwnership(account.address, provider);
    await showOwnership(toAddress, provider);

    // publish package
    const packageId = await buildAndPublishPackage(account, "hello_world", provider);
    console.log('Package ID:', packageId);

    // mint object
    const result = await moveCall(account, packageId, "hello_world::mint", provider);
    console.log(result);
}

main().then().catch((err) => console.error(err))
