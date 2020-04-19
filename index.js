const ethers = require('ethers')

const networks = ['mainnet', 'kovan', 'goerli', 'ropsten', 'rinkeby']
async function getRevertReason (txHash, network = 'mainnet', customProvider = undefined) {
  // Normalize the network name
  network = network.toLowerCase()

  // Only accept valid networks
  if (!networks.includes(network)) return 'Not a valid network'

  // NOTE: Unless the node exposes the Parity `trace` endpoints, it is not possible to get the revert
  // reason of a transaction on kovan. Because of this, the call will end up here and we will return a custom message
  if (network === 'kovan' && customProvider === undefined) {
    return 'Please use a provider that exposes the Parity trace methods to decode the revert reason'
  }

  // NOTE: If the txHash of a successful tx is is passed in here, the return will be an empty string ('')
  try {
    const provider = customProvider || ethers.getDefaultProvider(network)
    const tx = await provider.getTransaction(txHash)
    const code = await provider.call(tx)

    // NOTE: `code` may end with 0's which will return a text string with empty whitespace characters
    // This will truncate all 0s and set up the hex string as expected
    let codeString = `0x${code.substr(138)}`.replace(/0+$/, '')

    // If the codeStrig is an odd number of characters, add a trailing 0
    if (codeString.length % 2 === 1) {
      codeString += '0'
    }

    return ethers.utils.toUtf8String(codeString)
  } catch (err) {
    return 'Unable to decode revert reason'
  }
}

module.exports = getRevertReason
