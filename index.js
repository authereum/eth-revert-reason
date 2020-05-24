const ethers = require('ethers')

/**
 * Get the revert reason from just a transaction hash
 * @param {string} txHash - Hash of an Ethereum transaction
 * @param {string} network - Ethereum network name
 * @param {number} blockNumber - A block number to make the call from
 * @param {*} customProvider - Custom provider (Only ethers and web3 providers are supported at this time)
 */

async function getRevertReason (txHash, network = 'mainnet', blockNumber = undefined, customProvider = undefined) {
  ({ network, blockNumber } = normalizeInput(network, blockNumber))

  await validateInputPreProvider(txHash, network)
  const provider = getProvider(customProvider, network)
  await validateInputPostProvider(txHash, network, blockNumber, provider)

  try {
    const tx = await provider.getTransaction(txHash)
    const code = await getCode(tx, network, blockNumber, provider)
    return decodeMessage(code, network)
  } catch (err) {
    throw  new Error('Unable to decode revert reason.')
  }
}

function normalizeInput(network, blockNumber) {
  return {
    network: network.toLowerCase(),
    blockNumber: blockNumber || 'latest'
  }
}

async function validateInputPreProvider(txHash, network) {
  // Only accept a valid txHash
  if (!(/^0x([A-Fa-f0-9]{64})$/.test(txHash)) || txHash.substring(0,2) !== '0x') {
    throw new Error('Invalid transaction hash')
  }

  const networks = ['mainnet', 'kovan', 'goerli', 'ropsten', 'rinkeby']
  if (!networks.includes(network)) {
    throw new Error('Not a valid network')
  }
}

function getProvider(customProvider, network) {
  // If a web3 provider is passed in, wrap it in an ethers provider
  // A standard web3 provider will have `.version`, while an ethers will not
  if (customProvider && customProvider.version) {
    customProvider = new ethers.providers.Web3Provider(customProvider.currentProvider)
  }
  return customProvider || ethers.getDefaultProvider(network)
}

async function validateInputPostProvider(txHash, network, blockNumber, provider) {
  // NOTE: Unless the node exposes the Parity `trace` endpoints, it is not possible to get the revert
  // reason of a transaction on kovan. Because of this, the call will end up here and we will return a custom message.
  if (network === 'kovan') {
    try {
      const tx = await provider.getTransaction(txHash)
      getCode(tx, network, blockNumber, provider)
    } catch (err) {
      throw new Error('Please use a provider that exposes the Parity trace methods to decode the revert reason.')
    }
  }

  // Validate the block number
  if (blockNumber !== 'latest') {
    const currentBlockNumber = await provider.getBlockNumber()
    blockNumber = Number(blockNumber)

    if (blockNumber >= currentBlockNumber) {
      throw new Error('You cannot use a blocknumber that has not yet happened.')
    }

    // A block older than 128 blocks needs access to an archive node
    if (blockNumber < currentBlockNumber - 128) {
      try {
        // Check to see if a provider has access to an archive node
        await provider.getBalance(ethers.constants.AddressZero, blockNumber)
      } catch (err) {
        const errCode = JSON.parse(err.responseText).error.code
        // NOTE: This error code is specific to Infura. Alchemy offers an Archive node by default, so an Alchemy node will never throw here.
        const infuraErrCode = -32002
        if (errCode === infuraErrCode) {
          throw new Error('You cannot use a blocknumber that is older than 128 blocks. Please use a provider that uses a full archival node.')
        }
      }
    }
  }
}

function decodeMessage(code, network) {
    // NOTE: `code` may end with 0's which will return a text string with empty whitespace characters
    // This will truncate all 0s and set up the hex string as expected
    // NOTE: Parity (Kovan) returns in a different format than other clients
    let codeString
    const fnSelectorByteLength = 4
    const dataOffsetByteLength = 32
    const strLengthByteLength = 32
    const strLengthStartPos = 2 + ((fnSelectorByteLength + dataOffsetByteLength) * 2)
    const strDataStartPos = 2 + ((fnSelectorByteLength + dataOffsetByteLength + strLengthByteLength) * 2)

    if (network === 'kovan') {
      const strLengthHex = code.slice(strLengthStartPos).slice(0, strLengthByteLength * 2)
      const strLengthInt = parseInt(`0x${strLengthHex}`, 16)
      const strDataEndPos = strDataStartPos + (strLengthInt * 2)
      if (codeString === '0x') return ''
      codeString = `0x${code.slice(strDataStartPos, strDataEndPos)}`
    } else {
      codeString = `0x${code.substr(138)}`.replace(/0+$/, '')
    }

    // If the codeString is an odd number of characters, add a trailing 0
    if (codeString.length % 2 === 1) {
      codeString += '0'
    }

    return ethers.utils.toUtf8String(codeString)

}

async function getCode(tx, network, blockNumber, provider) {
  if (network === 'kovan') {
    try {
      // NOTE: The await is intentional in order for the catch to work
      return await provider.call(tx, blockNumber)
    } catch (err) {
      return JSON.parse(err.responseText).error.data.substr(9)
    }
  } else {
    return provider.call(tx, blockNumber)
  }
}

module.exports = getRevertReason
