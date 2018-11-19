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

export const getFunctionAbi: (theFunction: Sol.ContractFunction, web3: Web3Type, contracts: Sol.Contract[]) => any  = 
    (theFunction: Sol.ContractFunction, web3: Web3Type, contracts: Sol.Contract[]): any => {

        const functionAbi: any = {
            name: theFunction.name,
            type: 'function',
            inputs: theFunction.params.map((param: Sol.ContractFunctionParam) => ({
                type: checkType(param.solidityType, contracts),
                name: param.name
            })),
            outputs: theFunction.returnParams.map((param: Sol.ContractFunctionParam) => ({
                type: checkType(param.solidityType, contracts),
                name: param.name
            }))
        };
        
        return [functionAbi];
    };

export const getStateVariableAbi: (theStateVariable: Sol.ContractStateVariable, web3: Web3Type, contracts: Sol.Contract[]) => any = 
    (theStateVariable: Sol.ContractStateVariable, web3: Web3Type, contracts: Sol.Contract[]): any => {

        let stateVariableAbi: any;

        if (theStateVariable.solidityType.mapping) {
            stateVariableAbi = {
                constant: true,
                name: theStateVariable.name,
                type: 'function',
                inputs: [{
                    type: checkType(theStateVariable.solidityType.mapping.key, contracts),
                    name: ''
                }],
                outputs: [{
                    type: checkType(theStateVariable.solidityType.mapping.value, contracts),
                    name: ''
                }]
            };

        } else if (theStateVariable.solidityType.isArray) {
            stateVariableAbi = {
                constant: true,
                name: theStateVariable.name,
                type: 'function',
                inputs: [{
                    name: '',
                    type: 'uint256'
                }],
                outputs: [{
                    type: checkType(theStateVariable.solidityType, contracts),
                    name: ''
                }]
            };

        } else {

            stateVariableAbi = {
                constant: true,
                name: theStateVariable.name,
                type: 'function',
                inputs: [],
                outputs: [{
                    type: checkType(theStateVariable.solidityType, contracts),
                    name: ''
                }]
            };
        }

        return [stateVariableAbi];
    };

export const getEventAbi: (theEvent: Sol.ContractEvent, web3: Web3Type, contracts: Sol.Contract[]) => any = 
    (theEvent: Sol.ContractEvent, web3: Web3Type, contracts: Sol.Contract[]): any => {

        const eventAbi: any = {
            name: theEvent.name,
            type: 'event',
            anonymous: false,
            inputs: theEvent.params.map((param: Sol.ContractFunctionParam) => ({
                type: checkType(param.solidityType, contracts),
                indexed: param.isIndexed,
                name: param.name
            }))
        };

        return [eventAbi];
    };

const checkType: (solidityType: Sol.SolidityType, contracts: Sol.Contract[]) => string =
    (solidityType: Sol.SolidityType, contracts: Sol.Contract[]): string => {
        if (solidityType.userDefined) {
            if (contracts.find((contract: Sol.Contract) => contract.name === solidityType.name)) {
                return 'address';
            } else {
                throw Error('User defined types are not yet supported.');
            }

        } else {
            const name: string = solidityType.isArray ? solidityType.pureName : solidityType.name;
            switch (name) {
                case 'uint':
                    return 'uint256';
                case 'byte':
                    return 'bytes1';
                default:
                    return solidityType.name;
            }
        }

    };
