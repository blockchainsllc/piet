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
import { ContractFunctionParam, Contract } from '../../solidity-handler/SolidityHandler';
import Web3Type from '../../types/web3';

export type InputParameterChange = (input: string, index: number, contractFunctionName: string) => void;

export interface InputFunctionParamsProps {
    contractAddress: string;
    contractFunctionName: string;
    parameter: ContractFunctionParam;
    interactiveMode: boolean;
    inputParameterChange: InputParameterChange;
    index: number;
    web3: Web3Type;
}

    
export class InputFunctionParams extends React.Component<InputFunctionParamsProps, {}> {

    constructor(props: InputFunctionParamsProps) {
        super(props);

        this.onHexChange = this.onHexChange.bind(this);
        this.onUTF8Change = this.onUTF8Change.bind(this);

    }

    onHexChange(e: any): void {
        e.persist();
        this.props.inputParameterChange(e.target.value, this.props.index, this.props.contractFunctionName);
    }

    onUTF8Change(e: any): void {
        e.persist();
        this.props.inputParameterChange(
            (this.props.web3.utils as any).utf8ToHex(e.target.value),
            this.props.index,
            this.props.contractFunctionName
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
                className='form-control form-control-sm' type='text' placeholder='UTF-8 Input' />
            }
                <input onChange={this.onHexChange}
                    className='form-control form-control-sm' type='text' placeholder={isBytes ? 'Hex Input' : ''} />
            </div> : null }
        </div>;

   }

}