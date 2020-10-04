# Tokens Universe

This project aims at providing a user-friendly interface to monitor Ethereum ERC-20 token assets.

It connects to an Ethereum Wallet, retrieves the existing tokens and balances and check prices accross decentralized exchanges.

## Local Development

Prequisites:

* NodeJS development environment
* Yarn package manager

Clone the directory:

```shell
git clone git@github.com:mtahon/tokens-universe.git
```

Install the dependencies:
```shell
yarn install
```

Create a `.env` file, and edit it with your details:
```shell
cp .env.sample .env
```

Run the project:
```shell
yarn start
``` 

## Production Build

Create a production-optimized build:
```shell
yarn build
```