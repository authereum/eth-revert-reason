#!/usr/bin/env node

const getRevertReason = require('./')

const [,, ...args] = process.argv

async function run() {
  const txHash = args[0]
  const network = args[1] || 'mainnet'

  console.log(await getRevertReason(txHash, network))
}

run()