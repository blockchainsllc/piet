// tslint:disable-next-line:missing-jsdoc
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
    Json
}

export const rpcMethods: RpcMethod[] = [
    {
        name: 'web3_clientVersion'
    },
    {
        name: 'net_version'
    },
    {
        name: 'net_listening'
    },
    {
        name: 'net_peerCount'
    },
    {
        name: 'eth_protocolVersion'
    },
    {
        name: 'eth_syncing'
    },
    {
        name: 'eth_coinbase'
    },
    {
        name: 'eth_mining'
    },
    {
        name: 'eth_hashrate'
    },
    {
        name: 'eth_gasPrice'
    },
    {
        name: 'eth_accounts'
    },
    {
        name: 'eth_blockNumber'
    },
    {
        name: 'eth_getBalance',
        params: [
            {
                name: 'Address to check for balance',
                jsonType: JsonType.String
            },
            {
                name: 'Block "latest", "earliest" or "pending"',
                jsonType: JsonType.String
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
                name: 'Get full transaction object',
                jsonType: JsonType.Bool
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