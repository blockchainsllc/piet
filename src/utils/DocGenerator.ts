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

import * as Sol from '../solidity-handler/SolidityHandler';

type GenerateMarkdownDoc = (nodeElement: Sol.NodeElement) => string;

export const generateMarkdownDoc: GenerateMarkdownDoc = (nodeElement: Sol.NodeElement): string => {
    const contract: Sol.Contract = nodeElement.elementType === Sol.ElementType.Contract ? nodeElement as Sol.Contract : null;
    if (contract) {
        let output: string = '# ' + contract.name + '\n';

        output += contract.annotations
            .filter((annotation: Sol.SolidityAnnotation) => annotation.name === 'title')
            .map((annotation: Sol.SolidityAnnotation) => '*' + annotation.value.trim() + '*\n')
            .reduce((prev: string, current: string) => (prev + current), '');
        
        output += contract.functions.concat(contract.inheritedFunctions)
            .map((contractFunction: Sol.ContractFunction) => 
                '## ' + (contractFunction.name ? contractFunction.name : 'FALLBACK')  + '\n' +
                contractFunction.annotations
                    .filter((annotation: Sol.SolidityAnnotation) => annotation.name === 'notice')
                    .map((annotation: Sol.SolidityAnnotation) => '*' + annotation.value.trim() + '*\n')
                    .reduce((prev: string, current: string) => (prev + current), '') +
                (contractFunction.annotations.filter((annotation: Sol.SolidityAnnotation) => annotation.name === 'dev')
                    .length > 0 ? '\n**Development notice:**\n' : '') +
                contractFunction.annotations
                    .filter((annotation: Sol.SolidityAnnotation) => annotation.name === 'dev')
                    .map((annotation: Sol.SolidityAnnotation) => '*' + annotation.value.trim() + '*\n\n')
                    .reduce((prev: string, current: string) => (prev + current), '') +
                (contractFunction.params.length > 0 ? '\n**Parameters:**\n' : '') +
                contractFunction.params
                    .map((param: Sol.ContractFunctionParam) => { 
                        const paramAnnotation: Sol.SolidityAnnotation = contractFunction.annotations
                            .find((functionAnnotation: Sol.SolidityAnnotation) =>  
                                functionAnnotation.name === 'param' &&  functionAnnotation.subAnnotation.name === param.name
                            );
                        return '* ' + (param.name ? param.name + ' `' + param.solidityType.name + '`' : '`' + param.solidityType.name + '`')
                            + (paramAnnotation ? ': *' + paramAnnotation.subAnnotation.value.trim() + '*' : '') + '\n';
                    }).reduce((prev: string, current: string) => (prev + current), '') +
                (contractFunction.params.length > 0 ? '\n' : '') +
                (contractFunction.returnParams.length > 0 ? '**Return Parameters:**\n' : '') +
                contractFunction.returnParams
                    .map((param: Sol.ContractFunctionParam) => 
                    '* ' + (param.name ? param.name + ' `' + param.solidityType.name + '`' : '`' + param.solidityType.name + '`') + '\n'
                ).reduce((prev: string, current: string) => (prev + current), '')
            ).reduce((prev: string, current: string) => prev + current);
        return output;
    } else {
        return null;
    }
};