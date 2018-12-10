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

        let result: any; 

        try {
            result = await contract.methods[name](...parameterMapping).call();
            
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