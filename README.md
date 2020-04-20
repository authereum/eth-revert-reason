# eth-revert-reason

> Get the revert reason from a tx hash on Ethereum

[![License](http://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/authereum/eth-revert-reason/master/LICENSE)
[![NPM version](https://badge.fury.io/js/eth-revert-reason.svg)](http://badge.fury.io/js/eth-revert-reason)

## Install

```bash
npm install eth-revert-reason
```

## Getting started

```javascript
const getRevertReason = require('eth-revert-reason')

let txHash = '0xf212cc42d0eded75041225d71da6c3a8348bdb9102f2b73434b480419d31d69a'
let network = 'mainnet'
console.log(await getRevertReason(txHash, network)) // Failed test
let txHash = '0xf212cc42d0eded75041225d71da6c3a8348bdb9102f2b73434b480419d31d69a'
let network = 'goerli'
console.log(await getRevertReason(txHash, network)) // Failed test
let txHash = '0xf212cc42d0eded75041225d71da6c3a8348bdb9102f2b73434b480419d31d69a'
let network = 'kovan'
console.log(await getRevertReason(txHash, network)) // Please use a provider that exposes the Parity trace methods to decode the revert reason
```

## Notes
1. Because Kovan uses Parity, it is not possible to get the error message without a provider that exposes Parity's `trace` methods. Because of this, Kovan revert reasons require a custom provider to be passed in.
2. There are rare cases where a revert reason may be 'x' from the context of one block but it will be 'y' from the context of another block. This may cause inconsistencies.
3. For now, this only works with Infura nodes.

## Future work
The following features will be added over time:

1. A better way to determine whether or not a node is full-archival.
2. A better way to determine whether or not a node exposes Parity `trace` methods.
3. Limit the number of calls made by the provider.
4. Support providers other than Infura.

## Test

```bash
npm test
```

## License

[MIT](LICENSE)
