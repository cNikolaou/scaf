---
title: Setup & Run
description: How to setup and configure Scaf
---

After installing Scaf, you can create a structure for your project with:

```
npx scaf
```

This will create the following structure on the current directory:

```
.
├── packages/
├── scripts/
├── genesis.yaml
└── scaf.config.js
```

- The `packages/` directory includes sample Sui Move packages. This is where the package build
    and deploy function will look for your packages.
- The `scripts/` directory is where your scripts for interracting with the Sui blockchain will
    be. Initially, it includes a sample script that:
    - Starts a local, project-specific Sui blockchain.
    - Publishes the `packages/fungible_token` package on a local Sui blockchain.
    - Interracts with the published package by minting tokens.
- `genesis.yaml` is the file used by `Network.resetNetwork()` to configure the initial state
of the local blockchain. You need to update the file with your public addresses under `accounts:`.
If you comment out the `Network.resetNetwork()` for
- `scaf.config.js` selects against which network the script actions will run. The options are
`mainnet`, `testnet`, `devnet`, and `localnet`.
