import { Account, SchemaName } from './account';

const testAccount = {
    mnemonic: 'humor snow morning sand squeeze shove pencil glance cup escape song direct',
    schema: 'Ed25519Keypair' as SchemaName,
};

export function getTestAccounts(): Array<Account> {
    return Array.from(
        { length: 10 },
        (_, index) => new Account(testAccount.mnemonic, testAccount.schema, 0, index),
    );
}
