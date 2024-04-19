import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui.js/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui.js/keypairs/secp256r1';

type KeypairConstructors = {
    Ed25519Keypair: typeof Ed25519Keypair;
    Secp256k1Keypair: typeof Secp256k1Keypair;
    Secp256r1Keypair: typeof Secp256r1Keypair;
};

export type SchemaName = keyof KeypairConstructors;

const keypairSchemas: { [K in SchemaName]: KeypairConstructors[K] } = {
    Ed25519Keypair: Ed25519Keypair,
    Secp256k1Keypair: Secp256k1Keypair,
    Secp256r1Keypair: Secp256r1Keypair,
};

type KeypairInstance = InstanceType<KeypairConstructors[SchemaName]>;

export class Account {
    keypair: KeypairInstance;
    address: string;

    public constructor(seed: string, schema: SchemaName) {
        if (seed === undefined || schema === undefined) {
            throw new AccountError('Cannot create Account object; missing "seed" or "schema"');
        }

        this.keypair = keypairSchemas[schema].deriveKeypair(seed);
        this.address = this.keypair.getPublicKey().toSuiAddress();
    }
}

class AccountError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'AccountError';
    }
}

// DEPRECATED; kept for backwards compatibility and will be removed
export function getAccount(seed: string, schema: SchemaName): Account {
    return new Account(seed, schema);
}
