import { TransactionBlock } from '@mysten/sui.js/transactions';

import { Account } from './account';
import { ObjectChanges } from './package';
import { getClient } from './env';

const client = getClient();

type Amount = string | BigInt | number;

export async function sendSuiCoins(fromAccount: Account, toAddress: string, amount: Amount) {
    // Send `amount` SUI coins from `fromAccount` to `toAddress` Sui address

    // Create transaction block
    const tx = new TransactionBlock();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
    tx.transferObjects([coin], tx.pure(toAddress));

    // Sign and send Tx Block
    const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: fromAccount.keypair,
    });

    // Return the object changes of the transaction
    const txn = await client.getTransactionBlock({
        digest: result.digest,
        options: {
            showEffects: false,
            showInput: false,
            showEvents: false,
            showObjectChanges: true,
            showBalanceChanges: false,
        },
    });

    return new ObjectChanges(txn.digest, txn?.objectChanges);
}

export async function sendCoins(
    fromAccount: Account,
    toAddress: string,
    amount: Amount,
    coinType: string,
) {
    // Send `amount` coins of `coinType` from `fromAccount` to `toAddress` Sui address

    // First merge the coins of type `coinType`
    mergeCoinParts(fromAccount, coinType);

    // Create transaction block
    const tx = new TransactionBlock();
    const [coin] = tx.splitCoins(tx.object(coinType), [tx.pure(amount)]);
    tx.transferObjects([coin], tx.pure(toAddress));

    // Sign and send Tx Block
    const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: fromAccount.keypair,
    });

    // Return the object changes of the transaction
    const txn = await client.getTransactionBlock({
        digest: result.digest,
        options: {
            showEffects: false,
            showInput: false,
            showEvents: false,
            showObjectChanges: true,
            showBalanceChanges: false,
        },
    });

    return new ObjectChanges(txn.digest, txn?.objectChanges);
}

export async function mergeCoinParts(account: Account, coinType = '0x2::sui::SUI') {
    // Merge the coin objects of `coinType` of the `account` account holder

    const coins = await client.getAllCoins({
        owner: account.address,
    });

    // Keep only the coins that we are interested in
    const coinParts = coins.data.filter((coin) => coin.coinType === coinType);

    // Merging the 0x2::sui::SUI coin requires to keep one of the coin objects
    // to pay for the transaction fees. Find the coin object with the max
    // amout of 0x2::sui::SUI and remove it from the merging. Merge the rest
    // of the coin objects.
    if (coinType === '0x2::sui::SUI') {
        const balances = coinParts.map((coin) => BigInt(coin.balance));
        const maxCoinObject = balances.reduce((m, b) => (b > m ? b : m));
        coinParts.splice(balances.indexOf(maxCoinObject), 1);
    }

    // If there are more than one parts of the coin then send a merge Tx
    if (coinParts.length > 1) {
        const tx = new TransactionBlock();
        tx.mergeCoins(
            tx.object(coinParts[0].coinObjectId),
            coinParts.slice(1, coinParts.length).map((coin) => tx.object(coin.coinObjectId)),
        );
        const result = await client.signAndExecuteTransactionBlock({
            transactionBlock: tx,
            signer: account.keypair,
        });

        const txn = await client.getTransactionBlock({
            digest: result.digest,
            options: {
                showEffects: false,
                showInput: false,
                showEvents: false,
                showObjectChanges: true,
                showBalanceChanges: false,
            },
        });

        return new ObjectChanges(txn.digest, txn?.objectChanges);
    }
}

export async function transferObjects(
    fromAccount: Account,
    toAddress: string,
    objectAddresses: string[],
) {
    // Transfer objects (based on their on-chain object ID) from `fromAccount`
    // to `toAddress` Sui address

    const tx = new TransactionBlock();
    tx.transferObjects(
        objectAddresses.map((address) => tx.object(address)),
        tx.pure(toAddress),
    );

    const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: fromAccount.keypair,
    });

    const txn = await client.getTransactionBlock({
        digest: result.digest,
        options: {
            showEffects: false,
            showInput: false,
            showEvents: false,
            showObjectChanges: true,
            showBalanceChanges: false,
        },
    });

    return new ObjectChanges(txn.digest, txn?.objectChanges);
}

export async function moveCall(
    caller: Account,
    packageId: string,
    module: string,
    targetFunction: string,
    gasBudget: number = 100000000,
    args: string[] = [],
) {
    // Call Move function `targetFunction` which is in `module` module of `package`

    const tx = new TransactionBlock();
    tx.setGasBudget(gasBudget);
    tx.moveCall({
        target: `${packageId}::${module}::${targetFunction}`,
        arguments: args.length > 0 ? args.map((arg) => tx.pure(arg)) : [],
    });

    const result = await client.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: caller.keypair,
    });

    const txn = await client.getTransactionBlock({
        digest: result.digest,
        options: {
            showEffects: false,
            showInput: false,
            showEvents: false,
            showObjectChanges: true,
            showBalanceChanges: false,
        },
    });

    return new ObjectChanges(txn.digest, txn?.objectChanges);
}
