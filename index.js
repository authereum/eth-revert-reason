const ethers = require('ethers')

/**
 * Get the revert reason from just a transaction hash
 * @param {string} txHash - Hash of an Ethereum transaction
 * @param {string} network - Ethereum network name
 * @param {nunber} blockNumber - A block number to make the call from
 * @param {*} customProvider - Custom provider (Only ethers and web3 providers are supported at thsitime)
 */

async function getRevertReason (txHash, network = 'mainnet', blockNumber = undefined, customProvider = undefined) {
  // Normalize the input params
  network = network.toLowerCase()
  blockNumber = blockNumber || 'latest'

  // If a web3 provider is passed in, wrap it in an ethers provider
  // A standard web3 provider will have `.version`, while an ethers will not
  if (customProvider && customProvider.version) {
    customProvider = new ethers.providers.Web3Provider(customProvider.currentProvider)
  }
  const provider = customProvider || ethers.getDefaultProvider(network)

  // Validate the input
  await validateInput(txHash, network, blockNumber, provider)

  // NOTE: If the txHash of a successful tx is is passed in here, the return will be an empty string ('')
  try {
    const tx = await provider.getTransaction(txHash)
    const code = await provider.call(tx, blockNumber)

    // NOTE: `code` may end with 0's which will return a text string with empty whitespace characters
    // This will truncate all 0s and set up the hex string as expected
    let codeString = `0x${code.substr(138)}`.replace(/0+$/, '')

    // If the codeString is an odd number of characters, add a trailing 0
    if (codeString.length % 2 === 1) {
      codeString += '0'
    }

    return ethers.utils.toUtf8String(codeString)
  } catch (err) {
    throw  new Error('Unable to decode revert reason')
  }
}

async function validateInput(txHash, network, blockNumber, provider) {
  // Only accept a valid txHash
  if (!(/^0x([A-Fa-f0-9]{64})$/.test(txHash)) || txHash.substring(0,2) !== '0x') {
    throw new Error('Invalid transaction hash')
  }

  // Only accept valid networks
  const networks = ['mainnet', 'kovan', 'goerli', 'ropsten', 'rinkeby']
  if (!networks.includes(network)) {
    throw new Error('Not a valid network')
  }

  // NOTE: Unless the node exposes the Parity `trace` endpoints, it is not possible to get the revert
  // reason of a transaction on kovan. Because of this, the call will end up here and we will return a custom message.
  if (network === 'kovan') {
    try {
      // Mimic the call to validate if the provider exposes Parity `trace` methods
      const tx = await provider.getTransaction(txHash)
      await provider.call(tx)
    } catch (err) {
      throw new Error('Please use a provider that exposes the Parity trace methods to decode the revert reason')
    }
  }

  // Validate the block number
  if (blockNumber !== 'latest') {
    const currentBlockNumber = await provider.getBlockNumber()
    const blockNumber = Number(blockNumber)

    // The block cannot be in the future
    if (blockNumber >= currentBlockNumber) {
      throw new Error('You cannot use a blocknumber that has not yet happened')
    }

    // A block older than 128 blocks needs access to an archive node
    if (blockNumber < currentBlockNumber - 128) {
      try {
        // Check to see if a provider has access to an archive node
        const tx = await provider.getTransaction(txHash)
        await provider.call(tx, blockNumber)
      } catch (err) {
        // NOTE: This error message is specific to Infura. Alchemy offers an Archive node by default, so an Alchemy node will never throw here.
        const errMessage = 'project ID does not have access to archive state'
        if (err.message.includes(errMessage)) {
          throw new Error('You cannot use a blocknumber that is older than 128 blocks. Please use a provider that uses a full archival node.')
        }
      }
    }
  }
}

module.exports = getRevertReason
