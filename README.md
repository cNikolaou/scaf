# Scaf: Sui Scaffolding Framework (alpha version)

Scaf is a development environment for the Sui blockchain. With Scaf you can:
- Develop, build, and deploy [Sui Move smart contracts](https://docs.sui.io/build/move).
- Interract with Sui Move smart contracts on `mainnet`, `testnet`, `devnet`,
    and `localnet`.
- Manage a local project-specific Sui network for development, testing, and
    simulating contract interraction.

# Prerequisites

Scaf requires the `sui` CLI for building the Sui Move smart contracts and for
running the local network. To [install the SUI CLI](https://docs.sui.io/build/install).

# Installation

You can install Scaf with npm. To start a new project and develop Sui Move smart
contracts

```
mkdir sui_move_project
cd sui_move_project

npm init -y
npm install @cnikolaou/scaf
```

# Setup and Configuration

After installing `scaf`, you can create a structure for your project with:

```
npx scaf
```

This will create the following structure:

```
.
├── packages/
├── scripts/
├── genesis.yaml
└── scaf.config.js
```

- The `packages/` directory includes sample Sui Move packages.
- The `scripts/` directory includes a sample script that:
    - Starts a local, project-specific Sui blockchain with the `Network.startNetwork()` function.
    - Publishes the `packages/fungible_token` package in a local Sui blockchain.
    - Interracts with the published package.
- `genesis.yaml` is the file used by `Network.resetNetwork()` to configure the initial state
of the local blockchain. You need to update the file with your public addresses under `accounts:`.
- `scaf.config.js` selects against which network the script actions will run. The options are
`mainnet`, `testnet`, `devnet`, and `localnet`.

# Run

To run the sample script, update the `package.json` file and change the
`"scripts"` to:

```
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node scripts/fungibleToken"
  },
```

You also need to create a local `.env` file with the following information
and you need to make sure not to include that in any commit:

```
SEED='YOUR-SEED-PHRASE'
SCHEMA='SCHEMA-USED-FOR-PRIVATE-KEY'
SEND_TO='PUBLIC-ADDRESS-OF-RECEIVER'
```

The run the script by:

```
npm start
```

You can create and run your own scripts that interract with the Sui blockchain (either
`localnet` or any other Sui network), by updating the `scaf.config.js`. You can automate
interractions with smart contracts or deploying your own Sui Move smart contracts.