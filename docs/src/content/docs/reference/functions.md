---
title: Scaf Functions
description: Overview of the functions that Scaf provides
---

Scaf is utilising the [`@mysten/sui.js` SDK](https://www.npmjs.com/package/@mysten/sui.js) package
to provide commonly used functions when developing Sui smart contracts and interracting with the
Sui network.

All the functions run against the network that is specified in the `scaf.config.js` file.
Read more about [Configuration](/reference/configuration/).


## Objects

In Sui, everything is an object and so there are various functions defined under the
[src/objects](https://github.com/cNikolaou/scaf/blob/master/src/objects.ts) file for
interracting with Sui objects.

At a glance:
- `sendSuiCoins()` can be used to send any `amount` SUI coins from one account to another.
- `sendCoins()` can be used to send any `amount` of any type of a token object from one account to another.
- `mergeCoinParts()` is a convenient function to merge the various fungible objects that
    a user has to a single object.
- `transferObjects()` can be used to send a list of object addresses from one account to another.
- `moveCall()` can be used to interract with any Move package on the Sui blockchain. The `args`
    argument of the function receives a list of the object IDs of the objects that the Move
    function expects to receive.

Calling the functions returns an `ObjectChanges` object.


## ObjectChanges Objects

A transaction in Sui results in objects that are being mutated, created, published, and destroyed.
With the `digest` of a transaction you can create an new `ObjectChanges` object by

```
// ... rest of the code

const txn = await provider.getTransactionBlock({
    digest: transaction.digest,
    options: {
        showEffects: false,
        showInput: false,
        showEvents: false,
        showObjectChanges: true,
        showBalanceChanges: false,
    },
});

const changes = new ObjectChanges(txn.digest, txn?.objectChanges);
```

Then you can refer to the various arrays in the `ObjectChanges` object for a better reference.


## Packages

Packages can be published with the `buildAndPublishPackage()` function. The function requires:
- an `account: Account` (see [Accounts](/reference/accounts/))
- the package name which is under the `./packages/` directory
- optionally, a `packagesPath` directory if the package is not under the `./packages/` directory

The function returns an `ObjectChanges` object.


## Terminal Display Utils

There are various utilities to display information about objects and accounts in the terminal.

For example the `showOwnership(address: string)` shows the objects and the coins that an address
has and the `showObjectChanges(txnObjectChanges: SuiObjectChanges[])` displays the object
changes of a transaction block in a way similar to what the SUI CLI does.