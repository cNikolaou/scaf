---
title: Lesson 2 - Deploy the Smart Contract
description: A simple tutorial for developing and deploying a simple game on Sui
---

## Deploying

To deploy the application we will need to:
1. Create a package for our smart contract.
2. Import the seed phrase for your account.
3. Write a script that uses the Scaf framework to build the package and deploy it.


### Step 1 - Create a Sui Move Package

From the main directory you can create a new package by running:

```
sui move new PACKAGE_NAME
```

so in this case, we created a new package by running

```
sui move new lesson_2
```

If the `sui` CLI is not installed yet, you will need to install it for
building the application. To [install the SUI CLI](https://docs.sui.io/build/install).

### Step 2 - Account Seed
Smart contracts on the Sui blockchain are deployed by accounts that are
characterized by a seed phrase. You should create a `.env` file on your local
directory.

:::caution
You shouldn't check in the `.evn` file and commit it to any repository. These
is your private keys and should stay private.
:::

Add the following on the `.env` file:

```
SEED='YOUR-SEED-PHRASE'
SCHEMA='SCHEMA-USED-FOR-PRIVATE-KEY'
```

The `SCHEMA` is either Ed25519Keypair', 'Secp256k1Keypair', or 'Secp256r1Keypair'.

### Step 3 - Write a Deployment Script

We will use JavaScript to build and deploy the Sui smart contract we wrote
in Step 1.

The first step is to load the seed phrase and create an "account" object

```js
const deployerAccount = getAccount(process.env.SEED, process.env.SCHEMA);
console.log('> Account Address:', deployerAccount.address);
```

And then we can build and publish the package in one step:

```js
const packagesDir = getPackagesPathRelativeToDir(__dirname);
const publishedPackage = await buildAndPublishPackage(deployerAccount, 'lesson_1', packagesDir);
console.log('> Package ID:', publishedPackage.packageId);
```

We would like to deploy the new application in a local network which we can
spin in a very simple way by adding the following at the begging of our script:

```js
// Setup a local network for this project only
const net = Network.getNetwork();

// comment out net.resetNetwork() to preserve the state of the network across runs
net.resetNetwork();
net.startNetwork();
```

So all the whole script will look like:

```js
const {
    getAccount,
    showOwnership,
    buildAndPublishPackage,
    Network,
    getPackagesPathRelativeToDir,
} = require('@codlabs/scaf');

async function main() {
    // Setup a local network for this project only
    const net = Network.getNetwork();

    // comment out net.resetNetwork() to preserve the state of the network across runs
    net.resetNetwork();
    net.startNetwork();

    await net.waitUntilNetworkRuns();

    const deployerAccount = getAccount(process.env.SEED, process.env.SCHEMA);
    console.log('Account Address:', deployerAccount.address);

    /// Step 1: Publish the package
    const packagesDir = getPackagesPathRelativeToDir(__dirname);
    const publishedPackage = await buildAndPublishPackage(deployerAccount, 'lesson_1', packagesDir);
    console.log('> Package ID:', publishedPackage.packageId);

    /// Step 2: Show Object Ownership
    await showOwnership(deployerAccount.address);

    console.log(
        `> Explore transaction at: https://suiexplorer.com/address/${deployerAccount.address}?network=local`,
    );
    console.log('> Press Ctr+C to exit and stop the local Sui network');

    // Commented out so the Node process doesn't exit; allows inspecting the
    // network through the Sui explorer
    // net.stopNetwork();
}

main().catch((error) => console.error(error));
```

You can find it under `./scripts/lesson_2.js` and you can run it. Then click on
the `suiexplorer.com/address/` URL that will open a webpage with the
deployment transaction we just executed.