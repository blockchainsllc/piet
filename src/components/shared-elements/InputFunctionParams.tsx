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

import * as React from 'react';
import { ContractFunctionParam, Contract, ContractFunction } from '../../solidity-handler/SolidityHandler';
import { BlockchainConnection, utf8ToHex } from '../../solidity-handler/BlockchainConnector';

export type InputParameterChange = (input: string, index: number, contractFunction: ContractFunction) => void;

export interface InputFunctionParamsProps {
    contractAddress: string;
    contractFunction: ContractFunction;
    parameter: ContractFunctionParam;
    interactiveMode: boolean;
    inputParameterChange: InputParameterChange;
    index: number;
    blockchainConnection: BlockchainConnection;
}

export class InputFunctionParams extends React.Component<InputFunctionParamsProps, {}> {

    constructor(props: InputFunctionParamsProps) {
        super(props);

        this.onHexChange = this.onHexChange.bind(this);
        this.onUTF8Change = this.onUTF8Change.bind(this);

    }

    onHexChange(e: any): void {
        e.persist();
        this.props.inputParameterChange(e.target.value, this.props.index, this.props.contractFunction);
    }

    onUTF8Change(e: any): void {
        e.persist();
        this.props.inputParameterChange(
            utf8ToHex(this.props.blockchainConnection, e.target.value),
            this.props.index,
            this.props.contractFunction
        );
    }

   render(): JSX.Element {

        const isBytes: boolean = this.props.parameter.solidityType.name.startsWith('bytes');
      
        return  <div className='param'>
            <i className='fas fa-arrow-circle-right' aria-hidden='true'></i>&nbsp;
            <strong>{this.props.parameter.name}</strong> <small>&nbsp;{this.props.parameter.solidityType.name}</small>
            {this.props.parameter.description !== '' ? 
                <div className='param-content'>
                    <i className='text-muted'>{this.props.parameter.description }</i>
                </div> 
            : null}
            {this.props.interactiveMode && this.props.contractAddress != null ?
            <div className='param-content'>
            
            { isBytes && 
                <input onChange={this.onUTF8Change}
                className='form-control form-control-sm input-output' type='text' placeholder='UTF-8 Input' />
            }
                { this.props.parameter.solidityType.userDefined || this.props.parameter.solidityType.isArray ? 
                    <textarea onChange={this.onHexChange}
                        className='form-control form-control-sm input-output' placeholder={isBytes ? 'Hex Input' : ''} /> :
                    <input onChange={this.onHexChange}
                        className='form-control form-control-sm input-output' type='text' placeholder={isBytes ? 'Hex Input' : ''} />
                }
                
            </div> : null }
        </div>;

   }

}