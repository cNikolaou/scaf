import { execSync } from 'child_process';

import {
    TransactionBlock,
    RawSigner,
    SuiObjectChange,
    SuiObjectChangePublished,
    SuiObjectChangeCreated,
    SuiObjectChangeMutated,
} from '@mysten/sui.js';

import { Account } from './account';
import { showObjectChanges } from './utils';
import { getProvider } from './env';

const provider = getProvider();

type BuildOutput = {
    modules: [string];
    dependencies: [string];
};

class BuildError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'BuildError';
    }
}

class PublishError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'PublishError';
    }
}

export class ObjectChanges {
    /**
     * Class represents object changes from a transaction.
     */

    // Digest of the block with the object changes tracked by objects of the class
    blockDigest: string;

    // Arrays with the object changes in the block
    published: SuiObjectChangePublished[];
    created: SuiObjectChangeCreated[];
    mutated: SuiObjectChangeMutated[];

    constructor(blockDigest: string, objectChanges: SuiObjectChange[]) {
        this.blockDigest = blockDigest;

        // Find all the objects that were published
        this.published = objectChanges?.filter(
            (change): change is SuiObjectChangePublished => change.type === 'published',
        );

        // Find all the objects that were created
        this.created = objectChanges?.filter(
            (change): change is SuiObjectChangeCreated => change.type === 'created',
        );

        // Find all the objects that were mutated
        this.mutated = objectChanges?.filter(
            (change): change is SuiObjectChangeMutated => change.type === 'mutated',
        );
    }
}

class PublishedData extends ObjectChanges {
    /**
     * Class represents object changes from a transaction that publisehd
     * a package.
     */

    packageId: string = '';

    constructor(blockDigest: string, objectChanges: SuiObjectChange[]) {
        super(blockDigest, objectChanges);

        // Store the ID of the published package object
        if (this.published.length > 0) {
            this.packageId = this.published[0].packageId;
        }
    }
}

export function buildPackage(
    packageName: string,
    packagesPath: string = '"$(pwd)"/packages',
    showBuildOutput: boolean = false,
) {
    // Use sui CLI tool to build the `packageName` package under `./packages/`

    try {
        const { modules, dependencies }: BuildOutput = JSON.parse(
            execSync(
                `sui move build --dump-bytecode-as-base64 --path ${packagesPath}/${packageName}`,
                { encoding: 'utf-8' },
            ),
        );

        if (showBuildOutput) {
            console.log(modules);
            console.log(dependencies);
        }

        return [modules, dependencies];
    } catch (error) {
        // throw an error related to the compilation error message to
        // locate and fix the issue(s)

        let errorMessage = '';

        if (error.message) {
            errorMessage += error.message + '\n';
        }

        if (error.stdout) {
            errorMessage += error.stdout?.toString() + '\n';
        }

        if (error.stderr) {
            errorMessage += error.stderr?.toString() + '\n';
        }

        throw new BuildError(
            'The following errors where encountering while building the package:\n\n' +
                errorMessage,
        );
    }
}

export async function publishPackage(
    publisher: Account,
    modules: [string],
    dependencies: [string],
    showPublishOutput: boolean = false,
) {
    // Send a transaction block to publish the compiled `modules`

    const tx = new TransactionBlock();
    const [up] = tx.publish({
        modules,
        dependencies,
    });
    console.log(up);
    tx.transferObjects([up], tx.pure(publisher.address));

    const signer = new RawSigner(publisher.keypair, provider);
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
    });

    if (result === null) {
        throw new PublishError('Publish transaction failed');
    }

    // get the transaction block data and the changes
    const txn = await provider.getTransactionBlock({
        digest: result.digest,
        options: {
            showEffects: false,
            showInput: false,
            showEvents: false,
            showObjectChanges: true,
            showBalanceChanges: false,
        },
    });

    if (showPublishOutput) {
        // console.log(txn);
        showObjectChanges(txn?.objectChanges);
    }

    const publishedData = new PublishedData(txn.digest, txn?.objectChanges);

    if (publishedData.packageId === '') {
        throw new PublishError('Package not published');
    }

    return publishedData;
}

export async function buildAndPublishPackage(
    publisher: Account,
    packageName: string,
    packagesPath?: string,
    showPublishOutput: boolean = false,
) {
    // Compile first the Move package `packageName` under the `packages/`
    // directory and publish the module-compilation output.
    // The `packagesPath` refers to the absolute path containing the
    // `packages/` directory. If ommited the "$(cwd)/packages/" directory
    // is used.

    const [modules, dependencies] = buildPackage(packageName, packagesPath);

    return publishPackage(publisher, modules, dependencies, showPublishOutput);
}
