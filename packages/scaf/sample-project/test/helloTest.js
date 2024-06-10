const { expect } = require('@cnikolaou/scaf/chai');

const {
    buildAndPublishPackage,
    Network,
    moveCall,
    getPackagesPathRelativeToDir,
    getTestAccounts,
    getOwnedObjects,
} = require('@cnikolaou/scaf');

describe('Deploy and test Hello World package', function () {
    it('Test deploying package and setting custom string', async function () {
        const net = Network.getNetwork();

        net.resetNetwork();
        net.startNetwork();

        await net.waitUntilNetworkRuns();

        const accounts = getTestAccounts();
        const deployerAccount = accounts[0];
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

        const ownedObjects = await getOwnedObjects(deployerAccount.address);
        expect(ownedObjects).to.include(mintHelloObjectTxb.mutated[0].objectId);

        net.startNetwork();
    });
});
