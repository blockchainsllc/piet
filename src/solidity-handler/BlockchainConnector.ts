/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as React from 'react';
import * as Sol from './SolidityHandler';
import { getFunctionAbi } from '../utils/AbiGenerator';
import Web3Type from '../types/web3';

export const callFunction: (
        contractFunction: Sol.ContractFunction,
        web3: Web3Type,
        contractAddress: string,
        abi: any,
        parameterMapping: any[]
        
    ) => Promise<any> =  async (
        contractFunction: Sol.ContractFunction,
        web3: Web3Type,
        contractAddress: string,
        abi: any,
        parameterMapping: any[]
    ): Promise<any> => {

        const name: string = contractFunction.name;
        const contract: any = new web3.eth.Contract(abi, contractAddress);
        const changedParamMapping: any[] = parameterMapping.map((param: any, index: number) => 
            contractFunction.params[index].solidityType.isArray ? JSON.parse(param) : param
        );

        let result: any; 

        try {
            result = await contract.methods[name](...changedParamMapping).call();
            
            if (typeof result !== 'object') {
                return result.toString();
            } else {
                const resultMapping: string[] = [];
                
                for (const index of Object.keys(contractFunction.returnParams)) {
                    resultMapping[index] = result[index].toString();
                }

                return resultMapping;
            }
        
            result = typeof result === 'object' ? JSON.stringify(result) : result.toString();

        } catch (e) {
            return e.message;

        }    
};

export const sendFunction: (
    contractFunction: Sol.ContractFunction,
    web3: Web3Type,
    contractAddress: string,
    abi: any,
    parameterMapping: any[],
    ethAccount: string
    
) => Promise<any> =  async (
    contractFunction: Sol.ContractFunction,
    web3: Web3Type,
    contractAddress: string,
    abi: any,
    parameterMapping: any[],
    ethAccount: string
): Promise<any> => {

    const name: string = contractFunction.name;
    const contract: any = new web3.eth.Contract(abi, contractAddress);

    let result: any;
    
    const changedParamMapping: any[] = parameterMapping.map((param: any, index: number) => 
        contractFunction.params[index].solidityType.isArray ? JSON.parse(param) : param
    );

    const gas: number = result = await contract.methods[name](...changedParamMapping).estimateGas({from: ethAccount });
    result = await contract.methods[name](...changedParamMapping).send({
        from: ethAccount,
        gas: Math.floor(gas * 1.5)
    });

    return result.transactionHash;
   
};