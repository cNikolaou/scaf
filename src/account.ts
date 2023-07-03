import { Ed25519Keypair, Secp256k1Keypair, Secp256r1Keypair } from '@mysten/sui.js';

export type SchemaStr = 'Ed25519Keypair' | 'Secp256k1Keypair' | 'Secp256r1Keypair';

type Schema = Ed25519Keypair | Secp256k1Keypair | Secp256r1Keypair;

export type Account = {
    keypair: Schema;
    address: string;
};

let keypairSchemas = {
    Ed25519Keypair: Ed25519Keypair,
    Secp256k1Keypair: Secp256k1Keypair,
    Secp256r1Keypair: Secp256r1Keypair,
};

class AccountError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'AccountError';
    }
}

export function getAccount(seed: string, schema: SchemaStr): Account {
    if (seed === undefined || schema === undefined) {
        throw new AccountError('Cannot create Account object; missing "seed" or "schema"');
    }

    let keypair = keypairSchemas[schema].deriveKeypair(seed);
    return {
        keypair,
        address: keypair.getPublicKey().toSuiAddress(),
    };
}
