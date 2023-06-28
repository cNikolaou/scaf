import { execSync } from "child_process";

import { JsonRpcProvider, TransactionBlock, RawSigner } from "@mysten/sui.js"

import { Account } from "./account"

type BuildOutput = {
    modules: [string]
    dependencies: [string]
}

export function buildPackage(packageName: string, showBuildOutput: boolean = false) {

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
}


export async function publishPackage(publisher: Account, modules: [string],
                                     dependencies: [string], provider: JsonRpcProvider) {

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

    const createdObject = txn.objectChanges?.find((change) => change.type === 'published');
    if (createdObject && createdObject.type === 'published') {
        const packageId = createdObject?.packageId;
        return packageId
    }

    return "ERROR: Package not published"
}

export async function buildAndPublishPackage(publisher: Account, packageName: string, provider: JsonRpcProvider) {

    const [modules, dependencies] = buildPackage(packageName)

    return publishPackage(publisher, modules, dependencies, provider)

}

export async function moveCall(caller: Account, packageId: string,
                                targetFunction: `${string}::${string}`,
                                provider: JsonRpcProvider, args: [string?] = []) {

    const tx = new TransactionBlock();
    tx.moveCall({
        target: `${packageId}::${targetFunction}`,
        arguments: args.length > 0 ? args.map(arg => tx.pure(arg)) : [],
    });

    const signer = new RawSigner(caller.keypair, provider);
    const result = await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });

    return result
}
