/**
 *  This file is part of Piet.
 *
 *  Piet is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  Piet is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with Piet.  If not, see <http://www.gnu.org/licenses/>.
 * 
 *  @author Heiko Burkhardt <heiko@slock.it>, Slock.it GmbH
 * 
 */

import * as Sol from './SolidityHandler';
import * as Web3 from 'web3';
import In3Client from 'in3';

export enum ConnectionType {
    Injected = 'INJECTED',
    MainnetIncubed = 'MAINNET_INCUBED',
    Rpc = 'RPC',
    WebSocketRPC =  'WEBSOCKET_RPC',
    None = 'NONE'
}


type UpdateBlockchainConnection = (blockchainConnection: BlockchainConnection) => void;
type AddAccount = (privateKey: string) => void;
type SelectAccount = (address: string) => void;
type AddTransactionToHistory = (transaction: any) => void;
export interface BlockchainConnection {
    connectionType: ConnectionType;
    rpcUrl: string;
    web3: Web3;
    selectedAccount: string;
    updateBlockchainConnection: UpdateBlockchainConnection;
    addAccount: AddAccount;
    addTransactionToHistory: AddTransactionToHistory;
    selectAccount: SelectAccount;
    useDefaultAccount: boolean;
    transactionHistory: any[];
    netVersion: string;
}

type CheckBlockchainConnection = (blockchainConnection: BlockchainConnection) => boolean;
export const checkBlockchainConnection: CheckBlockchainConnection = (blockchainConnection: BlockchainConnection): boolean => {
    return blockchainConnection &&
        blockchainConnection.connectionType !== ConnectionType.None &&
        blockchainConnection.web3;
};

type GetWeiBalance = (blockchainConnection: BlockchainConnection, address: string) => Promise<string>;
export const getWeiBalance: GetWeiBalance = (blockchainConnection: BlockchainConnection, address: string): Promise<string> => {
    return blockchainConnection.web3.eth.getBalance(address);
};

