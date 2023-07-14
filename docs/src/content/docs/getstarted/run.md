---
title: Run Sample Project
description: Run your Scaf scripts
---

## Run

:::caution
Do not commit files with your seed phrases or private keys on a repository.
:::

To run the sample script that is automatically generated for you,
you need to create a local `.env` file with the  following information:

```
SEED='YOUR-SEED-PHRASE'
SCHEMA='SCHEMA-USED-FOR-PRIVATE-KEY'
SEND_TO='PUBLIC-ADDRESS-OF-RECEIVER'
```

Then run the sample script by:

```
npx scaf-run scripts/fungibleToken
```

And open the Sui explorer to see the results on the local network:
[https://suiexplorer.com/?network=local](https://suiexplorer.com/?network=local)

You can create and run your own scripts that interract with the Sui blockchain (either
`localnet` or any other Sui network), by selecting the active network for the scripts
in `scaf.config.js`. You can automate interractions with smart contracts or deploying
your own Sui Move smart contracts.