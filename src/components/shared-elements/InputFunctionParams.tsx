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

export type InputParameterChange = (event: any, index: number, contractFunctionName: string) => void;

export interface InputFunctionParamsProps {
    contract: Contract;
    contractFunctionName: string;
    parameter: ContractFunctionParam;
    interactiveMode: boolean;
    inputParameterChange: InputParameterChange;
    index: number;
}

export class InputFunctionParams extends React.Component<InputFunctionParamsProps, {}> {

   render(): JSX.Element {
      
       return  <div key={'param' + this.props.contract.name + this.props.parameter.name} className='param'>
            <i className='fas fa-arrow-circle-right' aria-hidden='true'></i>&nbsp;
            <strong>{this.props.parameter.name}</strong> <small>&nbsp;{this.props.parameter.solidityType.name}</small>
            {this.props.parameter.description !== '' ? 
                <div className='param-content'>
                    <i className='text-muted'>{this.props.parameter.description }</i>
                </div> 
            : null}
            {this.props.interactiveMode && this.props.contract.deployedAt != null ?
            <div className='param-content'>
                <input  onChange={(e) => this.props.inputParameterChange(e, this.props.index, this.props.contractFunctionName)}
                    className='form-control form-control-sm' type='text' />
            </div> : null }
        </div>;

   }

}