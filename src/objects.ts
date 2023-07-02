import { TransactionBlock, RawSigner } from '@mysten/sui.js';

import { Account } from './account';
import { ObjectChanges } from './package';
import { getProvider } from './env';

const provider = getProvider();

type Amount = string | BigInt | number;

export async function sendSuiCoins(fromAccount: Account, toAddress: string, amount: Amount) {
    // Create transaction block
    const tx = new TransactionBlock();
    const [coin] = tx.splitCoins(tx.gas, [tx.pure(amount)]);
    console.log(coin);
    tx.transferObjects([coin], tx.pure(toAddress));

    // Sign and send Tx Block
    const signer = new RawSigner(fromAccount.keypair, provider);
    const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });

    const txn = await provider.getTransactionBlock({
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
    // First merge the coins of type `coinType`
    mergeCoinParts(fromAccount, coinType);

    // Create transaction block
    const tx = new TransactionBlock();
    const [coin] = tx.splitCoins(tx.object(coinType), [tx.pure(amount)]);
    tx.transferObjects([coin], tx.pure(toAddress));

    // Sign and send Tx Block
    const signer = new RawSigner(fromAccount.keypair, provider);
    const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });

    const txn = await provider.getTransactionBlock({
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
    const coins = await provider.getAllCoins({
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
        const signer = new RawSigner(account.keypair, provider);
        const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });

        const txn = await provider.getTransactionBlock({
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
    const tx = new TransactionBlock();
    tx.transferObjects(
        objectAddresses.map((address) => tx.object(address)),
        tx.pure(toAddress),
    );

    const signer = new RawSigner(fromAccount.keypair, provider);
    const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });

    const txn = await provider.getTransactionBlock({
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
