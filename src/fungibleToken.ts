///
// Sample file for publishing the `packages/fungible_token` package and
// interracting with the contract.
//
// To run, create a `.env` file in the main repository direcotry with the
// following variable:
//
// - SEED: the seed-phrase for the token manager account
// - SCHEMA: the key
// - SEND_TO: the address of another account, where the manager will mint some tokens to
//

import { JsonRpcProvider, devnetConnection, localnetConnection } from '@mysten/sui.js';
import 'dotenv/config.js';

import { getAccount } from './account';
import { showOwnership } from './utils';
import { buildAndPublishPackage, moveCall } from './package';
import { Network, sleepForMs } from './network';
import { sendCoins } from './objects';

// connect to local network; alternative connect to devnet or another network
const provider = new JsonRpcProvider(localnetConnection);
// const provider = new JsonRpcProvider(devnetConnection);

export async function main() {
    // Setup a local network for this project only
    const net = Network.getNetwork();

    // comment out net.resetNetwork() to preserve the state of the network across runs
    net.resetNetwork();
    net.startNetwork();

    await net.waitUntilNetworkRuns();

    const managerAccount = getAccount(process.env.SEED, process.env.SCHEMA);
    console.log('Account Address:', managerAccount.address);

    /// Step 1: Publish the package

    // The caller gets the `TreasuryCap<TOKENAME>` capability object and
    // a `CoinMetadata<TOKENAME>` immutable shared object is created.
    const publishedPackage = await buildAndPublishPackage(
        managerAccount,
        'fungible_token',
        provider,
    );
    console.log('> Package ID:', publishedPackage.packageId);

    // Find the object that refers to the `TreasuryCap` capability; the
    // object's ID will be passed as the first argument
    const treasuryCapType = '0x2::coin::TreasuryCap';
    const treasuryCap = publishedPackage.created.find((obj) =>
        obj.objectType.includes(treasuryCapType),
    );

    console.log('> TreasuryCap ID:', treasuryCap.objectId);

    /// Step 2: The token manager mints tokens

    // Manager mints for the manager
    const mintManagerTxb = await moveCall(
        managerAccount,
        publishedPackage.packageId,
        'tokename',
        'mint',
        provider,
        [treasuryCap.objectId, '15000', managerAccount.address],
    );
    console.log(mintManagerTxb);

    // Manager mints for another address
    const mintOtherTxb = await moveCall(
        managerAccount,
        publishedPackage.packageId,
        'tokename',
        'mint',
        provider,
        [treasuryCap.objectId, '5000', process.env.SEND_TO],
    );
    console.log(mintOtherTxb);

    /// Step 3: The token manager burns tokens: create two token objects after
    // splitting the current token object into two parts and send one of the
    // objects (the new object) to the burn function

    // sleep for 3 seconds so that transactions for burning are easier to
    // spot in Sui explorer: https://suiexplorer.com/?network=local
    await sleepForMs(3000);
    await showOwnership(managerAccount.address, provider);

    // get the token object that the manager has
    const managerTokenObject = mintManagerTxb.created.find((obj) =>
        obj.objectType.includes('Coin'),
    );

    // Split owned tokens so that part of it is burned
    console.log('Token Object ID:');
    const splitTokenTxb = await sendCoins(
        managerAccount,
        managerAccount.address,
        provider,
        1000,
        managerTokenObject.objectId,
    );

    await showOwnership(managerAccount.address, provider);

    // the coin to burn is part of the "created" objects and contains the
    // "Coin" as part of the type
    const toBurn = splitTokenTxb.created.find((obj) => obj.objectType.includes('Coin'));

    // Manager burns own tokens by sending
    const burnManager = await moveCall(
        managerAccount,
        publishedPackage.packageId,
        'tokename',
        'burn',
        provider,
        [treasuryCap.objectId, toBurn.objectId],
    );
    console.log(burnManager);

    await showOwnership(managerAccount.address, provider);
    await showOwnership(process.env.SEND_TO, provider);

    console.log(
        `> Explore transaction at: https://suiexplorer.com/address/${managerAccount.address}?network=local`,
    );
    console.log('> Press Ctr+C to exit and stop the local Sui network');

    // Commented out so the Node process doesn't exit; allows inspecting the
    // network through the Sui explorer
    // net.stopNetwork();
}