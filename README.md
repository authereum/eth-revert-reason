# eth-revert-reason

> Get the revert reason from a tx hash on Ethereum

[![License](http://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/authereum/eth-revert-reason/master/LICENSE)

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
2. (See Future Work) There are rare cases where a revert reason may be 'x' from the context of one block but it will be 'y' from the context of another block. This may cause inconsistencies. In the future, this package will allow the calling from the context of a specific block, however this will require a provider with a full archival node.

## Future work
The following features will be added over time:

1. The ability to get the revert message from the context of a specific block

## Test

```bash
npm test
```

## License

[MIT](LICENSE)
