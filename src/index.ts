import { JsonRpcProvider, devnetConnection } from '@mysten/sui.js';

// connect to Devnet
const provider = new JsonRpcProvider(devnetConnection);

async function main() {
    const currentEpoch = await provider.getRpcApiVersion();
    console.log(currentEpoch);
}

main().then().catch((err) => console.error(err))
