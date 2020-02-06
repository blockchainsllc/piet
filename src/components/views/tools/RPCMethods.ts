/**  
 *   This file is part of Piet.
 *
 *   Copyright (C) 2019  Heiko Burkhardt <heiko@slock.it>, Slock.it GmbH
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   Permissions of this strong copyleft license are conditioned on
 *   making available complete source code of licensed works and 
 *   modifications, which include larger works using a licensed work,
 *   under the same license. Copyright and license notices must be
 *   preserved. Contributors provide an express grant of patent rights.
 *   
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as EthUtil from 'ethereumjs-util';
import BigNumber from 'bignumber.js';
export interface RpcMethod {
    name: string;
    category: Category;
    params?: Param[];
    notice?: string;
}

export interface Param {
    name: string;
    jsonType: JsonType;
    notice?: string;
    example?: string;
}

export enum JsonType {
    String,
    Bool,
    Number,
    Json,
    StringOrNumber
}

export enum Category {
    Parity = 'Parity',
    Ganache = 'Ganache',
    JsonRpcNet = 'JsonRpcNet',
    JsonRpcEth = 'JsonRpcEth',
    JsonRpcWeb3 = 'JsonRpcWeb3',
    Web3jsUtils = 'Web3jsUtils',
    Web3jsAccount = 'Web3jsAccount',
    EthereumjsUtil = 'EthereumjsUtil'
    
}

export const EthereumjsUtilWrapper = {
    ecsign: (data: string, privateKey: string): any => {
        const sig = EthUtil.ecsign(EthUtil.toBuffer(data), EthUtil.toBuffer(privateKey));
        return { 
            v: sig.v,
            r: new BigNumber(EthUtil.bufferToHex(sig.r)).toFixed(),
            s: new BigNumber(EthUtil.bufferToHex(sig.s)).toFixed(),
            RpcSig: EthUtil.toRpcSig(sig.v, sig.r, sig.s)
        };
    }
};

export const rpcMethods: RpcMethod[] = [
    {
        category: Category.EthereumjsUtil,
        name: 'ecsign',
        notice: 'Returns the ECDSA signature of a message hash.',
        params: [
            {
                name: 'data',
                jsonType: JsonType.String,
                notice: 'Data to sign.'
            },
            {
                name: 'privateKey',
                jsonType: JsonType.String,
                notice: 'Private key used to sign.'
            }
        ]
    },
    {
        category: Category.Web3jsAccount,
        name: 'create',
        notice: 'Generates an account object with private key and public key.',
        params: [
            {
                name: 'entropy',
                jsonType: JsonType.String,
                notice: '(optional) A random string to increase entropy. If given it should be at least 32 characters. If none is given a random string will be generated using randomhex.'
            }
        ]
    },
    {
        category: Category.Web3jsAccount,
        name: 'sign',
        notice: 'Signs arbitrary data. The value passed as the data parameter will be UTF-8 HEX decoded and wrapped as follows: "\x19Ethereum Signed Message:\n" + message.length + message.',
        params: [
            {
                name: 'data',
                jsonType: JsonType.String,
                notice: 'The data to sign.'
            },
            {
                name: 'privateKey',
                jsonType: JsonType.String,
                notice: 'The private key to sign with.'
            }
        ]
    },
    {
        category: Category.Web3jsAccount,
        name: 'signTransaction',
        notice: 'Signs an Ethereum transaction with a given private key.',
        params: [
            {
                name: 'tx',
                jsonType: JsonType.Json,
                notice: 'The transaction object.'
            },
            {
                name: 'privateKey',
                jsonType: JsonType.String,
                notice: 'The private key to sign with.'
            }
        ]
    },
    {
        category: Category.Web3jsUtils,
        name: 'toChecksumAddress',
        notice: 'Will convert an upper or lowercase Ethereum address to a checksum address.',
        params: [
            {
                name: 'address',
                jsonType: JsonType.String,
                notice: 'An address string.'
            }
        ]
    },
    {
        category: Category.Web3jsUtils,
        name: 'checkAddressChecksum',
        notice: 'Checks the checksum of a given address. Will also return false on non-checksum addresses.',
        params: [
            {
                name: 'address',
                jsonType: JsonType.String,
                notice: 'An address string.'
            }
        ]
    },
    {
        category: Category.Web3jsUtils,
        name: 'sha3',
        notice: 'Will calculate the sha3 of the input.',
        params: [
            {
                name: 'String',
                jsonType: JsonType.String,
                notice: 'A string to hash.'
            }
        ]
    },
    {
        category: Category.Web3jsUtils,
        name: 'fromWei',
        notice: 'Converts any wei value into a ether value.',
        params: [
            {
                name: 'number',
                jsonType: JsonType.String,
                notice: 'The value in wei.'
            },
            {
                name: 'unit',
                jsonType: JsonType.String,
                notice: 'The ether to convert to.',
                example: '' 
                 + 'noether: ‘0’'
                 + '\nwei: ‘1’'
                 + '\nkwei: ‘1000’'
                 + '\nKwei: ‘1000’'
                 + '\nbabbage: ‘1000’'
                 + '\nfemtoether: ‘1000’'
                 + '\nmwei: ‘1000000’'
                 + '\nMwei: ‘1000000’'
                 + '\nlovelace: ‘1000000’'
                 + '\npicoether: ‘1000000’'
                 + '\ngwei: ‘1000000000’'
                 + '\nGwei: ‘1000000000’'
                 + '\nshannon: ‘1000000000’'
                 + '\nnanoether: ‘1000000000’'
                 + '\nnano: ‘1000000000’'
                 + '\nszabo: ‘1000000000000’'
                 + '\nmicroether: ‘1000000000000’'
                 + '\nmicro: ‘1000000000000’'
                 + '\nfinney: ‘1000000000000000’'
                 + '\nmilliether: ‘1000000000000000’'
                 + '\nmilli: ‘1000000000000000’'
                 + '\nether: ‘1000000000000000000’'
                 + '\nkether: ‘1000000000000000000000’'
                 + '\ngrand: ‘1000000000000000000000’'
                 + '\nmether: ‘1000000000000000000000000’'
                 + '\ngether: ‘1000000000000000000000000000’'
                 + '\ntether: ‘1000000000000000000000000000000’'
            }
        ]
    },
    {
        category: Category.Web3jsUtils,
        name: 'toWei',
        notice: 'Converts any ether value value into wei.',
        params: [
            {
                name: 'number',
                jsonType: JsonType.String,
                notice: 'The value.'
            },
            {
                name: 'unit',
                jsonType: JsonType.String,
                notice: 'The ether to convert from.',
                example: '' 
                 + 'noether: ‘0’'
                 + '\nwei: ‘1’'
                 + '\nkwei: ‘1000’'
                 + '\nKwei: ‘1000’'
                 + '\nbabbage: ‘1000’'
                 + '\nfemtoether: ‘1000’'
                 + '\nmwei: ‘1000000’'
                 + '\nMwei: ‘1000000’'
                 + '\nlovelace: ‘1000000’'
                 + '\npicoether: ‘1000000’'
                 + '\ngwei: ‘1000000000’'
                 + '\nGwei: ‘1000000000’'
                 + '\nshannon: ‘1000000000’'
                 + '\nnanoether: ‘1000000000’'
                 + '\nnano: ‘1000000000’'
                 + '\nszabo: ‘1000000000000’'
                 + '\nmicroether: ‘1000000000000’'
                 + '\nmicro: ‘1000000000000’'
                 + '\nfinney: ‘1000000000000000’'
                 + '\nmilliether: ‘1000000000000000’'
                 + '\nmilli: ‘1000000000000000’'
                 + '\nether: ‘1000000000000000000’'
                 + '\nkether: ‘1000000000000000000000’'
                 + '\ngrand: ‘1000000000000000000000’'
                 + '\nmether: ‘1000000000000000000000000’'
                 + '\ngether: ‘1000000000000000000000000000’'
                 + '\ntether: ‘1000000000000000000000000000000’'
            }
        ]
    },

    
    {
        category: Category.JsonRpcWeb3,
        name: 'web3_clientVersion',
        notice: 'Returns the current client version.'
    },
    {
        category: Category.JsonRpcWeb3,
        name: 'web3_sha3',
        notice: 'Returns Keccak-256 (not the standardized SHA3-256) of the given data.',
        params: [
            {
                name: 'Data',
                jsonType: JsonType.String,
                notice: 'The data to convert into a SHA3 hash.'
            }
        ]
    },
    {
        category: Category.JsonRpcNet,
        name: 'net_version',
        notice: 'Returns the current network id'
    },
    {
        category: Category.JsonRpcNet,
        name: 'net_listening',
        notice: 'Returns true if client is actively listening for network connections.'
    },
    {
        category: Category.JsonRpcNet,
        name: 'net_peerCount',
        notice: 'Returns number of peers currently connected to the client.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_protocolVersion',
        notice: 'Returns the current ethereum protocol version.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_syncing',
        notice: 'Returns an object with data about the sync status or false.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_coinbase',
        notice: 'Returns the client coinbase address.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_mining',
        notice: 'Returns true if client is actively mining new blocks.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_hashrate',
        notice: 'Returns the number of hashes per second that the node is mining with.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_gasPrice',
        notice: 'Returns the current price per gas in wei.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_accounts',
        notice: 'Returns a list of addresses owned by client.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_blockNumber',
        notice: 'Returns the number of most recent block.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getStorageAt',
        notice: 'Returns the value from a storage position at a given address.',
        params: [
            {
                name: 'Storage Address',
                jsonType: JsonType.String,
                notice: '20 Bytes - address of the storage'
            },
            {
                name: 'Storage Position',
                jsonType: JsonType.Number,
                notice: 'Integer of the position in the storage.'
            },
            {
                name: 'Block',
                jsonType: JsonType.String,
                notice: 'Block number, or the string "latest" or "earliest", see the default block parameter'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getTransactionCount',
        notice: 'Returns the number of transactions sent from an address.',
        params: [
            {
                name: 'Address',
                jsonType: JsonType.String,
                notice: '20 Bytes - Address'
            },
            {
                name: 'Block',
                jsonType: JsonType.String,
                notice: 'Block number, or the string "latest" or "earliest", see the default block parameter'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getBlockTransactionCountByHash',
        notice: 'Returns the number of transactions in a block from a block matching the given block hash.',
        params: [
            {
                name: 'Block Hash',
                jsonType: JsonType.String,
                notice: '32 Bytes - hash of a block.'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getBlockTransactionCountByNumber',
        notice: 'Returns the number of transactions in a block matching the given block number.',
        params: [
            {
                name: 'Block Number.',
                jsonType: JsonType.Number,
                notice: 'Integer of a block number.'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getUncleCountByBlockHash',
        notice: 'Returns the number of uncles in a block from a block matching the given block hash.',
        params: [
            {
                name: 'Block Hash',
                jsonType: JsonType.String,
                notice: '32 Bytes - hash of a block.'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getUncleCountByBlockNumber',
        notice: 'Returns the number of uncles in a block from a block matching the given block number.',
        params: [
            {
                name: 'Block Number.',
                jsonType: JsonType.Number,
                notice: 'Integer of a block number.'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getCode',
        notice: 'Returns code at a given address.',
        params: [
            {
                name: 'Address',
                jsonType: JsonType.String,
                notice: '20 Bytes - Address'
            },
            {
                name: 'Block',
                jsonType: JsonType.String,
                notice: 'Block number, or the string "latest" or "earliest", see the default block parameter'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_sign',
        notice: 'The sign method calculates an Ethereum specific signature with: sign(keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))).',
        params: [
            {
                name: 'Address',
                jsonType: JsonType.String,
                notice: '20 Bytes - Address'
            },
            {
                name: 'Message',
                jsonType: JsonType.String,
                notice: 'N Bytes - message to sign'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_sendTransaction',
        notice: 'Creates new message call transaction or a contract creation, if the data field contains code.',
        params: [
            {
                name: 'Transaction Object',
                jsonType: JsonType.Json,
                example: '{\n  "from": "0x16d4aBf4F640CBA3768A3B75F1bB060B0cC77194",' +
                    '\n  "to": "0x25fb1940f0358479b0643c366C296741C50a259a",' +
                    '\n  "value": "10",\n  "gas": "21000"\n}'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_sendRawTransaction',
        notice: 'Creates new message call transaction or a contract creation for signed transactions.',
        params: [
            {
                name: 'Transaction Data',
                jsonType: JsonType.String,
                notice: 'The signed transaction data'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_call',
        notice: 'Executes a new message call immediately without creating a transaction on the block chain.',
        params: [
            {
                name: 'Transaction Object',
                jsonType: JsonType.Json,
                notice: 'The transaction call object'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_estimateGas',
        notice: 'Generates and returns an estimate of how much gas is necessary to allow the transaction to complete. The transaction will not be added to the blockchain. Note that the estimate may be significantly more than the amount of gas actually used by the transaction, for a variety of reasons including EVM mechanics and node performance.',
        params: [
            {
                name: 'Transaction Object',
                jsonType: JsonType.Json
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getBlockByHash',
        notice: 'Returns information about a block by hash.',
        params: [
            {
                name: 'Block Hash',
                jsonType: JsonType.String,
                notice: '32 Bytes - hash of a block.'
            },
            {
                name: 'Return Full Object',
                jsonType: JsonType.Bool,
                notice: 'If true it returns the full transaction objects, if false only the hashes of the transactions.'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getTransactionByBlockHashAndIndex',
        notice: 'Returns information about a transaction by block hash and transaction index position.',
        params: [
            {
                name: 'Block Hash',
                jsonType: JsonType.String,
                notice: '32 Bytes - hash of a block.'
            },
            {
                name: 'Transaction Index',
                jsonType: JsonType.Number,
                notice: 'Integer of the transaction index position.'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getTransactionByBlockNumberAndIndex',
        notice: 'Returns information about a transaction by block number and transaction index position.',
        params: [
            {
                name: 'Block',
                jsonType: JsonType.String,
                notice: 'Block number, or the string "latest" or "earliest", see the default block parameter'
            },
            {
                name: 'Transaction Index',
                jsonType: JsonType.Number,
                notice: 'Integer of the transaction index position.'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getTransactionReceipt',
        notice: 'Returns the receipt of a transaction by transaction hash.',
        params: [
            {
                name: 'Transaction Hash',
                jsonType: JsonType.String,
                notice: '32 Bytes - hash of a transaction.'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getTransactionByHash',
        notice: 'Returns the information about a transaction requested by transaction hash.',
        params: [
            {
                name: 'Transaction Hash',
                jsonType: JsonType.String,
                notice: '32 Bytes - hash of a transaction.'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getUncleByBlockHashAndIndex',
        notice: 'Returns information about a uncle of a block by hash and uncle index position.',
        params: [
            {
                name: 'Block Hash',
                jsonType: JsonType.String,
                notice: '32 Bytes - hash of a block.'
            },
            {
                name: 'Uncle\'s Index',
                jsonType: JsonType.Number,
                notice: 'The uncle\'s index position'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getUncleByBlockNumberAndIndex',
        notice: 'Returns information about a uncle of a block by number and uncle index position.',
        params: [
            {
                name: 'Block',
                jsonType: JsonType.String,
                notice: 'Block number, or the string "latest" or "earliest", see the default block parameter'
            },
            {
                name: 'Uncle\'s Index',
                jsonType: JsonType.Number,
                notice: 'The uncle\'s index position'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_newFilter',
        notice: 'Creates a filter object, based on filter options, to notify when the state changes (logs). To check if the state has changed, call eth_getFilterChanges.',
        params: [
            {
                name: 'Filter Options',
                jsonType: JsonType.Json
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_newBlockFilter',
        notice: 'Creates a filter in the node, to notify when a new block arrives. To check if the state has changed, call eth_getFilterChanges.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_newPendingTransactionFilter',
        notice: 'Creates a filter in the node, to notify when new pending transactions arrive. To check if the state has changed, call eth_getFilterChanges.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_uninstallFilter',
        notice: 'Uninstalls a filter with given id. Should always be called when watch is no longer needed. Additonally Filters timeout when they aren\'t requested with eth_getFilterChanges for a period of time.',
        params: [
            {
                name: 'Filter ID',
                jsonType: JsonType.Number
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getFilterChanges',
        notice: 'Polling method for a filter, which returns an array of logs which occurred since last poll.',
        params: [
            {
                name: 'Filter ID',
                jsonType: JsonType.Number
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getFilterLogs',
        notice: 'turns an array of all logs matching filter with given id.',
        params: [
            {
                name: 'Filter ID',
                jsonType: JsonType.Number
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getLogs',
        notice: 'Returns an array of all logs matching a given filter object.',
        params: [
            {
                name: 'Filter Options',
                jsonType: JsonType.Json
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getWork',
        notice: 'Returns the hash of the current block, the seedHash, and the boundary condition to be met ("target").'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_submitWork',
        notice: 'Used for submitting a proof-of-work solution.',
        params: [
            {
                name: 'Found Nonce',
                jsonType: JsonType.String,
                notice: '8 Bytes - The nonce found (64 bits)'
            },
            {
                name: 'Pow-Hash Header',
                jsonType: JsonType.String,
                notice: '32 Bytes - The header\'s pow-hash (256 bits)'
            },
            {
                name: 'Mix Digest',
                jsonType: JsonType.String,
                notice: '32 Bytes - The mix digest (256 bits)'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_submitHashrate',
        notice: 'Used for submitting mining hashrate.',
        params: [
            {
                name: 'Hashrate',
                jsonType: JsonType.String,
                notice: 'A hexadecimal string representation (32 bytes) of the hash rate'
            },
            {
                name: 'ID',
                jsonType: JsonType.String,
                notice: 'A random hexadecimal(32 bytes) ID identifying the client'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getProof',
        notice: 'Returns the account- and storage-values of the specified account including the Merkle-proof.',
        params: [
            {
                name: 'Address',
                jsonType: JsonType.String,
                notice: '20 bytes - address of the account or contract'
            },
            {
                name: 'Array of storage-keys ',
                jsonType: JsonType.Json,
                notice: '32 Bytes - array of storage-keys which should be proofed and included. See eth_getStorageAt'
            },
            {
                name: 'Block',
                jsonType: JsonType.String,
                notice: 'Block number, or the string "latest" or "earliest", see the default block parameter'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getBlockByNumber',
        params: [
            {
                name: 'Block number',
                jsonType: JsonType.String
            },
            {
                name: 'Return Full Object',
                jsonType: JsonType.Bool,
                notice: 'If true it returns the full transaction objects, if false only the hashes of the transactions.'
            }
        ]
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_pendingTransactions',        
        notice: 'Returns the pending transactions list.'
    },
    {
        category: Category.JsonRpcEth,
        name: 'eth_getBalance',
        params: [
            {
                name: 'Address',
                jsonType: JsonType.String,
                notice: '20 Bytes - address to check for balance.'
            },
            {
                name: 'Block',
                jsonType: JsonType.String,
                notice: 'Block number, or the string "latest" or "earliest", see the default block parameter'
            }
        ]
    },
    
    {
        category: Category.Parity,
        name: 'trace_replayTransaction',
        notice: 'Parity Only - Replays a transaction, returning the traces.',
        params: [
            {
                name: 'Transaction Hash',
                jsonType: JsonType.String
            },
            {
                name: 'Type of trace',
                jsonType: JsonType.Json,
                notice: 'One or more of "vmTrace", "trace", "stateDiff" as array e.g. ["vmTrace", "trace"]'
            }
        ]
    },

    // Ganache specific apis
    {
        category: Category.Ganache,
        name: 'evm_snapshot',
        notice: 'Ganache Only - Snapshot the state of the blochchain at the current block.'
    },
    {
        category: Category.Ganache,
        name: 'evm_revert',
        notice: 'Ganache Only - Revert the state of the blockchain to a previous snapshot.',
        params: [
            {
                name: 'Snapshot id to revert to',
                jsonType: JsonType.String
            }
        ]
    },
    {
        category: Category.Ganache,
        name: 'evm_increaseTime',
        notice: 'Ganache Only - Jump forward in time.',
        params: [
            {
                name: 'Amount of time in seconds.',
                jsonType: JsonType.Number
            }
        ]
    },
    {
        category: Category.Ganache,
        name: 'evm_mine',
        notice: 'Ganache Only - Force a block to be mined. Takes one optional parameter, which is the timestamp a block should setup as the mining time.',
        params: [
            {
                name: 'Timestamp.',
                jsonType: JsonType.Number
            }
        ]
    }

]