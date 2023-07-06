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

Scaf is an opensource framework for scaffolding [Sui smart contracts](https://docs.sui.io/build/move).
It is built on top of the:

- [`@mysten/sui.js` SDK](https://www.npmjs.com/package/@mysten/sui.js)
- [Sui CLI](https://docs.sui.io/build/cli-client)

and provides functionality for interrecting with the Sui blockchain. It can be used for
developing and deploying Sui smart contracts, and for interracting with the Sui blockchain
by utilising conventient Scaf functions that abstract the biolerplate.


## Prerequisites

Scaf requires the `sui` CLI for building the Sui Move smart contracts and for
running the local network. To [install the SUI CLI](https://docs.sui.io/build/install).


## Installation

You can install Scaf with npm. To start a new project and develop Sui Move smart
contracts

```
mkdir sui_move_project
cd sui_move_project

npm init -y
npm install @cnikolaou/scaf
```

