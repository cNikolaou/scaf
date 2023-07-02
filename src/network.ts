import { execSync, spawn, ChildProcess } from 'child_process';
import http from 'http';

const networkRunCommand = 'start --network.config sui_local_network/network.yaml'.split(' ');
const networkResetCommand =
    'genesis --from-config genesis.yaml --working-dir sui_local_network/ -f'.split(' ');

const CHECK_NETWORK_UP_INTERVAL = 2000;

export class Network {
    // Singleton local network class

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
        this.networkResetProcess = spawn('sui', networkResetCommand);

        this.networkResetProcess.stdout.on('data', (data) => {
            console.log(`Local network reset stdout: ${data}`);
        });

        this.networkResetProcess.stderr.on('data', (data) => {
            console.error(`Local network reset stderr: ${data}`);
        });

        this.networkResetProcess.on('close', (code) => {
            console.log(`Local network reset exited with code ${code}`);
        });
    }

    public startNetwork() {
        // starts a local Sui network with the state stored in the
        // `sui_local_network` directory; wait for the reset process
        // to finish if the network is set to reset first

        if (this.networkResetProcess !== null) {
            this.networkResetProcess.on('close', () => {
                console.log('* Starting local network (after restart)...');
                this.networkRunProcess = spawn('sui', networkRunCommand);
                this.networkRunProcess.on('close', (code) => {
                    console.log(`Network process exited with code ${code}`);
                });
            });
        } else {
            console.log('Starting local network');
            this.networkRunProcess = spawn('sui', networkRunCommand);
            this.networkRunProcess.on('close', (code) => {
                console.log(`Network process exited with code ${code}`);
            });
        }
    }

    public stopNetwork() {
        if (this.networkRunProcess !== null) {
            this.networkRunProcess.kill();
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
            return -1;
        }
    }

    public async waitUntilNetworkRuns() {
        // Wait loop until the network starts and returns the total
        // number of transaction blocks which should be a natural number

        while ((await this.transactionBlocksCount()) === -1) {
            await sleepForMs(CHECK_NETWORK_UP_INTERVAL);
        }
    }
}

export function sleepForMs(milliseconds: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}
