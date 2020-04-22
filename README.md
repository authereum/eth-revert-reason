# eth-revert-reason

> Get the revert reason from a tx hash on Ethereum

[![License](http://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/authereum/eth-revert-reason/master/LICENSE)
[![NPM version](https://badge.fury.io/js/eth-revert-reason.svg)](http://badge.fury.io/js/eth-revert-reason)

## Install

```bash
npm install eth-revert-reason
```

## Notes
1. For now, this works consistently with [Infura](https://infura.io/) and [Alchemy](https://docs.alchemyapi.io/) providers. Any other providers that you pass in may not work.
2. Because Kovan uses Parity exclusively, it is not possible to get the error message without a provider that exposes Parity's `trace` methods. Because of this, Kovan revert reasons require a custom provider to be passed in. Infura offers an "Archive node" package and Alchemy offers this by default. _NOTE: Successful transactions and transactions that run out of gas do **not** need trace to be enabled and will return an empty string._
3. There are rare cases where a revert reason may be 'x' from the context of one block but it will be 'y' from the context of another block. This may cause inconsistencies.
4. This package relies on the ethers.js default provider. This provider may be subject to rate limits or inconsistencies. For consistent results, please pass in your own provider.


## Getting started

```javascript
const getRevertReason = require('eth-revert-reason')

// Failed with revert reason "Failed test"
console.log(await getRevertReason('0xf212cc42d0eded75041225d71da6c3a8348bdb9102f2b73434b480419d31d69a', 'mainnet')) // 'Failed test'
console.log(await getRevertReason('0xf212cc42d0eded75041225d71da6c3a8348bdb9102f2b73434b480419d31d69a', 'goerli')) // 'Failed test'

// Successful transaction
console.log(await getRevertReason('0x02b8f8a00a0c0e9dcf60ddebd37ea305483fb30fd61233a505b73036408cae75', 'mainnet')) // ''

// Kovan transaction
console.log(await getRevertReason('0xf212cc42d0eded75041225d71da6c3a8348bdb9102f2b73434b480419d31d69a', 'kovan')) // 'Please use a provider that exposes the Parity trace methods to decode the revert reason'
```

## Future work
The following features will be added over time:

1. A better way to determine whether or not a node is full-archive.
2. A better way to determine whether or not a node exposes Parity `trace` methods.
3. Reduce the number of calls made by the provider.
4. Full CLI functionality.

## Test

```bash
npm test
```

## License

[MIT](LICENSE)
