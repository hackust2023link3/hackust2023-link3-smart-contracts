# hackUST2023 Link3 Smart Contracts

This repo is based on [Patrick Collins's Solidity course](https://youtu.be/gyMwXuJrbJQ).

This repo holds smart contracts for
- implementing Link3 Dollar
- implementing Link3 NFT
- implementing Link3 NFT marketplace where people can buy and sell any NFT using Link3 Dollar

# Usage

Deploy:

```
yarn hardhat deploy
```

# Testing
## Run unit tests in the /test/unit folder

```
yarn hardhat test
```
## Manually run scripts in the /scripts folder
1. Spin up your hardhat localhost
```
yarn hardhat node
```
2. pick a script and run it
```
yarn hardhat --network localhost run scripts/xxx.js
```

# Deploy to a testnet

1. Setup environment variabltes

You'll want to set your `SEPOLIA_RPC_URL` and `PRIVATE_KEY` as environment variables. You can add them to a `.env` file, similar to what you see in `.env.example`.

- `PRIVATE_KEY`: The private key of your account (like from [metamask](https://metamask.io/)). **NOTE:** FOR DEVELOPMENT, PLEASE USE A KEY THAT DOESN'T HAVE ANY REAL FUNDS ASSOCIATED WITH IT.
  - You can [learn how to export it here](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key).
- `SEPOLIA_RPC_URL`: This is url of the sepolia testnet node you're working with. You can get setup with one for free from [Alchemy](https://alchemy.com/?a=673c802981)

2. Get testnet ETH

Head over to [faucets.chain.link](https://faucets.chain.link/) and get some tesnet ETH. You should see the ETH show up in your metamask.

3. Deploy

```
yarn hardhat deploy --network sepolia
```