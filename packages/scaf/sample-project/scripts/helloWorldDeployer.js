const {
    getAccount,
    showOwnership,
    buildAndPublishPackage,
    Network,
    moveCall,
    getPackagesPathRelativeToDir,
    getOwnedObjects,
} = require('@cnikolaou/scaf');

async function main() {
    const net = Network.getNetwork();

    net.resetNetwork();
    net.startNetwork();

    await net.waitUntilNetworkRuns();

    const deployerAccount = getAccount(process.env.SEED, process.env.SCHEMA);
    await showOwnership(deployerAccount.address);

    console.log('> Deployer Address:', deployerAccount.address);

    const packagesDir = getPackagesPathRelativeToDir(__dirname);
    const publishedPackage = await buildAndPublishPackage(
        deployerAccount,
        'fungible_token',
        packagesDir,
    );

    console.log('> Package ID:', publishedPackage.packageId);

    const mintHelloObjectTxb = await moveCall(
        deployerAccount,
        publishedPackage.packageId,
        'hello',
        'mint',
    );

    console.log(mintHelloObjectTxb);
    console.log(mintHelloObjectTxb.mutated[0].objectId);
    // await showOwnership(deployerAccount.address);

    const ownedObjects = await getOwnedObjects(deployerAccount.address);
    expect(ownedObjects.data).to.include(mintHelloObjectTxb.mutated[0].objectId);

    net.startNetwork();
}

module.exports = {
    main,
};
