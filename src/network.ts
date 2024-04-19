////
// Start a process to manage a local Sui network based on the documentation:
//  https://docs.sui.io/guides/developer/getting-started/local-network
//
//

import fs from 'fs';
import path from 'path';
import http from 'http';
import { execSync, spawn, ChildProcess } from 'child_process';

const GENESIS_FILE_NAME = 'genesis.yaml';
let genesisFilePath = path.resolve(process.cwd(), GENESIS_FILE_NAME);

if (!fs.existsSync(genesisFilePath)) {
    genesisFilePath = path.join(__dirname, '../examples', GENESIS_FILE_NAME);
}

const START_LOCAL_NETWORK = `RUST_LOG="off,sui_node=error" sui-test-validator --config-dir sui_local_network`;
const RESET_LOCAL_NETWORK = `sui genesis --from-config ${genesisFilePath} --working-dir sui_local_network/ -f --with-faucet`;

const CHECK_NETWORK_UP_INTERVAL = 2000;

export class Network {
    // Singleton local network class for a:
    // Sui fullnode, a Sui validator, and a Sui faucet

    networkResetProcess: ChildProcess | null = null;
    networkRunProcess: ChildProcess | null = null;

    private static networkInstance;

    private constructor() {}

    public static getNetwork(): Network {
        if (!Network.networkInstance) {
            Network.networkInstance = new Network();
        }
        return Network.networkInstance;
    }

    public resetNetwork() {
        // function that restarts the local network by:
        //  - setting the genesis to be based on the `genesis.yaml` file
        //  - removing the (potentially existing) network state from the
        //    `sui_local_network` directory

        console.log('* Resetting local network...');

        // synchronously create the `sui_local_network` directory if it doesn't exist
        execSync('mkdir -p sui_local_network');

        // start process that resets the local network state
        const RESET_LOCAL_NETWORK_PARTS = RESET_LOCAL_NETWORK.split(' ');
        this.networkResetProcess = spawn(
            RESET_LOCAL_NETWORK_PARTS[0],
            RESET_LOCAL_NETWORK_PARTS.splice(1),
        );

        this.networkResetProcess.stdout.on('data', (data) => {
            console.log(`Local network reset stdout: ${data}`);
        });

        this.networkResetProcess.stderr.on('data', (data) => {
            console.error(`Local network reset stderr: ${data}`);
        });

        this.networkResetProcess.on('close', (code) => {
            console.log(`Local network reset exited with code ${code}`);
            if (code !== 0) {
                process.exit(1);
            }
        });
    }

    start() {
        const START_LOCAL_NETWORK_PARTS = START_LOCAL_NETWORK.split(' ');

        this.networkRunProcess = spawn(
            START_LOCAL_NETWORK_PARTS[1],
            START_LOCAL_NETWORK_PARTS.splice(2),
            { env: { ...process.env, RUST_LOG: 'off,sui_node=error' } },
        );

        // this.networkRunProcess.stdout.on('data', (data) => {
        //     console.log(`Local network start stdout: ${data}`);
        // });

        this.networkRunProcess.stderr.on('data', (data) => {
            console.error(`Local network start stderr: ${data}`);
        });

        this.networkRunProcess.on('close', (code) => {
            console.log(`Network process exited with code ${code}`);
        });
    }

    public startNetwork() {
        // starts a local Sui network with the state stored in the
        // `sui_local_network` directory; wait for the reset process
        // to finish if the network is set to reset first

        if (this.networkResetProcess !== null) {
            this.networkResetProcess.on('close', () => {
                console.log('* Starting local network (after restart)...');
                this.start();
            });
        } else if (!this.networkRunProcess) {
            try {
                console.log('* Starting local network');
                this.start();
            } catch (error) {
                console.error('Error while spawining the start network process:', error);
            }
        } else {
            console.warn('Local network is already running');
        }
    }

    public stopNetwork() {
        if (this.networkRunProcess) {
            this.networkRunProcess.kill();
        } else {
            console.warn('Local network was NOT running');
        }
    }

    private localnetTranscationsBlocksRpc(): Promise<string> {
        // Make an RPC call to get the total block count and return
        // a promise that will either resolve in a string with the
        // serialised JSON response or will be rejected if there is
        // an issue with the request

        const data = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'sui_getTotalTransactionBlocks',
            params: [],
        });

        const options = {
            method: 'POST',
            hostname: '127.0.0.1',
            port: 9000,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(data);
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(data);
            req.end();
        });
    }

    public async transactionBlocksCount() {
        // Get the transaction blocks count or -1 if there is an
        // issue with the RPC request to the network; -1 is used to
        // easily distinguish between a successful RPC call, which
        // should return a natural number and an error that occured

        try {
            const data = await this.localnetTranscationsBlocksRpc();
            return JSON.parse(data);
        } catch (error) {
            console.error('transactionBlocksCount error:', error);
            return -1;
        }
    }

    public async waitUntilNetworkRuns() {
        // Wait loop until the network starts and returns the total
        // number of transaction blocks which should be a natural number

        console.log('Waiting for network to start...');
        while ((await this.transactionBlocksCount()) === -1) {
            console.log('Not started yet; waiting for network to start...');
            await sleepForMs(CHECK_NETWORK_UP_INTERVAL);
        }
    }
}

export function sleepForMs(milliseconds: number) {
    // Simple function to make node sleep and wait for `milliseconds`.
    // Eg to sleep for 3 seconds use as:
    //      await sleepForMs(3000)

    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}
