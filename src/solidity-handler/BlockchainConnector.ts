/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as Sol from './SolidityHandler';
import Web3Type from '../types/web3';
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
    web3: Web3Type;
    selectedAccount: string;
    updateBlockchainConnection: UpdateBlockchainConnection;
    addAccount: AddAccount;
    addTransactionToHistory: AddTransactionToHistory;
    selectAccount: SelectAccount;
    useDefaultAccount: boolean;
    transactionHistory: any[];
}

export const resultToOutput: (result: any) => string = (result: any): string => {
    if (typeof result !== 'object') {
        return result.toString();
    } else {
        
        return JSON.stringify({...result}, null, 2);
    }
};

type ChangeBlockchainConfiguration = (
    blockchainConnection: BlockchainConnection
) => Promise<BlockchainConnection>;

export const changeBlockchainConfiguration: ChangeBlockchainConfiguration = async (
    blockchainConnection: BlockchainConnection
): Promise<BlockchainConnection> => {

    const getFirstAccount: (web3: Web3Type) => Promise<string> = async (web3: Web3Type): Promise<string> =>  {
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
                proof: 'standard',
                signatureCount: 1,
                requestCount : 2,
                chainId: 'mainnet'
            }));
            blockchainConnection.selectedAccount = null;
            blockchainConnection.useDefaultAccount = true;
            return blockchainConnection;
        case ConnectionType.WebSocketRPC:
            blockchainConnection.web3 = new Web3(new Web3.providers.WebsocketProvider(blockchainConnection.rpcUrl));
            blockchainConnection.selectedAccount = await getFirstAccount(blockchainConnection.web3);
            return blockchainConnection;

        case ConnectionType.Rpc:
        
            blockchainConnection.web3 = new Web3(blockchainConnection.rpcUrl);
            blockchainConnection.selectedAccount = await getFirstAccount(blockchainConnection.web3);
            return blockchainConnection;

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
                blockchainConnection.web3 = null;
            }
            return blockchainConnection;
        default:
            blockchainConnection.web3 = null;
            return blockchainConnection;
    }
};

type InitBlockchainConfiguration = (
    connectionType: ConnectionType, 
    rpcUrl: string, 
    updateBlockchainConnection: UpdateBlockchainConnection,
    addAccount: AddAccount,
    selectAccount: SelectAccount,
    addTransactionToHistory: AddTransactionToHistory
) => Promise<BlockchainConnection>;
export const initBlockchainConfiguration: InitBlockchainConfiguration = async (
    connectionType: ConnectionType, 
    rpcUrl: string, 
    updateBlockchainConnection: UpdateBlockchainConnection,
    addAccount: AddAccount,
    selectAccount: SelectAccount,
    addTransactionToHistory: AddTransactionToHistory
): Promise<BlockchainConnection> => {
    let web3: Web3Type;
    if (rpcUrl) {
        web3 = new Web3(rpcUrl);
    } else if ((window as any).ethereum) {
        web3 = new Web3((window as any).ethereum);
        await (window as any).ethereum.enable();
    } else if ((window as any).web3) {
        web3 = new Web3(web3.currentProvider);
    }
    
    return {
        rpcUrl: rpcUrl ? rpcUrl : 'http://localhost:8545',
        connectionType,
        web3,
        updateBlockchainConnection,
        selectedAccount: null,
        addAccount,
        addTransactionToHistory,
        selectAccount: selectAccount,
        useDefaultAccount: true,
        transactionHistory: []
    };
    
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
    parameterMapping: any[]
) => Promise<any>;

export const sendFunction: SendFunction =  async (
    contractFunction: Sol.ContractFunction,
    blockchainConnection: BlockchainConnection,
    contractAddress: string,
    abi: any,
    parameterMapping: any[]
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
        gas: Math.floor(gas * 1.5)
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