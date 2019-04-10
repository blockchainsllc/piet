/**
 * this file is part of bundesblock-voting
 *
 * it is subject to the terms and conditions defined in
 * the 'LICENSE' file, which is part of the repository.
 *
 * @author Heiko Burkhardt
 * @copyright 2018 by Slock.it GmbH
 */

import * as Sol from '../solidity-handler/SolidityHandler';
import Web3Type from '../types/web3';
import { ContractEnumeration } from '../solidity-handler/SolidityHandler';

export const isSameFunction: (firstFunctionAbi: any[], secondFunctionAbi: any[], web3: Web3Type) => boolean = 
    (firstFunctionAbi: any[], secondFunctionAbi: any[], web3: Web3Type): boolean => {
        const firstSignature: string = firstFunctionAbi.length === 1 ? 
            web3.eth.abi.encodeFunctionSignature(firstFunctionAbi[0]) : 
            null;
        const secondSignature: string = secondFunctionAbi.length === 1 ? 
            web3.eth.abi.encodeFunctionSignature(secondFunctionAbi[0]) : 
            null;
        
        return firstSignature && secondSignature && (firstSignature === secondSignature);

}

export const getFunctionId = (contract: Sol.Contract, web3: Web3Type, contractFunction: Sol.ContractFunction): string => {
    const id: string = 'function' + contract.name + contractFunction.name + contractFunction.params
        .map((param: Sol.ContractFunctionParam) => param.name + param.solidityType.name)
        .reduce((previous, current) => previous + current, '');

    return web3.utils.sha3(id);
}

export const getFunctionAbi: (theFunction: Sol.ContractFunction, web3: Web3Type, contracts: Sol.Contract[], contextContract: Sol.Contract) => any  = 
    (theFunction: Sol.ContractFunction, web3: Web3Type, contracts: Sol.Contract[], contextContract: Sol.Contract): any => {

        const functionAbi: any = {
            name: theFunction.name,
            type: 'function',
            inputs: getInAndOutputs(theFunction.params, contracts, contextContract),
            outputs: getInAndOutputs(theFunction.returnParams, contracts, contextContract)
        };
        
        return [functionAbi];
    };

const evaluateStruct = (theStruct: Sol.ContractStruct, contracts: Sol.Contract[], contextContract: Sol.Contract, paramName: string, initSolType: string ) => {

    return {
        components: 
            theStruct.fields.map((field: Sol.ContractStateVariable) => {
                const solType: string = checkType(field.solidityType, contracts, contextContract);
                if (solType === 'tuple') {
                    const childStruct: Sol.ContractStruct = getStructForTuple(field.solidityType, contracts, contextContract);
                    return evaluateStruct(childStruct, contracts, contextContract, field.name, solType);
                } 
                return {
                    name: field.name,
                    type: solType
                };
            })
        ,
        name: paramName === null || paramName === undefined ? '' : paramName,
        type: initSolType

    };

};

const getInAndOutputs = (params: Sol.ContractFunctionParam[], contracts: Sol.Contract[], contextContract: Sol.Contract): any[] => {
    return params.map((param: Sol.ContractFunctionParam) => {
        const solType: string = checkType(param.solidityType, contracts, contextContract);
        if (solType === 'tuple') {
            
            const theStruct: Sol.ContractStruct = getStructForTuple(param.solidityType, contracts, contextContract);

            return evaluateStruct(theStruct, contracts, contextContract, param.name, solType);
        } 
        return {
            type: solType,
            name: param.name === null || param.name === undefined ? '' : param.name 
        };
        
    });
};

export const getEventAbi: (theEvent: Sol.ContractEvent, web3: Web3Type, contracts: Sol.Contract[], contextContract: Sol.Contract) => any = 
    (theEvent: Sol.ContractEvent, web3: Web3Type, contracts: Sol.Contract[], contextContract: Sol.Contract): any => {

        const eventAbi: any = {
            name: theEvent.name,
            type: 'event',
            anonymous: false,
            inputs: theEvent.params.map((param: Sol.ContractFunctionParam) => ({
                type: checkType(param.solidityType, contracts, contextContract),
                indexed: param.isIndexed,
                name: param.name
            }))
        };

        return [eventAbi];
    };

const checkType: (solidityType: Sol.SolidityType, contracts: Sol.Contract[], contextContract: Sol.Contract, resolveArray?: boolean) => string =
    (solidityType: Sol.SolidityType, contracts: Sol.Contract[], contextContract: Sol.Contract, resolveArray?: boolean): string => {
        if (solidityType.userDefined) {
            if (contracts.find((contract: Sol.Contract) => contract.name === solidityType.name)) {
                return 'address';
            } else if (contracts.find((contract: Sol.Contract) => 
                contract.enumerations.find((enumeration: ContractEnumeration) => 
                    enumeration.name === solidityType.name || enumeration.name === contract.name + '.' + solidityType.name
                    ) !== undefined)
            ) {
                return 'uint8';
            } else {   
                return 'tuple';
                // throw Error('User defined types are not yet supported.');
            }

        } else {
            const name: string = solidityType.isArray ? solidityType.pureName : solidityType.name;
            switch (name) {
                case 'uint':
                    return solidityType.isArray && !resolveArray ? 'uint256[]' : 'uint256';
                case 'byte':
                    return solidityType.isArray && !resolveArray ? 'bytes1[]' : 'bytes1';
                default:
                    return solidityType.isArray && !resolveArray ? solidityType.pureName + '[]' : solidityType.name;
            }
        }

    };

const getStructForTuple = (solidityType: Sol.SolidityType, contracts: Sol.Contract[], contextContract: Sol.Contract): Sol.ContractStruct => {
    const namePath: string[] = solidityType.name.split('.');
    let definedInContract: Sol.Contract = null;

    switch (namePath.length) {
        case 1:
            definedInContract = contextContract;
            break;
        case 2:
            definedInContract = contracts.find((contract: Sol.Contract) => contract.name === namePath[0]);
            break;
        default: 
            throw Error('Name path error');
    }

    return definedInContract.structs.find((contractStruct: Sol.ContractStruct) => 
        contractStruct.shortName === (solidityType.pureName ? solidityType.pureName : solidityType.name));

}