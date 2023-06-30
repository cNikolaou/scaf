import { execSync } from "child_process";

import { JsonRpcProvider, TransactionBlock, RawSigner, SuiObjectChange,
    SuiObjectChangePublished, SuiObjectChangeCreated, SuiObjectChangeMutated
} from "@mysten/sui.js"

import { Account } from "./account"
import { showObjectChanges } from "./utils"

type BuildOutput = {
    modules: [string]
    dependencies: [string]
}

class BuildError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "BuildError";
    }
}

class PublishError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = "PublishError";
    }
}

class ObjectChanges {
    /**
     * Class represents object changes from a transaction.
     */

    // Properties
    published: SuiObjectChangePublished[];
    created: SuiObjectChangeCreated[];
    mutated: SuiObjectChangeMutated[];

    constructor(objectChanges: SuiObjectChange[]) {
        // Find all the objects that were published
        this.published = objectChanges?.filter(
            (change): change is SuiObjectChangePublished => change.type === 'published'
        );

        // Find all the objects that were created
        this.created = objectChanges?.filter(
            (change): change is SuiObjectChangeCreated => change.type === 'created'
        );

        // Find all the objects that were mutated
        this.mutated = objectChanges?.filter(
            (change): change is SuiObjectChangeMutated => change.type === 'mutated'
        );
    }
}

class PublishedData extends ObjectChanges {
    /**
     * Class represents object changes from a transaction that publisehd
     * a package.
     */

    packageId: string = "";

    constructor(objectChanges: SuiObjectChange[]) {

        super(objectChanges)

        // Store the ID of the published package object
        if (this.published.length > 0) {
            this.packageId = this.published[0].packageId;
        }
    }
}

export function buildPackage(packageName: string, showBuildOutput: boolean = false) {

    try {
        const { modules, dependencies }: BuildOutput = JSON.parse(
            execSync(
                `sui move build --dump-bytecode-as-base64 --path "$(pwd)"/packages/${packageName}`,
                { encoding: 'utf-8' }
            )
        )

        if (showBuildOutput) {
            console.log(modules)
            console.log(dependencies)
        }

        return [modules, dependencies]

    } catch (error) {
        // show the compilation error message to locate and fix the issue(s)
        throw new BuildError(
            "The following errors where encountering while building the package:\n\n"+ error.stdout
        )
    }
}

export async function publishPackage(publisher: Account, modules: [string],
                                     dependencies: [string], provider: JsonRpcProvider,
                                     showPublishOutput: boolean = false) {

    const tx = new TransactionBlock();
    const [up] = tx.publish({
        modules,
        dependencies,
    });
    console.log(up)
    tx.transferObjects([up], tx.pure(publisher.address));

    const signer = new RawSigner(publisher.keypair, provider);
    const result = await signer.signAndExecuteTransactionBlock({
        transactionBlock: tx,
    });

    console.log('RESULT')
    console.log({ result })

    // get objectId
    const txn = await provider.getTransactionBlock({
        digest: result.digest,
        options: {
            showEffects: false,
            showInput: false,
            showEvents: false,
            showObjectChanges: true,
            showBalanceChanges: false,
        },
    })

    if (showPublishOutput) {
        // console.log(txn);
        showObjectChanges(txn?.objectChanges)
    }

    const publishedData = new PublishedData(txn?.objectChanges)

    if (publishedData.packageId === "") {
        throw new PublishError("Package not published");
    }

    return publishedData;
}

export async function buildAndPublishPackage(publisher: Account, packageName: string, provider: JsonRpcProvider, showPublishOutput: boolean = false) {

    const [modules, dependencies] = buildPackage(packageName);

    return publishPackage(publisher, modules, dependencies, provider, showPublishOutput);

}

export async function moveCall(caller: Account, packageId: string,
                                module: string, targetFunction: string,
                                provider: JsonRpcProvider, args: string[] = []) {

    const tx = new TransactionBlock();
    tx.moveCall({
        target: `${packageId}::${module}::${targetFunction}`,
        arguments: args.length > 0 ? args.map(arg => tx.pure(arg)) : [],
    });

    const signer = new RawSigner(caller.keypair, provider);
    const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });

    return result
}
