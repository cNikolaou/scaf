---
title: Accounts
description: How to initialise and use accounts
---

Accounts contain the information to interract with the Sui blockchain by signing transactions.
You do not need to create an account if a field requires just the public address.

An `Account` has two fields:
- `keypair`: object that is used to sign transactions.
- `address`: the public address for convinient reference.

To create an account use the `getAccount(seed: string, schema: SchemaStr)` function by
passing the `seed` and the `schema`. The `schema` argument is a string that takes one
of the followin values:
- `Ed25519Keypair`
- `Secp256k1Keypair`
- `Secp256r1Keypair`

Generally, you do not want to hardcode any `seed` in your code and you will use an environment
variable on your system that contains the seed phrase. For example, you can use `dotenv` and
create a `.env` file with the seed phrase (and probably the schema) and then you will get an
account with:

```
import { getAccount } from '@cnikolaou/scaf';

const account = getAccount(process.env.SEED, process.env.SCHEMA);

// rest of the script ...
```