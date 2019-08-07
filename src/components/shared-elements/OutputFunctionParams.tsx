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

import * as React from 'react';
import { ContractFunctionParam, Contract } from '../../solidity-handler/SolidityHandler';

export type OutputParameterChange = (event: any, index: number, contractFunctionName: string) => void;

export interface OutputFunctionParamsProps {
    contractAddress: string;

    contractFunctionName: string;
    parameter: ContractFunctionParam;
    interactiveMode: boolean;
    index: number;
    resultMapping: any[];
}

export class OutputFunctionParams extends React.Component<OutputFunctionParamsProps, {}> {

   render(): JSX.Element {

        const value: string = this.props.resultMapping[this.props.contractFunctionName] 
            && this.props.resultMapping[this.props.contractFunctionName][this.props.index] ? 
            this.props.resultMapping[this.props.contractFunctionName][this.props.index] 
            : '';

        return  <div 
                className='param' 
                key={'returnParam' 
                    + this.props.contractAddress 
                    + this.props.contractFunctionName 
                    + this.props.parameter.name 
                    + this.props.index}
            >
            <i className='far fa-arrow-alt-circle-left' aria-hidden='true'></i>&nbsp;
            <strong>{this.props.parameter.name}</strong><small>&nbsp;{this.props.parameter.solidityType.name}</small>
            { this.props.interactiveMode && this.props.contractAddress != null ?
                <div className='param-content'>
                { !this.props.parameter.solidityType.userDefined && !this.props.parameter.solidityType.isArray  ? 
                    <input
                        className='form-control form-control-sm input-output'
                        type='text'
                        disabled
                        value={value} 
                    /> : 
                    <textarea
                        className='form-control form-control-sm input-output'
                        disabled
                        rows={(value.match(/\n/g) || []).length + 1}
                        value={value} 
                    /> 

                }
                </div> 
                : null 
            }
        </div>;

   }

}