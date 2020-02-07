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
import * as Sol from '../../../../solidity-handler/SolidityHandler';
import { Element, UICreationHandling } from '../UIStructure';
import { InputFunctionParams } from '../../../shared-elements/InputFunctionParams';
import { OutputFunctionParams } from '../../../shared-elements/OutputFunctionParams';
import { callFunction, sendFunction, BlockchainConnection } from '../../../../solidity-handler/BlockchainConnector';
import { isSameFunction } from '../../../../utils/AbiGenerator';

export type SelectElement = (element: Element) => void;
export interface FunctionModalProps {

    selectElement: SelectElement;
    selectedElement: Element;
    blockchainConnection: BlockchainConnection;
    uiCreationHandling: UICreationHandling;
    updateAll: Function;

}

interface FunctionModalState {

    parameterMapping: any[];
    resultMapping: any[];
    result: string;
    error: string;

}

export class FunctionModal extends React.Component<FunctionModalProps, FunctionModalState> {

    constructor(props: FunctionModalProps) {
        super(props);

        this.state = {
            parameterMapping: [],
            resultMapping: [],
            result: null,
            error: null
        };

        this.hideFunctionBox = this.hideFunctionBox.bind(this);
        this.executeFunction = this.executeFunction.bind(this);
        this.parameterChange = this.parameterChange.bind(this);
    }

    componentDidMount(): void {
        this.setState({
            parameterMapping: [],
            resultMapping: [],
            result: null,
            error: null
        });
    }

    componentWillReceiveProps(newProps: FunctionModalProps): void {

        if (!this.props.selectedElement 
            || !newProps.selectedElement 
            || (newProps.selectedElement.contractAddress !== this.props.selectedElement.contractAddress)
            || !isSameFunction(newProps.selectedElement.abi, this.props.selectedElement.abi, newProps.blockchainConnection)
        ) {
            this.setState({
                parameterMapping: [],
                resultMapping: [],
                result: null,
                error: null
                
            });
       } 
        
    }

    hideFunctionBox(): void {
        this.props.selectElement(null);
    }

    parameterChange(input: string, index: number): void {
        
        this.setState((prevState: FunctionModalState) => {
            prevState.parameterMapping[index] = input;
            return {parameterMapping: prevState.parameterMapping};
        });

    }

    async executeFunction(): Promise<void> {
        
        
        this.setState({
            result: null,
            error: null
        });

        if ((this.props.selectedElement.data.contractFunction as Sol.ContractFunction).modifiers
            .find((modifier: string) => modifier === 'view' || modifier === 'constant' || modifier === 'pure')
        ) {
            const resultMapping: any[] = await callFunction(
                this.props.selectedElement.data.contractFunction,
                this.props.blockchainConnection,
                this.props.selectedElement.contractAddress,
                this.props.selectedElement.abi,
                this.state.parameterMapping
            );
        
            this.setState((prevSate: FunctionModalState) => ({
                resultMapping: resultMapping
            }));
        } else {
            
            try {
                this.setState({
                    result: await sendFunction(
                        this.props.selectedElement.data.contractFunction,
                        this.props.blockchainConnection,
                        this.props.selectedElement.contractAddress,
                        this.props.selectedElement.abi,
                        this.state.parameterMapping,
                        null
                    )
                });
                this.props.updateAll();

            } catch (e) {
                this.setState({
                    error: e.message
                });
            }
            
        }
  
    }

    render(): JSX.Element {
        if (!this.props.selectedElement) {
            return null;
        }

        const params: JSX.Element[] = this.props.selectedElement.data.contractFunction.params
            .map((param: Sol.ContractFunctionParam, index: number) => 
                
                <InputFunctionParams 
                    key={'param' + this.props.selectedElement.contractAddress + this.props.selectedElement.functionName + param.name}
                    contractAddress={this.props.selectedElement.contractAddress}
                    contractFunction={null}
                    index={index}
                    inputParameterChange={this.parameterChange}
                    interactiveMode={true}
                    parameter={param}
                    blockchainConnection={this.props.blockchainConnection}
                />
                
            );

        const resultMapping: any[] = [];
        resultMapping[this.props.selectedElement.functionName] = this.state.resultMapping;

        const returnParams: JSX.Element[] = this.props.selectedElement.data.contractFunction.returnParams
            .map((param: Sol.ContractFunctionParam, index: number) => 
                
                    <OutputFunctionParams 
                        key={'returnParam' 
                            + this.props.selectedElement.contractAddress
                            + this.props.selectedElement.functionName
                            + param.name 
                            + index
                        }
                        resultMapping={resultMapping}
                        index={index}
                        contractFunctionName={this.props.selectedElement.functionName}
                        contractAddress={this.props.selectedElement.contractAddress}
                        interactiveMode={true}
                        parameter={param}
                    />
                
            );
 
        return <div className='row ui-creation-row'>
            <div className='col-sm'>
                <div className='card ui-function'>
                    <div className='card-body'>
                        <div className='d-flex w-100 justify-content-between full-block'>
                            <h3>{this.props.selectedElement.data.label}</h3>
                            <a onClick={() => this.props.selectElement(null)} href='#' >         
                                <i className='fas fa-times'></i>
                            </a>
                        </div>
                        <div className='card-text ui-creation-value'>
                            {params}
                            {returnParams}
                        </div>
                        <div className='text-right'>
                            <button
                                type='button'
                                className='btn btn-primary btn-sm' 
                                onClick={this.executeFunction}
                            >
                                Execute
                            </button>
                        </div>

                        { this.state.result && 
                            <div className='alert alert-success function-exec-msg' role='alert'>
                                {this.state.result}
                            </div>
                        }
                        { this.state.error && 
                            <div className='alert alert-danger function-exec-msg' role='alert'>
                                {this.state.error}
                            </div>
                        }
                        

        
                        
                    </div>
                </div>
            </div>
        </div>;

    }

}