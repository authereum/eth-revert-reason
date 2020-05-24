const fetch = require('isomorphic-fetch')

async function getBlockNumber(rpcUri) {
  const data = JSON.stringify({ 'method': 'eth_blockNumber','params': [],'id': 1,'jsonrpc': '2.0' })
  const res = await makeRpcCall(rpcUri, data)
  return Number(res.result)
}

async function getBalance(rpcUri, blockNumber) {
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
  const data = JSON.stringify({ 'method': 'eth_getBalance','params': [ZERO_ADDRESS, blockNumber],'id': 1,'jsonrpc': '2.0' })
  const res = await makeRpcCall(rpcUri, data)
  return Number(res.result)
}

async function getTransactionByHash(rpcUri, txHash) {
  const data = JSON.stringify({ 'method': 'eth_getTransactionByHash','params': [txHash],'id': 1,'jsonrpc': '2.0' })
  const res = await makeRpcCall(rpcUri, data)
  return res.result
}

async function call(rpcUri, tx, blockNumber) {
  const data = JSON.stringify({ 'method': 'eth_call','params': [tx, blockNumber],'id': 1,'jsonrpc': '2.0' })
  const res = await makeRpcCall(rpcUri, data)
  return res.result

}

async function makeRpcCall(rpcUri, data) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: data
  }

  const res = await fetch(rpcUri, options)
  return res.json()
}

module.exports = {
  getBlockNumber,
  getBalance, 
  getTransactionByHash,
  call
}
