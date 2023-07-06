---
title: Local Sui Network
description: How to run a local network for development
---

Running a local, project-specific Sui network will allow you to deploy and test your smart contracts
in a local environment before publishing on any public blockchain.

The local network allows you to have control over the state before going public.

Additionally, each project can have its own local network, which means that working on multiple
project won't cause them to interefer with each other.

## Network Setup and Management

The state of the local network is stored under the `./sui_local_network/` directory.

The local Sui network is managed by the 3 public functions:
- `Network.resetNetwork()` resets the network to the state defined by the `./genesis.yaml` file
    or the `examples/genesis.yaml` if no `genesis.yaml` file exists in the main project directory.
    Any previous state for the project-specific network will be erased.
- `Network.startNetwork()` starts the local Sui network from the latest stored state.
- `Network.stopNetwork()` stops the local Sui network.

An additional `Network.waitUntilNetworkRuns()` function is provided for you to await for the
network to start.

If you don't run `Network.stopNetwork()` at the end of your script, then the process will not
stop and the script will wait for you to press `Ctrl+C`. This can be useful if you want to
observe the state of the network and the accounts at the end of your script.