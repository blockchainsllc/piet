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

import * as Sol from '../solidity-handler/SolidityHandler';
import { BlockchainConnection} from '../solidity-handler/BlockchainConnector';
import { contractElementLink } from '../components/views/Graph/JointElements';

export const isSameFunction = 
    (firstFunctionAbi: any[], secondFunctionAbi: any[], blockchainConnection: BlockchainConnection): boolean => {
        const firstSignature: string = firstFunctionAbi.length === 1 ? 
            blockchainConnection.web3.eth.abi.encodeFunctionSignature(firstFunctionAbi[0]) : 
            null;
        const secondSignature: string = secondFunctionAbi.length === 1 ? 
            blockchainConnection.web3.eth.abi.encodeFunctionSignature(secondFunctionAbi[0]) : 
            null;
        
        return firstSignature && secondSignature && (firstSignature === secondSignature);

}

export const getFunctionId = (
    contract: Sol.Contract, 
    blockchainConnection: BlockchainConnection,
    contractFunction: Sol.ContractFunction
): string => {
    const id: string = 'function' + contract.name + contractFunction.name + contractFunction.params
        .map((param: Sol.ContractFunctionParam) => param.name + param.solidityType.name)
        .reduce((previous, current) => previous + current, '');

    return blockchainConnection.web3.utils.sha3(id);
};

type GetFunctionAbi = (
    theFunction: Sol.ContractFunction,
    contracts: Sol.Contract[], 
    contextContract: Sol.Contract
) => any;

export const getFunctionAbi: GetFunctionAbi  = (
    theFunction: Sol.ContractFunction,
    contracts: Sol.Contract[], 
    contextContract: Sol.Contract
) : any => {

        const functionAbi: any = {
            name: theFunction.name,
            type: 'function',
            inputs: getInAndOutputs(theFunction.params, contracts, contextContract),
            outputs: getInAndOutputs(theFunction.returnParams, contracts, contextContract)
        };
        return [functionAbi];
    };

export const getStateVariableAbi: (theFunction: Sol.ContractFunction, contracts: Sol.Contract[], contextContract: Sol.Contract) => any  = 
    (theFunction: Sol.ContractFunction, contracts: Sol.Contract[], contextContract: Sol.Contract): any => {

        const functionAbi: any = {
            name: theFunction.name,
            type: 'function',
            inputs: getInAndOutputs(theFunction.params, contracts, contextContract),
            outputs: getInAndOutputs(theFunction.returnParams, contracts, contextContract)
        };
        // if (functionAbi.outputs[0].type && functionAbi.outputs[0].type === 'tuple') {
        //     functionAbi.outputs = functionAbi.outputs[0].components;
        // } 
        
        return [functionAbi];
    };

const evaluateStruct = (theStruct: Sol.ContractStruct, contracts: Sol.Contract[], contextContract: Sol.Contract, paramName: string, initSolType: string ) => {

    return {
        components: 
            theStruct.fields.map((field: Sol.ContractStateVariable) => {
                const solType: string = checkType(field.solidityType, contracts, contextContract);
                if (solType === 'tuple') {
                    const childStruct: Sol.ContractStruct = searchContractMember<Sol.ContractStruct>(
                        'structs',
                        field.solidityType,
                        contextContract,
                        contracts
                    );
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
            
            const theStruct: Sol.ContractStruct = searchContractMember<Sol.ContractStruct>(
                'structs',
                param.solidityType,
                contextContract,
                contracts
            );

            return evaluateStruct(theStruct, contracts, contextContract, param.name, solType);
        } 
        return {
            type: solType,
            name: param.name === null || param.name === undefined ? '' : param.name 
        };
        
    });
};

export const getEventAbi = (
    theEvent: Sol.ContractEvent,
    contracts: Sol.Contract[],
    contextContract: Sol.Contract
): any => {

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

const searchContractMember = <T extends Sol.NodeElement> (
    propertyKey: keyof Sol.Contract,
    solidityType: Sol.SolidityType,
    contextContract: Sol.Contract,
    contracts: Sol.Contract[]
): T => {
    const name: string = solidityType.isArray ? solidityType.name.slice(0, solidityType.name.length - 2)  : solidityType.name;
    
    let member: T = 
        contextContract[propertyKey].find((theMember: T) => theMember.shortName === name);
    if (member) {
        return member;
    }

    contextContract.baseContracts.forEach((contractName: string) => {
        const theMember: T = searchContractMember<T>(
            propertyKey,
            solidityType,
            contracts.find((aContract: Sol.Contract) => aContract.name === contractName),
            contracts
        );
        member = theMember ? theMember : member;
    });
    if (member) {
        return member;
    }

    contracts.forEach((aContract: Sol.Contract) => {
        const theMember: T = aContract[propertyKey].find((aMember: T) => aMember.name === name);
        member = theMember ? theMember : member;
    });
    if (member) {
        return member;
    }
    return null;

};

const checkType: (solidityType: Sol.SolidityType, contracts: Sol.Contract[], contextContract: Sol.Contract, resolveArray?: boolean) => string =
    (solidityType: Sol.SolidityType, contracts: Sol.Contract[], contextContract: Sol.Contract, resolveArray?: boolean): string => {
        if (solidityType.userDefined) {
            if (searchContractMember<Sol.ContractStruct>('structs', solidityType, contextContract, contracts)) {
                return 'tuple';
            } else if (searchContractMember<Sol.ContractEnumeration>('enumerations', solidityType, contextContract, contracts)) {
                return 'uint8';
            } else if (contracts.find((contract: Sol.Contract) => contract.name === solidityType.name)) {
                return 'address';
            }  else {   
                console.log('ERROR' + solidityType.name);
                throw Error('Unknow Type');
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
