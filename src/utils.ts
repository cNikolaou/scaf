// Helper functions for displaying data on the terminal
import path from 'path';

import { requestSuiFromFaucetV0, FaucetRateLimitError } from '@mysten/sui.js/faucet';
import { SuiObjectChange } from '@mysten/sui.js/client';

import { getClient, getFaucet } from './env';

const client = getClient();

const OUTPUT_INDENTATION = 2;

function objectData(obj: { objectId: string; version: string } | undefined): string {
    if (obj) {
        return ' '.repeat(OUTPUT_INDENTATION) + obj.objectId + ' ' + obj.version;
    }
    return '';
}

function coinData(coin: {
    coinType: string;
    coinObjectId: string;
    version: string;
    balance: string;
}): string {
    return (
        ' '.repeat(OUTPUT_INDENTATION) +
        coin.coinType +
        ' ' +
        coin.coinObjectId +
        ' ' +
        coin.version +
        ' ' +
        coin.balance
    );
}

export async function showOwnership(address: string) {
    // find out what the address owns
    let separator = '-'.repeat(80);

    console.log(separator);
    console.log(`Address ${address} owns:`);
    console.log(separator);

    separator = ' '.repeat(OUTPUT_INDENTATION) + separator;

    const objects = await client.getOwnedObjects({
        owner: address,
    });
    console.log(separator);
    console.log(' '.repeat(OUTPUT_INDENTATION) + 'Objects:');
    console.log(separator);
    const objData = objects.data.map((obj) => {
        return objectData(obj.data);
    });
    console.log(objData.join('\n'));

    const coins = await client.getAllCoins({
        owner: address,
    });

    const cData = coins.data.map((coin) => {
        return coinData(coin);
    });

    console.log(separator);
    console.log(' '.repeat(OUTPUT_INDENTATION) + 'Coins');
    console.log(separator);
    console.log(cData.join('\n'));
}

export async function reqFaucetSui(toAddress: string) {
    try {
        await requestSuiFromFaucetV0({
            host: getFaucet(),
            recipient: toAddress,
        });
    } catch (error) {
        if (error instanceof FaucetRateLimitError) {
            console.log('To many faucet requests. Try later. Skipping for now');
        } else {
            console.log('Unexpected error during faucet request:', error);
        }
    }
}

export function showObjectChanges(txnObjectChanges: SuiObjectChange[]) {
    const changes = txnObjectChanges.map((change) => {
        let outputString = ` - Type: ${change.type}`;

        if (change.type !== 'published') {
            outputString += ` , ID: ${change.objectId}`;

            if (change.type === 'created' || change.type === 'mutated') {
                let owner;
                if (typeof change.owner === 'string') {
                    owner = change.owner;
                } else if ('AddressOwner' in change.owner) {
                    owner = `Account Address (${change.owner.AddressOwner})`;
                } else if ('ObjectOwner' in change.owner) {
                    owner = `Account Address (${change.owner.ObjectOwner})`;
                }
                outputString += ` , ObjType: ${change.objectType} , Owner: ${owner}`;
            }
        } else {
            outputString += ` , Package ID: ${change.packageId} , ObjType: Package`;
        }
        return outputString;
    });

    console.log('--- Transaction Effects ---');
    console.log(changes.join('\n'));
}

export function getPackagesPathRelativeToDir(dir: string) {
    // get the absolule path to `packages/` relative to the provided path
    const packagesPath = path.resolve(dir, '../packages');
    return packagesPath;
}
