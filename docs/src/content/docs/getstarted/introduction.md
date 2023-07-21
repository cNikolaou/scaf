---
title: Introduction
description: An introduction to Scaf
---

:::caution
Scaf is in early development. It's adviced to use it for local testing and deploying
to `testnet` and `devnet` at first and familiarise yourself with using the tool.
If you find something that is not working
[open an issue on GitHub](https://github.com/cNikolaou/scaf/issues).
:::

Scaf is a framework for developing, testing, and deploying
[Sui smart contracts](https://docs.sui.io/build/move) and provides conventient
functions that abstract biolerplate code.

You can use Scaf to:
- write Sui smart contracts, build them, and deploy them on any Sui network
- write scripts to simulate interractions with your smart contracts for testing
before deploying to `mainnet`
- write scripts that use Scaf to interract with any smart contract to
automate tasks

For example, you can have a script that burns `X` amount of tokens by calling
a `burn` function on your smart contract, or create a bot that calls
a liquidation function of a smart contract when some conditions are met.
And you can test all of that before actually interracting with `mainnet`, either
in a local Sui network, or any of the `devnet` and `testnet` public Sui networks.


## Prerequisites

Scaf requires the `sui` CLI for building the Sui Move smart contracts and for
running the local network. To [install the SUI CLI](https://docs.sui.io/build/install)
run:

```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui

```

And check if the CLI is installed:

```bash
sui --version
```


## Installation

You can install Scaf with npm. To start a new project and develop Sui Move smart
contracts

```
mkdir sui_move_project
cd sui_move_project

npm init -y
npm install @cnikolaou/scaf
```

## Issues & Feedback

We aim to make Scaf more usable and user friendly. If you find any bugs or
have any suggestions you can open a [GitHub issue](https://github.com/cNikolaou/scaf/issues).