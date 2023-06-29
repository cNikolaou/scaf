import { JsonRpcProvider, FaucetRateLimitError, SuiObjectChange } from "@mysten/sui.js"

function objectData(obj: {objectId: string, version: string} | undefined): string {
    if (obj) {
        return "\t" + obj.objectId + " " + obj.version;
    }
    return ""
}

function coinData(coin: {coinType: string, coinObjectId: string, version: string, balance: string}): string {
    return "\t" + coin.coinType + " " + coin.coinObjectId + " " + coin.version + " " + coin.balance;
}

export async function showOwnership(address: string, provider: JsonRpcProvider) {

    // find out what the address owns
    let separator = '-'.repeat(80)

    console.log(separator);
    console.log(`Address ${address} owns:`);
    console.log(separator);

    separator = '\t' + separator;

    const objects = await provider.getOwnedObjects({
        owner: address

    });
    console.log(separator);
    console.log('\tObjects:');
    console.log(separator);
    const objData = objects.data.map((obj) => {
        return objectData(obj.data)
    });
    console.log(objData.join('\n'))

    const coins = await provider.getAllCoins({
        owner: address
    });

    const cData = coins.data.map((coin) => {
        return coinData(coin)
    });

    console.log(separator);
    console.log('\tCoins');
    console.log(separator);
    console.log(cData.join('\n'));
}

export async function reqFaucetSui(toAddress: string, provider: JsonRpcProvider) {

    try {
        await provider.requestSuiFromFaucet(toAddress);
    } catch (error) {
        if (error instanceof FaucetRateLimitError) {
            console.log('To many faucet requests. Try later. Skipping for now');
        } else {
            console.log('Unexpected error during faucet request:', error)
        }
    }
}

export function showObjectChanges(txnObjectChanges: SuiObjectChange[]) {

    const changes = txnObjectChanges.map((change) => {

        let outputString =  ` - Type: ${change.type}`;

        if (change.type !== 'published') {
            outputString += ` , ID: ${change.objectId}`

            if (change.type === 'created' || change.type === 'mutated') {
                let owner;
                if (typeof change.owner === 'string') {
                    owner = change.owner;
                } else if ('AddressOwner' in change.owner) {
                    owner = `Account Address (${change.owner.AddressOwner})`;
                } else if ('ObjectOwner' in change.owner) {
                    owner = `Account Address (${change.owner.ObjectOwner})`;
                }
                outputString += ` , Owner: ${owner}`
            }
        } else {
            outputString += ` , Package ID: ${change.packageId}`
        }
        return outputString;
    })

    console.log('--- Transaction Effects ---');
    console.log(changes.join('\n'))
}
