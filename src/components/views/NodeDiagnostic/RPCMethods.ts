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
export interface RpcMethod {
    name: string;
    params?: Param[];
    notice?: string;
}

export interface Param {
    name: string;
    jsonType: JsonType;
    notice?: string;
}

export enum JsonType {
    String,
    Bool,
    Number,
    Json,
    StringOrNumber
}

export const rpcMethods: RpcMethod[] = [
    {
        name: 'web3_clientVersion',
        notice: 'Returns the current client version.'
    },
    {
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
        name: 'net_version',
        notice: 'Returns the current network id'
    },
    {
        name: 'net_listening',
        notice: 'Returns true if client is actively listening for network connections.'
    },
    {
        name: 'net_peerCount',
        notice: 'Returns number of peers currently connected to the client.'
    },
    {
        name: 'eth_protocolVersion',
        notice: 'Returns the current ethereum protocol version.'
    },
    {
        name: 'eth_syncing',
        notice: 'Returns an object with data about the sync status or false.'
    },
    {
        name: 'eth_coinbase',
        notice: 'Returns the client coinbase address.'
    },
    {
        name: 'eth_mining',
        notice: 'Returns true if client is actively mining new blocks.'
    },
    {
        name: 'eth_hashrate',
        notice: 'Returns the number of hashes per second that the node is mining with.'
    },
    {
        name: 'eth_gasPrice',
        notice: 'Returns the current price per gas in wei.'
    },
    {
        name: 'eth_accounts',
        notice: 'Returns a list of addresses owned by client.'
    },
    {
        name: 'eth_blockNumber',
        notice: 'Returns the number of most recent block.'
    },
    {
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
        name: 'eth_sendTransaction',
        notice: 'Creates new message call transaction or a contract creation, if the data field contains code.',
        params: [
            {
                name: 'Transaction Object',
                jsonType: JsonType.Json
            }
        ]
    },
    {
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
        name: 'eth_newBlockFilter',
        notice: 'Creates a filter in the node, to notify when a new block arrives. To check if the state has changed, call eth_getFilterChanges.'
    },
    {
        name: 'eth_newPendingTransactionFilter',
        notice: 'Creates a filter in the node, to notify when new pending transactions arrive. To check if the state has changed, call eth_getFilterChanges.'
    },
    {
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
        name: 'eth_getWork',
        notice: 'Returns the hash of the current block, the seedHash, and the boundary condition to be met ("target").'
    },
    {
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
        name: 'eth_pendingTransactions',        
        notice: 'Returns the pending transactions list.'
    },
    {
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
    }
    

]