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
import * as Sol from '../../../../solidity-handler/SolidityHandler';
import Web3Type from '../../../../types/web3';
import { Element, UICreationHandling } from '../UIStructure';
import { InputFunctionParams } from '../../../shared-elements/InputFunctionParams';
import { OutputFunctionParams } from '../../../shared-elements/OutputFunctionParams';
import { callFunction, sendFunction } from '../../../../solidity-handler/BlockchainConnector';

export type SelectElement = (element: Element) => void;
export interface FunctionModalProps {

    selectElement: SelectElement;
    selectedElement: Element;
    web3: Web3Type;
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
            resultMapping: []
        });
    }

    componentWillReceiveProps(): void {
        this.setState({
            parameterMapping: [],
            resultMapping: []
        });
    }


    hideFunctionBox(): void {
        this.props.selectElement(null);
    }

    parameterChange(e: any, index: number): void {
        
        e.persist();
        this.setState((prevState: FunctionModalState) => {
            prevState.parameterMapping[index] = e.target.value;
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
                this.props.web3,
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
                        this.props.web3,
                        this.props.selectedElement.contractAddress,
                        this.props.selectedElement.abi,
                        this.state.parameterMapping,
                        this.props.uiCreationHandling.ethAccount
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
                    contractFunctionName={this.props.selectedElement.functionName}
                    index={index}
                    inputParameterChange={(e) => this.parameterChange(e, index)}
                    interactiveMode={true}
                    parameter={param}
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