type SendJSONRpcQuery = (blockchainConnection: BlockchainConnection, data: any) => Promise<any>;
export const sendJSONRpcQuery: SendJSONRpcQuery = (blockchainConnection: BlockchainConnection, data: any): Promise<any> => {
    return new Promise((resolve: any, reject: any): void => {
        const provider: any = blockchainConnection.web3.currentProvider;

        provider.send(
            data, 
            (error: any, result: any) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
    });
};

export const resultToOutput: (result: any) => string = (result: any): string => {
    if (typeof result !== 'object') {
        return result.toString();
    } else {
        
        return JSON.stringify({...result}, null, 2);
    }
};

type GetNetVersion = (bC: BlockchainConnection) => Promise<string>
const getNetVersion: GetNetVersion = (bC: BlockchainConnection): Promise<string> => {
    return sendJSONRpcQuery(bC, {
        jsonrpc: '2.0',
        method: 'net_version', 
        params: [], 
        id: 0
    });
};

type ChangeBlockchainConfiguration = (
    blockchainConnection: BlockchainConnection
) => Promise<{blockchainConnection: BlockchainConnection; error: any}>;

export const changeBlockchainConfiguration: ChangeBlockchainConfiguration = async (
    blockchainConnection: BlockchainConnection
): Promise<{blockchainConnection: BlockchainConnection; error: any}> => {

    try {
        const getFirstAccount: (web3: Web3) => Promise<string> = async (web3: Web3): Promise<string> =>  {
            const accounts: string[] = await blockchainConnection.web3.eth.getAccounts();
            if (blockchainConnection.useDefaultAccount) {
                return null;
            } else if (accounts.length > 0) {
                return accounts[0];
            } else {
                return null;
            }
            
        };

        blockchainConnection.useDefaultAccount = true;
    
        switch (blockchainConnection.connectionType) {
            case ConnectionType.MainnetIncubed:
                blockchainConnection.web3 = new Web3(new In3Client({
                    proof         : 'none',
                    signatureCount: 0,
                    requestCount  : 2,
                    chainId       : 'mainnet'
                }).createWeb3Provider());
                blockchainConnection.selectedAccount = null;
                blockchainConnection.useDefaultAccount = true;
                blockchainConnection.netVersion = (await getNetVersion(blockchainConnection) as any).result;
                return {blockchainConnection, error: null};
            case ConnectionType.WebSocketRPC:
                blockchainConnection.web3 = new Web3(new Web3.providers.WebsocketProvider(blockchainConnection.rpcUrl));
                blockchainConnection.selectedAccount = await getFirstAccount(blockchainConnection.web3);
                blockchainConnection.netVersion = (await getNetVersion(blockchainConnection) as any).result;
                return {blockchainConnection, error: null};
    
            case ConnectionType.Rpc:
            
                blockchainConnection.web3 = new Web3(blockchainConnection.rpcUrl);
                blockchainConnection.selectedAccount = await getFirstAccount(blockchainConnection.web3);
                blockchainConnection.netVersion = (await getNetVersion(blockchainConnection) as any).result;
                return {blockchainConnection, error: null};
    
            case ConnectionType.Injected:
                if ((window as any).ethereum) {
                    blockchainConnection.web3 = new Web3((window as any).ethereum);
                    await (window as any).ethereum.enable();
                    blockchainConnection.selectedAccount = await getFirstAccount(blockchainConnection.web3);
                } else if ((window as any).web3) {
                    blockchainConnection.web3 = new Web3((window as any).web3.currentProvider);
                    blockchainConnection.selectedAccount = await getFirstAccount(blockchainConnection.web3);
                } else {
                    blockchainConnection.connectionType = ConnectionType.None;
                    blockchainConnection.selectedAccount = null;
                    blockchainConnection.web3 = new Web3();
                }
                blockchainConnection.netVersion = (await getNetVersion(blockchainConnection) as any).result;
                
                return {blockchainConnection, error: null};
            case ConnectionType.None:
            default:
                blockchainConnection.web3 = new Web3();
                blockchainConnection.connectionType = ConnectionType.None;
                blockchainConnection.netVersion = null;
                return {blockchainConnection, error: null};
        }
    } catch (e) {
        blockchainConnection.web3 = new Web3();
        blockchainConnection.connectionType = ConnectionType.None;
        return {blockchainConnection, error: e};
    }
    
};

type GetFunctionSignature = (blockchainConnection: BlockchainConnection, abi: any) => string;
export const getFunctionSignature: GetFunctionSignature = (blockchainConnection: BlockchainConnection, abi: any): string => {
    return blockchainConnection.web3.eth.abi.encodeFunctionSignature(abi);
};

type Utf8ToHex = (blockchainConnection: BlockchainConnection, input: string) => string;
export const utf8ToHex: Utf8ToHex = (blockchainConnection: BlockchainConnection, input: string): string => {
    return blockchainConnection.web3.utf8ToHex(input);
};

type GetAccounts = (blockchainConnection: BlockchainConnection) => any[]; 
export const getAccounts: GetAccounts = (blockchainConnection: BlockchainConnection): any[] => {
    return blockchainConnection.web3.eth.getAccounts();
};

type InitBlockchainConfiguration = (
    rpcUrl: string, 
    updateBlockchainConnection: UpdateBlockchainConnection,
    addAccount: AddAccount,
    selectAccount: SelectAccount,
    addTransactionToHistory: AddTransactionToHistory
) => Promise<BlockchainConnection>;
export const initBlockchainConfiguration: InitBlockchainConfiguration = async (
    rpcUrl: string, 
    updateBlockchainConnection: UpdateBlockchainConnection,
    addAccount: AddAccount,
    selectAccount: SelectAccount,
    addTransactionToHistory: AddTransactionToHistory
): Promise<BlockchainConnection> => {
    let web3: Web3;
    let connectionType: ConnectionType = ConnectionType.None;
    if (rpcUrl) {
        web3 = new Web3(rpcUrl);
        connectionType = ConnectionType.Rpc;
    } else if ((window as any).ethereum) {
        web3 = new Web3((window as any).ethereum);
        await (window as any).ethereum.enable();
        connectionType = ConnectionType.Injected;
    } else if ((window as any).web3) {
        web3 = new Web3(web3.currentProvider);
        connectionType = ConnectionType.Injected;
    } else {
        web3 = new Web3();
    }
    
    const blockchainConnection: BlockchainConnection = {
        rpcUrl: rpcUrl ? rpcUrl : 'http://localhost:8545',
        connectionType,
        web3,
        updateBlockchainConnection,
        selectedAccount: null,
        addAccount,
        addTransactionToHistory,
        selectAccount: selectAccount,
        useDefaultAccount: true,
        transactionHistory: [],
        netVersion: null
    };

    if (connectionType !== ConnectionType.None) {
        blockchainConnection.netVersion = (await getNetVersion(blockchainConnection) as any).result;

    }

    return blockchainConnection;
    
};

type DecodeWeb3Result = (tupleAbi: any, web3Tuple: any, initJson?: any) => any;
export const decodeWeb3Result: DecodeWeb3Result = (tupleAbi: any, web3Tuple: any, initJson: any = {}): any => {

    let current: any;
    if (Object.keys(initJson).length === 0) {
        current = initJson;
    } else {
        initJson[tupleAbi.name] = {};
        current = initJson[tupleAbi.name];
    }
    
    if (tupleAbi.type.length >= 2 && tupleAbi.type.substr(tupleAbi.type.length - 2) === '[]') {
        return web3Tuple.map((arrayElement: any) => arrayElement);
    } else if (!tupleAbi.components) {
        return web3Tuple;
    }

    tupleAbi.components.forEach((component: any, index: number) =>
        component.type !== 'tuple' ? 
            current[component.name] = web3Tuple[component.name] : 
            decodeWeb3Result(component, web3Tuple[component.name], current)
        
    );

    return initJson;
};

type CallFunction = (
    contractFunction: Sol.ContractFunction,
    blockchainConnection: BlockchainConnection,
    contractAddress: string,
    abi: any,
    parameterMapping: any[]
) => Promise<any>;

export const callFunction: CallFunction =  async (
        contractFunction: Sol.ContractFunction,
        blockchainConnection: BlockchainConnection,
        contractAddress: string,
        abi: any,
        parameterMapping: any[]
    ): Promise<any> => {

        const name: string = contractFunction.name;
        const contract: any = new blockchainConnection.web3.eth.Contract(abi, contractAddress);
        const changedParamMapping: any[] = !parameterMapping ? [] : parameterMapping.map((param: any, index: number) => 
            contractFunction.params[index].solidityType.isArray ? JSON.parse(param) : param
        );

        const transportObject: any = blockchainConnection.selectedAccount ? { from: blockchainConnection.selectedAccount} : {};

        let result: any; 

        try {
            result = await contract.methods[name](...changedParamMapping).call(transportObject);
            if (typeof result !== 'object') {
                return [resultToOutput(result)];
            } else {
                const resultMapping: string[] = [];
                if (contractFunction.returnParams.length === 1) {
                    resultMapping[0] = JSON.stringify(
                        decodeWeb3Result(
                            abi[0].outputs[0],
                            result
                        ),
                        null,
                        4
                    );
                } else {
                    for (const index of Object.keys(contractFunction.returnParams)) {
                        const returnParam: any = contractFunction.returnParams[index];
                        resultMapping[index] = returnParam.solidityType.userDefined || returnParam.solidityType.isArray ? 
                            JSON.stringify(
                                decodeWeb3Result(
                                    abi[0].outputs[index],
                                    result[index]
                                ),
                                null,
                                4
                        ) : result[index].toString();
                    }
                }
                  
                return resultMapping;
            }
        
        } catch (e) {
            return e.message;

        }    
};

type SendFunction = (
    contractFunction: Sol.ContractFunction,
    blockchainConnection: BlockchainConnection,
    contractAddress: string,
    abi: any,
    parameterMapping: any[],
    value: string
) => Promise<any>;

export const sendFunction: SendFunction =  async (
    contractFunction: Sol.ContractFunction,
    blockchainConnection: BlockchainConnection,
    contractAddress: string,
    abi: any,
    parameterMapping: any[],
    value: string
): Promise<any> => {

    const name: string = contractFunction.name;
    const contract: any = new blockchainConnection.web3.eth.Contract(abi, contractAddress);

    let result: any;
    
    const changedParamMapping: any[] = !parameterMapping ? [] : parameterMapping.map((param: any, index: number) => 
        contractFunction.params[index].solidityType.isArray || contractFunction.params[index].solidityType.userDefined ? 
            JSON.parse(param) : param
    );

    const ethAccount: string = blockchainConnection.selectedAccount ? 
        blockchainConnection.selectedAccount : 
        (await blockchainConnection.web3.eth.getAccounts())[0];

    const gas: number = result = await contract.methods[name](...changedParamMapping).estimateGas({from: ethAccount });
    result = await contract.methods[name](...changedParamMapping).send({
        from: ethAccount,
        gas: Math.floor(gas * 1.5),
        value
    });

    blockchainConnection.addTransactionToHistory({
        result,
        time: (new Date()).toTimeString(),
        date: (new Date()).toDateString(),
        functionName: contractFunction.name,
        parameter: parameterMapping
    });

    return result;
   
};