---
title: Configuration
description: How to configure Scaf
---

## Seed Phrases

:::caution
Be carefull with how and where you store seed phrases. You generally would not want to commit
the seed phrases in a repository, and especially not encrypted.
:::

You can install `dotenv` to have a local `.env` file in your project with seed phrases of the accounts that
you intent to use to sign transactions. Read more in the [Accounts section](/reference/accounts/).

The `.env` file will contain the environment variables that will be access by `process.env` in
your scripts.

For example your `.env` file can be

```
SEED_SENDER='words of the seed phrase'
SCHEMA_SENDER='Ed25519Keypair'

SEED_RECEIVER='words of the seed phrase'
SCHEMA_RECEIVER='Ed25519Keypair'

SEED_MANAGER='words of the seed phrase'
SCHEMA_MANAGER='Ed25519Keypair'
```

And then you can create accounts that will be able to sign transactions in a `.js` file under
`/scripts` by:

```
const { getAccount } = require('@cnikolaou/scaf');

async function main() {

    const managerAccount = getAccount(process.env.SEED_MANAGER, process.env.SCHEMA_MANAGER);
    const senderAccount = getAccount(process.env.SEED_SENDER, process.env.SCHEMA_SENDER);
    const receiverAccount = getAccount(process.env.SEED_RECEIVER, process.env.SCHEMA_RECEIVER);

    //.... rest of the script
}

main().catch((error) => console.error(error));
```


## Active Network

You can configure the active network against which the scripts will run in the `scaf.config.js`
configuration file that should be located in the main directory of your project (where the
`package.json` file is also located).

The options for the `network` parameter are the following:
- `localnet`: refers to the project-specific local Sui network
- `devnet`: public Sui devnet
- `testnet`: public Sui testnet
- `mainnet`: public Sui mainnet

## Local Network Genesis

When running a local, project-specific Sui blockchain, you can configure the genesis state
of the blockchain by updating the `genesis.yaml` file that should be located in the main
directory of your project. Read more about the [Local Sui Network](/reference/localnetwork/)
and why you might want to use it.

If there is no `genesis.yaml` on the main directory of your project, you can get a
sample `genesis.yaml` file by running `npx scaf`. One thing that you would like to
update are the addresses that have the initial Sui coins, under the `address:` sections
of the files, and you can add more addresses based on your needs.