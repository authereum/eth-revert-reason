const ethers = require('ethers')
const toHex = require('to-hex')

const rpcCalls = require('./rpcCalls')

/**
 * Get the revert reason from just a transaction hash
 * @param {string} txHash - Hash of an Ethereum transaction
 * @param {string} network - Ethereum network name
 * @param {number} blockNumber - A block number to make the call from
 * @param {string} customRpcUri - URI of an Ethereum provider
 */

async function getRevertReason (txHash, network = 'mainnet', blockNumber = undefined, customRpcUri = undefined) {
  ({ network, blockNumber } = normalizeInput(network, blockNumber))

  await validateInputPreProvider(txHash, network)
  const rpcUri = getRpcUri(customRpcUri, network)
  await validateInputPostProvider(txHash, network, blockNumber, rpcUri)

  try {
    const unformattedTx = await rpcCalls.getTransactionByHash(rpcUri, txHash)
    const tx = formatTx(unformattedTx)
    const code = await getCode(rpcUri, tx, network, blockNumber)
    return decodeMessage(code, network)
  } catch (err) {
    throw new Error('Unable to decode revert reason.')
  }
}

function normalizeInput(network, blockNumber) {
  // TODO: Handle the case where blockNumber is not explicitly passed in
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

function getRpcUri(customRpcUri, network) {
  if (customRpcUri) return customRpcUri

  const ethersProvider = ethers.getDefaultProvider(network)
  return ethersProvider._providers[0].connection.url
}

async function validateInputPostProvider(txHash, network, blockNumber, rpcUri) {
  if (network === 'kovan') {
    try {
      const tx = await provider.getTransaction(txHash)
      getCode(tx, network, blockNumber, provider)
    } catch (err) {
      throw new Error('Please use a provider that exposes the Parity trace methods to decode the revert reason.')
    }
  }

  if (blockNumber === 'latest') return

  const currentBlockNumber = await rpcCalls.getBlockNumber(rpcUri)
  blockNumber = Number(blockNumber)

  if (blockNumber >= currentBlockNumber) {
    throw new Error('You cannot use a blocknumber that has not yet happened.')
  }

  await isArchiveNode(rpcUri, blockNumber)
}

async function isArchiveNode(rpcUri, blockNumber) {
  try {
    await rpcCalls.getBalance(rpcUri, blockNumber)
  } catch (err) {
    const errCode = JSON.parse(err.responseText).error.code
    // NOTE: This error code is specific to Infura. Alchemy offers an Archive node by default, so an Alchemy node will never throw here.
    const infuraErrCode = -32002
    if (errCode === infuraErrCode) {
      throw new Error('You cannot use a blocknumber that is older than 128 blocks. Please use a provider that uses a full archival node.')
    }
  }
}

function decodeMessage(code, network) {
    // NOTE: `code` may end with 0's which will return a text string with empty whitespace characters
    // This will truncate all 0s and set up the hex string as expected
    // NOTE: Parity and OE return in a different format than other clients
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

function formatTx(tx) {
  return {
    from: tx.from,
    to: tx.to,
    value: tx.value,
    gas: tx.gas,
    gasPrice: tx.gasPrice,
    data: tx.input,
    nonce: tx.nonce
  }
}

async function getCode(rpcUri, tx, network, blockNumber) {
  if (network === 'kovan') {
    try {
      // NOTE: The await is intentional in order for the catch to work
      return await rpcCalls.call(rpcUri, tx, blockNumber)
    } catch (err) {
      return JSON.parse(err.responseText).error.data.substr(9)
    }
  } else {
    return rpcCalls.call(rpcUri, tx, blockNumber)
  }
}

module.exports = getRevertReason
