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
                        className='form-control form-control-sm'
                        type='text'
                        disabled
                        value={value} 
                    /> : 
                    <textarea
                        className='form-control form-control-sm'
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