import { JsonRpcProvider, devnetConnection } from '@mysten/sui.js';
import "dotenv/config.js";

import { getAccount } from "./account";

// connect to Devnet
const provider = new JsonRpcProvider(devnetConnection);

async function main() {
    const currentRpcApiVersion = await provider.getRpcApiVersion();
    console.log('RPC API Version:', currentRpcApiVersion);

    const account = getAccount(process.env.SEED, process.env.SCHEMA);
    console.log('Account Address:', account.address)
}

main().then().catch((err) => console.error(err))
