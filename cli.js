#!/usr/bin/env node

const getRevertReason = require('./')

const [,, ...args] = process.argv

async function run() {
  const txHash = args[0]
  const network = args[1] || 'mainnet'
  const blockNumber = args[2] || undefined
  const provider = args[3] || undefined

  console.log(await getRevertReason(txHash, network, blockNumber, provider))
}

run()