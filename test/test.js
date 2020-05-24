const getRevertReason = require('../')
const ethers = require('ethers')

describe('getRevertReason', () => {
  const TX_HASH = {
    FAILED_AUTHEREUM_TX: {
      MAINNET: '0x6ea1798a2d0d21db18d6e45ca00f230160b05f172f6022aa138a0b605831d740',
      KOVAN: '0x371670e8e8dae59844f21845a6d9a96b1724a6f9e38842184e918b059fd143c7',
      GOERLI: '0x33d83df611f67f1cc609e3e6c44a7b3c95c38c0213199f08c9f4877a2a4b7baf',
      ROPSTEN: '0x80c344509e59b91c7b1e4ce5ec61204ad81ff4ee6198c59e0ab476513d7b7ea7',
      RINKEBY: '0xccd466d1fb2b5798ff751a760e132e22ae5f3672315d244d91e8a19b205c60b0'
    },
    // The failure message is 'Failed test'
    FAILED_RANDOM_TX: {
      MAINNET: '0xf212cc42d0eded75041225d71da6c3a8348bdb9102f2b73434b480419d31d69a',
      KOVAN: '0xf683310b52501194b0e9dacb089bcfd00071ba71099682b1230e6c73e5d3b215',
      GOERLI: '0x640d2e0d1f4cff9b6e273458216451efb0dc08ebc13c30f6c88d48be7b35872a',
      ROPSTEN: '0xa41c14a059a8012e86733242ecff470683e524258d475426818303ab0ff5945c',
      RINKEBY: '0x2429ac3f86da6522d500a3a0d15d0a6e9a1c27d3189cf18f5628b5b8c60be8e9'
    },
    NO_REVERT_MSG: {
      MAINNET: '0x95ac5a6a1752ccac9647eb21ef8614ca2d3e40a5dbb99914adf87690fb1e6ccf',
      KOVAN: '0x7df41e36899e0f4329afbc56985197751981ff245413503e57be375089b028f9',
      GOERLI: '0xa80d6653300142800d1bc2b675aec5eee3297575c987495d081b7f88b5fd31d6',
      ROPSTEN: '0x9a46afe833dfe42afc039e4ff4d3b248aa74652a468838e0d3e93c10ed7a96ef',
      RINKEBY: '0xad9cf1f3c332e03eff9badc668f7b673ca6a8adb012e672a18796080caf5e770'
    },
    OUT_OF_GAS: {
      MAINNET: '0x5871434b2e89ac62d643cc42a6c44ba75e16f229dbbdba3994e8202df5f1102f',
      KOVAN: '0xbfcb5416557910fac32346c868a4ff8d254a7b744eb5a7a6089d0e0a96f1781b',
      GOERLI: '0xe478a5a661821ee839d0cb7db51d4d9a8df9e9a5e1f5e28ef8eb7d3cc6c570c4',
      ROPSTEN: '0x2439fa82407f070e4e0e4aad353780fc98fd3a7f406c527c2b3d2af405ac2243',
      RINKEBY: '0xaf9c2cebfcf15bbf6421ed1c1cb0d3b463c29ab0e7704fa0cc2feb1a53152671'
    },
    BAD_INSTRUCTION: {
      MAINNET: '0xb84a441996ba3cffc82b17c5dd282b02feeb63826846931a8d16211fbece45bf',
      KOVAN: '0x3a7019d68dc220df3e402ebb45de7fe9fd9983b20d78fe94b9f0f89ec327db99',
      GOERLI: '0x6e9a8114b7acd8ec73411b5ed246f974be575cf849348239c1433466d5e21c2d',
      ROPSTEN: '0x2cb358e26fd80c267b5a2142eb2e877440a6920d52bc2ba8287efdb87ed9fb89',
      RINKEBY: '0xf5f98e8e2032e07b1695c9b80df51ffae8b91157740c2e130162914e486983a6'
    },
    SUCCESSFUL_TX: {
      MAINNET: '0x02b8f8a00a0c0e9dcf60ddebd37ea305483fb30fd61233a505b73036408cae75',
      KOVAN: '0xdbfef20645354e200a00a7e1a815722d832e9071f727f9cd0158f4906384e97f',
      GOERLI: '0x5e5dfb4d08ebcfbc3de543879d2ea2183bab5503bc2a68f8b2bbc622a901b2b4',
      ROPSTEN: '0x31590a132bc0b858ad69be3d409d3de625ebab98b48ad07db97edf5d0cfce786',
      RINKEBY: '0x2a215ad51888b09c585c4244d4ed5e9d9bccb773d400497881ba387b8bd7cc61'
    },
    // The error message is: "Tried to read `uint64` from a `CBOR.Value` with majorType != 0"
    // NOTE: This error message also tests the odd-length revert messages
    SPECIAL_CHARACTERS: {
      MAINNET: '0xceee8c5fea071d03008e0e29fe65d1387a1c9871f11bc20870b1b74ef44d1bd7',
      KOVAN: '0x22186d2d5da40b4cbadd1097b35471afa64c2f0eca8be79d8ee7ea354765bfbe',
      GOERLI: '0x0d2835694314658d752631611357a2e08029045bcfbabf2a38be5ff6a4a21f59',
      ROPSTEN: '0x6d8f63fa85c66f8ba65afea6c0b57a8bad9963be55712a64fe52f08a35f03958',
      RINKEBY: '0xfe0f6540e9b5dc15d31b131196ee4857b2c183166f8fcdc636bd3549aa8b5717'
    }
  }

  // REVERT_REASONS
  const REVERT_REASON = {
    // NOTE: The real reason why this transaction failed is 'BA: Insufficient gas (token) for refund', but
    // since the address has made another transaction since then, the `call` from this new context will say
    // the auth key is invalid, since the signature is technically invalid for this state.
    FAILED_AUTHEREUM_TX: 'LKMTA: Login key is expired',
    FAILED_RANDOM_TX: 'Failed test',
    UNABLE_TO_DECODE: 'Unable to decode revert reason',
    PARTY_TRACE_NOT_AVAILABLE: 'Please use a provider that exposes the Parity trace methods to decode the revert reason',
    SUCCESSFUL_TX: '',
    FAILURE_WITH_NO_REVERT_REASON: '',
    OUT_OF_GAS: '',
    BAD_INSTRUCTION: '',
    SPECIAL_CHARACTERS: 'Tried to read `uint64` from a `CBOR.Value` with majorType != 0',
    INVALID_TX_HASH: 'Invalid transaction hash',
    NOT_VALID_NETWORK: 'Not a valid network',
    FUTURE_BLOCK_NUMBER: 'You cannot use a blocknumber that has not yet happened.',
    ARCHIVE_NODE_REQUIRED: 'You cannot use a blocknumber that is older than 128 blocks. Please use a provider that uses a full archival node.',
    INSUFFICIENT_FUNDS: 'BA: Insufficient gas (ETH) for refund'
  }

  describe('Happy Path', () => {
    describe('mainnet', () => {
      const _network = 'mainnet'
      test('authereum transaction', async () => {
        expect(await getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.MAINNET, _network)).toEqual(REVERT_REASON.FAILED_AUTHEREUM_TX)
      })
      test('random transaction', async () => {
        expect(await getRevertReason(TX_HASH.FAILED_RANDOM_TX.MAINNET, _network)).toEqual(REVERT_REASON.FAILED_RANDOM_TX)
      })
      test('failure with no revert reason', async () => {
        expect(await getRevertReason(TX_HASH.NO_REVERT_MSG.MAINNET, _network)).toEqual(REVERT_REASON.FAILURE_WITH_NO_REVERT_REASON)
      })
    })
    describe('kovan', () => {
      const _network = 'kovan'
      test('authereum transaction', async () => {
        expect(await getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.KOVAN, _network)).toEqual(REVERT_REASON.FAILED_AUTHEREUM_TX)
      })
      test('random transaction', async () => {
        expect(await getRevertReason(TX_HASH.FAILED_RANDOM_TX.KOVAN, _network)).toEqual(REVERT_REASON.FAILED_RANDOM_TX)
      })
      test('failure with no revert reason', async () => {
        expect(await getRevertReason(TX_HASH.NO_REVERT_MSG.KOVAN, _network)).toEqual(REVERT_REASON.FAILURE_WITH_NO_REVERT_REASON)
      })
    })
    describe('goerli', () => {
      const _network = 'goerli'
      test('authereum transaction', async () => {
        expect(await getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.GOERLI, _network)).toEqual(REVERT_REASON.FAILED_AUTHEREUM_TX)
      })
      test('random transaction', async () => {
        expect(await getRevertReason(TX_HASH.FAILED_RANDOM_TX.GOERLI, _network)).toEqual(REVERT_REASON.FAILED_RANDOM_TX)
      })
      test('failure with no revert reason', async () => {
        expect(await getRevertReason(TX_HASH.NO_REVERT_MSG.GOERLI, _network)).toEqual(REVERT_REASON.FAILURE_WITH_NO_REVERT_REASON)
      })
    })
    describe('ropsten', () => {
      const _network = 'ropsten'
      test('authereum transaction', async () => {
        expect(await getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.ROPSTEN, _network)).toEqual(REVERT_REASON.FAILED_AUTHEREUM_TX)
      })
      test('random transaction', async () => {
        expect(await getRevertReason(TX_HASH.FAILED_RANDOM_TX.ROPSTEN, _network)).toEqual(REVERT_REASON.FAILED_RANDOM_TX)
      })
      test('failure with no revert reason', async () => {
        expect(await getRevertReason(TX_HASH.NO_REVERT_MSG.ROPSTEN, _network)).toEqual(REVERT_REASON.FAILURE_WITH_NO_REVERT_REASON)
      })
    })
    describe('rinkeby', () => {
      const _network = 'rinkeby'
      test('authereum transaction', async () => {
        expect(await getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.RINKEBY, _network)).toEqual(REVERT_REASON.FAILED_AUTHEREUM_TX)
      })
      test('random transaction', async () => {
        expect(await getRevertReason(TX_HASH.FAILED_RANDOM_TX.RINKEBY, _network)).toEqual(REVERT_REASON.FAILED_RANDOM_TX)
      })
      test('failure with no revert reason', async () => {
        expect(await getRevertReason(TX_HASH.NO_REVERT_MSG.RINKEBY, _network)).toEqual(REVERT_REASON.FAILURE_WITH_NO_REVERT_REASON)
      })
    })
  })
  describe('Non-Happy Path', () => {
    describe('mainnet', () => {
      const _network = 'mainnet'
      test('successful transaction', async () => {
        expect(await getRevertReason(TX_HASH.SUCCESSFUL_TX.MAINNET, _network)).toEqual(REVERT_REASON.SUCCESSFUL_TX)
      })
      test('out of gas', async () => {
        expect(await getRevertReason(TX_HASH.OUT_OF_GAS.MAINNET, _network)).toEqual(REVERT_REASON.OUT_OF_GAS)
      })
      test('bad instruction', async () => {
        expect(await getRevertReason(TX_HASH.BAD_INSTRUCTION.MAINNET, _network)).toEqual(REVERT_REASON.BAD_INSTRUCTION)
      })
      test('special characters', async () => {
        expect(await getRevertReason(TX_HASH.SPECIAL_CHARACTERS.MAINNET, _network)).toEqual(REVERT_REASON.SPECIAL_CHARACTERS)
      })
    })
    describe('kovan', () => {
      const _network = 'kovan'
      test('successful transaction', async () => {
        expect(await getRevertReason(TX_HASH.SUCCESSFUL_TX.KOVAN, _network)).toEqual(REVERT_REASON.SUCCESSFUL_TX)
      })
      test('out of gas', async () => {
        expect(await getRevertReason(TX_HASH.OUT_OF_GAS.KOVAN, _network)).toEqual(REVERT_REASON.OUT_OF_GAS)
      })
      test('bad instruction', async () => {
        expect(await getRevertReason(TX_HASH.BAD_INSTRUCTION.KOVAN, _network)).toEqual(REVERT_REASON.BAD_INSTRUCTION)
      })
      test('special characters', async () => {
        expect(await getRevertReason(TX_HASH.SPECIAL_CHARACTERS.KOVAN, _network)).toEqual(REVERT_REASON.SPECIAL_CHARACTERS)
      })
    })
    describe('goerli', () => {
      const _network = 'goerli'
      test('successful transaction', async () => {
        expect(await getRevertReason(TX_HASH.SUCCESSFUL_TX.GOERLI, _network)).toEqual(REVERT_REASON.SUCCESSFUL_TX)
      })
      test('out of gas', async () => {
        expect(await getRevertReason(TX_HASH.OUT_OF_GAS.GOERLI, _network)).toEqual(REVERT_REASON.OUT_OF_GAS)
      })
      test('bad instruction', async () => {
        expect(await getRevertReason(TX_HASH.BAD_INSTRUCTION.GOERLI, _network)).toEqual(REVERT_REASON.BAD_INSTRUCTION)
      })
      test('special characters', async () => {
        expect(await getRevertReason(TX_HASH.SPECIAL_CHARACTERS.GOERLI, _network)).toEqual(REVERT_REASON.SPECIAL_CHARACTERS)
      })
    })
    describe('ropsten', () => {
      const _network = 'ropsten'
      test('successful transaction', async () => {
        expect(await getRevertReason(TX_HASH.SUCCESSFUL_TX.ROPSTEN, _network)).toEqual(REVERT_REASON.SUCCESSFUL_TX)
      })
      test('out of gas', async () => {
        expect(await getRevertReason(TX_HASH.OUT_OF_GAS.ROPSTEN, _network)).toEqual(REVERT_REASON.OUT_OF_GAS)
      })
      test('bad instruction', async () => {
        expect(await getRevertReason(TX_HASH.BAD_INSTRUCTION.ROPSTEN, _network)).toEqual(REVERT_REASON.BAD_INSTRUCTION)
      })
      test('special characters', async () => {
        expect(await getRevertReason(TX_HASH.SPECIAL_CHARACTERS.ROPSTEN, _network)).toEqual(REVERT_REASON.SPECIAL_CHARACTERS)
      })
    })
    describe('rinkeby', () => {
      const _network = 'rinkeby'
      test('successful transaction', async () => {
        expect(await getRevertReason(TX_HASH.SUCCESSFUL_TX.RINKEBY, _network)).toEqual(REVERT_REASON.SUCCESSFUL_TX)
      })
      test('out of gas', async () => {
        expect(await getRevertReason(TX_HASH.OUT_OF_GAS.RINKEBY, _network)).toEqual(REVERT_REASON.OUT_OF_GAS)
      })
      test('bad instruction', async () => {
        expect(await getRevertReason(TX_HASH.BAD_INSTRUCTION.RINKEBY, _network)).toEqual(REVERT_REASON.BAD_INSTRUCTION)
      })
      test('special characters', async () => {
        expect(await getRevertReason(TX_HASH.SPECIAL_CHARACTERS.RINKEBY, _network)).toEqual(REVERT_REASON.SPECIAL_CHARACTERS)
      })
    })
  })
  describe('other tests', () => {
    test('invalid txHash - invalid length', async () => {
      const _txHash = '0x123'
      const _network = 'mainnet'
      await expect(getRevertReason(_txHash, _network)).rejects.toThrow(new Error(REVERT_REASON.INVALID_TX_HASH))
    })
    test('invalid txHash - invalid characters', async () => {
      const _txHash = '0xzzz1798a2d0d21db18d6e45ca00f230160b05f172f6022aa138a0b605831d740'
      const _network = 'mainnet'
      await expect(getRevertReason(_txHash, _network)).rejects.toThrow(new Error(REVERT_REASON.INVALID_TX_HASH))
    })
    test('invalid txHash - no 0x prefix', async () => {
      const _txHash = 'aa6ea1798a2d0d21db18d6e45ca00f230160b05f172f6022aa138a0b605831d740'
      const _network = 'mainnet'
      await expect(getRevertReason(_txHash, _network)).rejects.toThrow(new Error(REVERT_REASON.INVALID_TX_HASH))
    })
    test('abnormal txHash - all upper case', async () => {
      const _txHash = '0xF212CC42D0EDED75041225D71DA6C3A8348BDB9102F2B73434B480419D31D69A'
      const _network = 'mainnet'
      expect(await getRevertReason(_txHash, _network)).toEqual(REVERT_REASON.FAILED_RANDOM_TX)
    })
    test('unknown network', async () => {
      const _network = 'test'
      await expect(getRevertReason(TX_HASH.SUCCESSFUL_TX.KOVAN, _network)).rejects.toThrow(new Error(REVERT_REASON.NOT_VALID_NETWORK))
    })
    test('upercase network', async () => {
      const _network = 'MaInNeT'
      expect(await getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.MAINNET, _network)).toEqual(REVERT_REASON.FAILED_AUTHEREUM_TX)
    })
    test('upercase network', async () => {
      const _network = 'MaInNeT'
      expect(await getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.MAINNET, _network)).toEqual(REVERT_REASON.FAILED_AUTHEREUM_TX)
    })
    test('future block number', async () => {
      const _network = 'mainnet'
      const _blockNumber = 999999999999
      await expect(getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.MAINNET, _network, _blockNumber)).rejects.toThrow(new Error(REVERT_REASON.FUTURE_BLOCK_NUMBER))
    })
    test('early block number with no archive node', async () => {
      const _network = 'mainnet'
      const _blockNumber = 123
      await expect(getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.MAINNET, _network, _blockNumber)).rejects.toThrow(new Error(REVERT_REASON.ARCHIVE_NODE_REQUIRED))
    })
    test('get revert reason from the context of an early block', async () => {
      const _network = 'mainnet'
      // Revert reason from 'latest' context should be REVERT_REASON.FAILED_AUTHEREUM_TX
      expect(await getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.MAINNET, _network)).toEqual(REVERT_REASON.FAILED_AUTHEREUM_TX)

      // Revert reason from block 9892243 context should be REVERT_REASON.INSUFFICIENT_FUNDS
      const _blockNumber = 9892243
      const _provider = getAlchemyProvider(_network)
      expect(await getRevertReason(TX_HASH.FAILED_AUTHEREUM_TX.MAINNET, _network, _blockNumber, _provider)).toEqual(REVERT_REASON.INSUFFICIENT_FUNDS)
    })
  })
})

function getAlchemyProvider(network) {
  const rpcUrl = `https://eth-${network}.alchemyapi.io/v2/demo`
  return new ethers.providers.JsonRpcProvider(rpcUrl)
}
