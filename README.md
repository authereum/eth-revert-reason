# eth-revert-reason

> Get the revert reason from a tx hash on Ethereum

[![License](http://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/authereum/eth-revert-reason/master/LICENSE)
[![NPM version](https://badge.fury.io/js/eth-revert-reason.svg)](http://badge.fury.io/js/eth-revert-reason)

## Install

```bash
npm install eth-revert-reason
```

## Notes
1. For now, this works consistently with the [Infura](https://infura.io/) and [Alchemy](https://docs.alchemyapi.io/) providers. Any other providers that you pass in may not work.
2. There are rare cases where a revert reason may be 'x' from the context of one block but it will be 'y' from the context of another block. This may cause inconsistencies.
3. This package relies on the ethers.js default provider. This provider may be subject to rate limits or inconsistencies. For consistent results, please pass in your own provider.
4. Alchemy's provider v2 uses Geth.


## Getting started

```javascript
const getRevertReason = require('eth-revert-reason')

// Failed with revert reason "Failed test"
console.log(await getRevertReason('0xf212cc42d0eded75041225d71da6c3a8348bdb9102f2b73434b480419d31d69a')) // 'Failed test'
console.log(await getRevertReason('0x640d2e0d1f4cff9b6e273458216451efb0dc08ebc13c30f6c88d48be7b35872a', 'goerli')) // 'Failed test'

// Failed with no revert reason
console.log(await getRevertReason('0x95ac5a6a1752ccac9647eb21ef8614ca2d3e40a5dbb99914adf87690fb1e6ccf')) // ''

// Successful transaction
console.log(await getRevertReason('0x02b8f8a00a0c0e9dcf60ddebd37ea305483fb30fd61233a505b73036408cae75')) // ''

// Call from the context of a previous block with a custom provider
let txHash = '0x6ea1798a2d0d21db18d6e45ca00f230160b05f172f6022aa138a0b605831d740'
let network = 'mainnet'
let blockNumber = 9892243
let provider = getAlchemyProvider(network) // NOTE: getAlchemyProvider is not exposed in this package
console.log(await getRevertReason(txHash, network, blockNumber, provider)) // 'BA: Insufficient gas (ETH) for refund'
```

## Future work
The following features will be added over time:

1. A better way to determine whether or not a node is full-archive.
2. A better way to determine whether or not a node exposes Parity `trace` methods.
3. Reduce the number of calls made by the provider.
4. Use raw RPC calls instead of a library
    - Will require unwrapping the provider from the library if provider is still a parameter
        - Note: this would still require using the ethers default provider


## Test

```bash
npm test
```

## License

[MIT](LICENSE)
