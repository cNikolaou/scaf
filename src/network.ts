import { execSync, spawn, ChildProcess } from 'child_process';

const networkRunCommand = 'start --network.config sui_local_network/network.yaml'.split(' ');
const networkResetCommand =
    'genesis --from-config genesis.yaml --working-dir sui_local_network/ -f'.split(' ');

export class Network {
    networkResetProcess: ChildProcess | null = null;
    networkRunProcess: ChildProcess | null = null;

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
}

export function sleepForMs(milliseconds: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}
